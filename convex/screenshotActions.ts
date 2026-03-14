"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { getIdentity } from "./auth";

const SCREENSHOTONE_API = "https://api.screenshotone.com/take";

type ScreenshotProvider = "pagess" | "screenshotone";

function getProvider(): ScreenshotProvider {
  const provider = process.env.SCREENSHOT_PROVIDER ?? "screenshotone";
  if (provider !== "screenshotone" && provider !== "pagess") {
    throw new Error(`Invalid SCREENSHOT_PROVIDER: ${provider}`);
  }
  return provider;
}

async function fetchScreenshot(args: {
  url: string;
  selector?: string;
  fullPage?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  blockAds?: boolean;
  delay?: number;
}): Promise<Blob> {
  const provider = getProvider();
  // When a selector is provided, fullPage must be false (APIs treat them as mutually exclusive)
  const useFullPage = args.selector ? false : (args.fullPage ?? true);
  const vw = String(args.viewportWidth ?? 1280);
  const vh = String(args.viewportHeight ?? 800);
  const shouldBlockAds = (args.blockAds ?? true) ? "true" : "false";
  const delaySeconds = String(args.delay ?? 3);

  if (provider === "pagess") {
    const baseUrl = process.env.PAGESS_URL;
    const apiKey = process.env.PAGESS_API_KEY;
    if (!baseUrl) throw new Error("Missing PAGESS_URL");
    if (!apiKey) throw new Error("Missing PAGESS_API_KEY");

    const params = new URLSearchParams({
      access_key: apiKey,
      url: args.url,
      full_page: useFullPage ? "true" : "false",
      viewport_width: vw,
      viewport_height: vh,
      format: "png",
      block_ads: shouldBlockAds,
      block_cookie_banners: "true",
      delay: delaySeconds,
    });

    if (args.selector) {
      params.set("selector", args.selector);
    }

    const response = await fetch(`${baseUrl}/take?${params.toString()}`);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Screenshot failed: ${response.status} ${response.statusText} — ${errorBody}`
      );
    }

    return await response.blob();
  }

  // Default: ScreenshotOne
  const apiKey = process.env.SCREENSHOTONE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing SCREENSHOTONE_API_KEY");
  }

  const params = new URLSearchParams({
    access_key: apiKey,
    url: args.url,
    full_page: useFullPage ? "true" : "false",
    viewport_width: vw,
    viewport_height: vh,
    format: "png",
    block_ads: shouldBlockAds,
    block_cookie_banners: "true",
    delay: delaySeconds,
  });

  if (args.selector) {
    params.set("selector", args.selector);
  }

  const response = await fetch(`${SCREENSHOTONE_API}?${params.toString()}`);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Screenshot failed: ${response.status} ${response.statusText} — ${errorBody}`
    );
  }

  return await response.blob();
}

export const captureScreenshot = action({
  args: {
    url: v.string(),
    selector: v.optional(v.string()),
    fullPage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await getIdentity(ctx);

    const imageBlob = await fetchScreenshot({
      url: args.url,
      selector: args.selector,
      fullPage: args.fullPage ?? true,
    });

    const storageId = await ctx.storage.store(imageBlob);
    const url = await ctx.storage.getUrl(storageId);

    return { storageId, url };
  },
});

export const captureForMonitor = internalAction({
  args: {
    monitorId: v.id("monitors"),
    url: v.string(),
    selector: v.optional(v.string()),
    fullPage: v.optional(v.boolean()),
    mobileViewport: v.optional(v.boolean()),
    blockAds: v.optional(v.boolean()),
    delay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const imageBlob = await fetchScreenshot({
      url: args.url,
      selector: args.selector,
      fullPage: args.fullPage ?? true,
      viewportWidth: args.mobileViewport ? 375 : 1280,
      viewportHeight: args.mobileViewport ? 812 : 800,
      blockAds: args.blockAds,
      delay: args.delay,
    });

    const fullStorageId = await ctx.storage.store(imageBlob);

    return fullStorageId;
  },
});
