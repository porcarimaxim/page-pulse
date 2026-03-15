"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

function cropPng(png: PNG, left: number, top: number, width: number, height: number): PNG {
  const cropped = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = ((top + y) * png.width + (left + x)) * 4;
      const dstIdx = (y * width + x) * 4;
      cropped.data[dstIdx] = png.data[srcIdx];
      cropped.data[dstIdx + 1] = png.data[srcIdx + 1];
      cropped.data[dstIdx + 2] = png.data[srcIdx + 2];
      cropped.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  return cropped;
}

function resizePng(png: PNG, targetWidth: number, targetHeight: number): PNG {
  const resized = new PNG({ width: targetWidth, height: targetHeight });
  const xRatio = png.width / targetWidth;
  const yRatio = png.height / targetHeight;
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor(x * xRatio);
      const srcY = Math.floor(y * yRatio);
      const srcIdx = (srcY * png.width + srcX) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      resized.data[dstIdx] = png.data[srcIdx];
      resized.data[dstIdx + 1] = png.data[srcIdx + 1];
      resized.data[dstIdx + 2] = png.data[srcIdx + 2];
      resized.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  return resized;
}

export const cropAndCompare = internalAction({
  args: {
    monitorId: v.id("monitors"),
    fullStorageId: v.id("_storage"),
    previousCroppedStorageId: v.optional(v.id("_storage")),
    zone: v.object({
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
    }),
    sensitivityThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const t0 = Date.now();
    const label = `[cropAndCompare]`;

    // 1. Fetch the full screenshot
    const fullUrl = await ctx.storage.getUrl(args.fullStorageId);
    if (!fullUrl) throw new Error("Full screenshot not found");

    const t1 = Date.now();
    const fullResponse = await fetch(fullUrl);
    const fullBuffer = Buffer.from(await fullResponse.arrayBuffer());
    console.log(`${label} fetch full screenshot: ${Date.now() - t1}ms (${fullBuffer.length} bytes)`);

    // 2. Decode PNG and crop to zone
    const tDecode = Date.now();
    const fullPng = PNG.sync.read(fullBuffer);
    console.log(`${label} decode PNG: ${Date.now() - tDecode}ms (${fullPng.width}x${fullPng.height})`);

    const imgWidth = fullPng.width;
    const imgHeight = fullPng.height;

    const left = Math.round((args.zone.x / 100) * imgWidth);
    const top = Math.round((args.zone.y / 100) * imgHeight);
    const width = Math.min(Math.round((args.zone.width / 100) * imgWidth), imgWidth - left);
    const height = Math.min(Math.round((args.zone.height / 100) * imgHeight), imgHeight - top);

    const tCrop = Date.now();
    const croppedPng = cropPng(fullPng, left, top, width, height);
    const croppedBuffer = PNG.sync.write(croppedPng);
    console.log(`${label} crop + encode: ${Date.now() - tCrop}ms (${width}x${height} → ${croppedBuffer.length} bytes)`);

    const tStore = Date.now();
    const croppedBlob = new Blob([croppedBuffer], { type: "image/png" });
    const croppedStorageId = await ctx.storage.store(croppedBlob);
    console.log(`${label} store cropped: ${Date.now() - tStore}ms`);

    // 3. If no previous snapshot, just return the cropped image (first run)
    if (!args.previousCroppedStorageId) {
      console.log(`${label} no previous snapshot — first run, total: ${Date.now() - t0}ms`);
      return {
        croppedStorageId,
        fullStorageId: args.fullStorageId,
        changed: false,
        diffPercentage: 0,
        diffStorageId: null,
      };
    }

    // 4. Fetch previous cropped screenshot for comparison
    const prevUrl = await ctx.storage.getUrl(args.previousCroppedStorageId);
    if (!prevUrl) {
      console.log(`${label} previous screenshot URL missing, total: ${Date.now() - t0}ms`);
      return {
        croppedStorageId,
        fullStorageId: args.fullStorageId,
        changed: false,
        diffPercentage: 0,
        diffStorageId: null,
      };
    }

    const tPrev = Date.now();
    const prevResponse = await fetch(prevUrl);
    const prevBuffer = Buffer.from(await prevResponse.arrayBuffer());
    console.log(`${label} fetch previous screenshot: ${Date.now() - tPrev}ms (${prevBuffer.length} bytes)`);

    // 5. Resize previous to match current dimensions (in case viewport changed)
    const cw = croppedPng.width;
    const ch = croppedPng.height;
    const tPrevDecode = Date.now();
    const prevPng = PNG.sync.read(prevBuffer);
    console.log(`${label} decode previous PNG: ${Date.now() - tPrevDecode}ms (${prevPng.width}x${prevPng.height})`);

    const needsResize = prevPng.width !== cw || prevPng.height !== ch;
    let resizedPrev: PNG;
    if (needsResize) {
      const tResize = Date.now();
      resizedPrev = resizePng(prevPng, cw, ch);
      console.log(`${label} resize previous: ${Date.now() - tResize}ms (${prevPng.width}x${prevPng.height} → ${cw}x${ch})`);
    } else {
      resizedPrev = prevPng;
    }

    // 6. Run pixelmatch
    const tMatch = Date.now();
    const diffPng = new PNG({ width: cw, height: ch });

    const numDiffPixels = pixelmatch(
      resizedPrev.data,
      croppedPng.data,
      diffPng.data,
      cw,
      ch,
      { threshold: 0.1 }
    );
    console.log(`${label} pixelmatch: ${Date.now() - tMatch}ms (${cw}x${ch} = ${cw * ch} pixels, ${numDiffPixels} diff)`);

    const totalPixels = cw * ch;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;

    // 7. Store diff image
    const tDiffStore = Date.now();
    const diffBuffer = PNG.sync.write(diffPng);
    const diffBlob = new Blob([diffBuffer], { type: "image/png" });
    const diffStorageId = await ctx.storage.store(diffBlob);
    console.log(`${label} encode + store diff: ${Date.now() - tDiffStore}ms (${diffBuffer.length} bytes)`);

    const threshold = args.sensitivityThreshold ?? 0.1;

    console.log(`${label} TOTAL: ${Date.now() - t0}ms — diff=${Math.round(diffPercentage * 100) / 100}%, changed=${diffPercentage > threshold}`);

    return {
      croppedStorageId,
      fullStorageId: args.fullStorageId,
      changed: diffPercentage > threshold,
      diffPercentage: Math.round(diffPercentage * 100) / 100,
      diffStorageId,
    };
  },
});

