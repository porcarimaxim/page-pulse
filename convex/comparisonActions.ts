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
    // 1. Fetch the full screenshot
    const fullUrl = await ctx.storage.getUrl(args.fullStorageId);
    if (!fullUrl) throw new Error("Full screenshot not found");

    const fullResponse = await fetch(fullUrl);
    const fullBuffer = Buffer.from(await fullResponse.arrayBuffer());

    // 2. Decode PNG and crop to zone
    const fullPng = PNG.sync.read(fullBuffer);
    const imgWidth = fullPng.width;
    const imgHeight = fullPng.height;

    const left = Math.round((args.zone.x / 100) * imgWidth);
    const top = Math.round((args.zone.y / 100) * imgHeight);
    const width = Math.min(Math.round((args.zone.width / 100) * imgWidth), imgWidth - left);
    const height = Math.min(Math.round((args.zone.height / 100) * imgHeight), imgHeight - top);

    const croppedPng = cropPng(fullPng, left, top, width, height);
    const croppedBuffer = PNG.sync.write(croppedPng);

    const croppedBlob = new Blob([croppedBuffer], { type: "image/png" });
    const croppedStorageId = await ctx.storage.store(croppedBlob);

    // 3. If no previous snapshot, just return the cropped image (first run)
    if (!args.previousCroppedStorageId) {
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
      return {
        croppedStorageId,
        fullStorageId: args.fullStorageId,
        changed: false,
        diffPercentage: 0,
        diffStorageId: null,
      };
    }

    const prevResponse = await fetch(prevUrl);
    const prevBuffer = Buffer.from(await prevResponse.arrayBuffer());

    // 5. Resize previous to match current dimensions (in case viewport changed)
    const cw = croppedPng.width;
    const ch = croppedPng.height;
    const prevPng = PNG.sync.read(prevBuffer);

    const resizedPrev = (prevPng.width !== cw || prevPng.height !== ch)
      ? resizePng(prevPng, cw, ch)
      : prevPng;

    // 6. Run pixelmatch
    const diffPng = new PNG({ width: cw, height: ch });

    const numDiffPixels = pixelmatch(
      resizedPrev.data,
      croppedPng.data,
      diffPng.data,
      cw,
      ch,
      { threshold: 0.1 }
    );

    const totalPixels = cw * ch;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;

    // 7. Store diff image
    const diffBuffer = PNG.sync.write(diffPng);
    const diffBlob = new Blob([diffBuffer], { type: "image/png" });
    const diffStorageId = await ctx.storage.store(diffBlob);

    const threshold = args.sensitivityThreshold ?? 0.1;

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
    // No previous → first run
    if (!args.previousStorageId) {
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
      return {
        croppedStorageId: args.currentStorageId,
        fullStorageId: args.currentStorageId,
        changed: false,
        diffPercentage: 0,
        diffStorageId: null,
      };
    }

    const [currentResp, prevResp] = await Promise.all([
      fetch(currentUrl),
      fetch(prevUrl),
    ]);

    const currentPng = PNG.sync.read(
      Buffer.from(await currentResp.arrayBuffer())
    );
    const prevPng = PNG.sync.read(Buffer.from(await prevResp.arrayBuffer()));

    // Resize previous to match current if needed
    const w = currentPng.width;
    const h = currentPng.height;
    const resizedPrev =
      prevPng.width !== w || prevPng.height !== h
        ? resizePng(prevPng, w, h)
        : prevPng;

    // Pixelmatch
    const diffPng = new PNG({ width: w, height: h });
    const numDiffPixels = pixelmatch(
      resizedPrev.data,
      currentPng.data,
      diffPng.data,
      w,
      h,
      { threshold: 0.1 }
    );

    const diffPercentage = (numDiffPixels / (w * h)) * 100;
    const diffBuffer = PNG.sync.write(diffPng);
    const diffBlob = new Blob([diffBuffer], { type: "image/png" });
    const diffStorageId = await ctx.storage.store(diffBlob);

    const threshold = args.sensitivityThreshold ?? 0.1;

    return {
      croppedStorageId: args.currentStorageId,
      fullStorageId: args.currentStorageId,
      changed: diffPercentage > threshold,
      diffPercentage: Math.round(diffPercentage * 100) / 100,
      diffStorageId,
    };
  },
});
