"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import * as cheerio from "cheerio";

const MAX_TEXT_LENGTH = 50_000; // 50KB cap

export const extractTextContent = internalAction({
  args: {
    url: v.string(),
    selector: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<string> => {
    const response = await fetch(args.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove non-content elements
    $("script, style, noscript, svg, link, meta").remove();

    let text: string;
    if (args.selector) {
      const el = $(args.selector);
      if (el.length === 0) {
        text = $("body").text();
      } else {
        text = el.text();
      }
    } else {
      text = $("body").text();
    }

    // Clean whitespace: collapse runs, trim lines
    text = text
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter((line) => line.length > 0)
      .join("\n");

    // Cap length
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH);
    }

    return text;
  },
});
