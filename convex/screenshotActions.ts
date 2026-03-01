"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { getIdentity } from "./auth";

const SCREENSHOTONE_API = "https://api.screenshotone.com/take";

export const captureScreenshot = action({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    await getIdentity(ctx);

    const apiKey = process.env.SCREENSHOTONE_API_KEY;
    if (!apiKey) {
      throw new Error("Missing SCREENSHOTONE_API_KEY");
    }

    const params = new URLSearchParams({
      access_key: apiKey,
      url: args.url,
      full_page: "false",
      viewport_width: "1280",
      viewport_height: "800",
      format: "png",
      block_ads: "true",
      block_cookie_banners: "true",
      delay: "3",
    });

    const response = await fetch(`${SCREENSHOTONE_API}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(
        `Screenshot failed: ${response.status} ${response.statusText}`
      );
    }

    const imageBlob = await response.blob();
    const storageId = await ctx.storage.store(imageBlob);

    return storageId;
  },
});

export const captureForMonitor = internalAction({
  args: { monitorId: v.id("monitors"), url: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.SCREENSHOTONE_API_KEY;
    if (!apiKey) {
      throw new Error("Missing SCREENSHOTONE_API_KEY");
    }

    const params = new URLSearchParams({
      access_key: apiKey,
      url: args.url,
      full_page: "false",
      viewport_width: "1280",
      viewport_height: "800",
      format: "png",
      block_ads: "true",
      block_cookie_banners: "true",
      delay: "3",
    });

    const response = await fetch(`${SCREENSHOTONE_API}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(
        `Screenshot failed: ${response.status} ${response.statusText}`
      );
    }

    const imageBlob = await response.blob();
    const fullStorageId = await ctx.storage.store(imageBlob);

    return fullStorageId;
  },
});