// Element mode: compare element screenshots directly (no zone cropping)
export const compareElementScreenshots = internalAction({
  args: {
    monitorId: v.id("monitors"),
    currentStorageId: v.id("_storage"),
    previousStorageId: v.optional(v.id("_storage")),
    sensitivityThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const t0 = Date.now();
    const label = `[compareElementScreenshots]`;

    // No previous → first run
    if (!args.previousStorageId) {
      console.log(`${label} no previous — first run`);
      return {
        croppedStorageId: args.currentStorageId,
        fullStorageId: args.currentStorageId,
        changed: false,
        diffPercentage: 0,
        diffStorageId: null,
      };
    }

    // Fetch both screenshots
    const currentUrl = await ctx.storage.getUrl(args.currentStorageId);
    const prevUrl = await ctx.storage.getUrl(args.previousStorageId);
    if (!currentUrl || !prevUrl) {
      console.log(`${label} missing storage URLs`);
      return {
        croppedStorageId: args.currentStorageId,
        fullStorageId: args.currentStorageId,
        changed: false,
        diffPercentage: 0,
        diffStorageId: null,
      };
    }

    const tFetch = Date.now();
    const [currentResp, prevResp] = await Promise.all([
      fetch(currentUrl),
      fetch(prevUrl),
    ]);
    const currentBuf = Buffer.from(await currentResp.arrayBuffer());
    const prevBuf = Buffer.from(await prevResp.arrayBuffer());
    console.log(`${label} fetch both screenshots: ${Date.now() - tFetch}ms (current: ${currentBuf.length} bytes, prev: ${prevBuf.length} bytes)`);

    const tDecode = Date.now();
    const currentPng = PNG.sync.read(currentBuf);
    const prevPng = PNG.sync.read(prevBuf);
    console.log(`${label} decode PNGs: ${Date.now() - tDecode}ms (current: ${currentPng.width}x${currentPng.height}, prev: ${prevPng.width}x${prevPng.height})`);

    // Resize previous to match current if needed
    const w = currentPng.width;
    const h = currentPng.height;
    const needsResize = prevPng.width !== w || prevPng.height !== h;
    let resizedPrev: PNG;
    if (needsResize) {
      const tResize = Date.now();
      resizedPrev = resizePng(prevPng, w, h);
      console.log(`${label} resize previous: ${Date.now() - tResize}ms (${prevPng.width}x${prevPng.height} → ${w}x${h})`);
    } else {
      resizedPrev = prevPng;
    }

    // Pixelmatch
    const tMatch = Date.now();
    const diffPng = new PNG({ width: w, height: h });
    const numDiffPixels = pixelmatch(
      resizedPrev.data,
      currentPng.data,
      diffPng.data,
      w,
      h,
      { threshold: 0.1 }
    );
    console.log(`${label} pixelmatch: ${Date.now() - tMatch}ms (${w}x${h} = ${w * h} pixels, ${numDiffPixels} diff)`);

    const diffPercentage = (numDiffPixels / (w * h)) * 100;

    const tStore = Date.now();
    const diffBuffer = PNG.sync.write(diffPng);
    const diffBlob = new Blob([diffBuffer], { type: "image/png" });
    const diffStorageId = await ctx.storage.store(diffBlob);
    console.log(`${label} encode + store diff: ${Date.now() - tStore}ms (${diffBuffer.length} bytes)`);

    const threshold = args.sensitivityThreshold ?? 0.1;
    console.log(`${label} TOTAL: ${Date.now() - t0}ms — diff=${Math.round(diffPercentage * 100) / 100}%, changed=${diffPercentage > threshold}`);

    return {
      croppedStorageId: args.currentStorageId,
      fullStorageId: args.currentStorageId,
      changed: diffPercentage > threshold,
      diffPercentage: Math.round(diffPercentage * 100) / 100,
      diffStorageId,
    };
  },
});
