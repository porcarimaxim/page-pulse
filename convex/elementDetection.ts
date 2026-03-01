"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { getIdentity } from "./auth";
import * as cheerio from "cheerio";
import type { AnyNode, Element as DomElement } from "domhandler";

interface ElementSuggestion {
  selector: string;
  label: string;
  tag: string;
  textPreview: string;
}

const SEMANTIC_TAGS = [
  "header",
  "nav",
  "main",
  "article",
  "section",
  "aside",
  "footer",
];

const INTERESTING_CLASS_PATTERNS = [
  /price/i,
  /product/i,
  /title/i,
  /hero/i,
  /card/i,
  /banner/i,
  /content/i,
  /sidebar/i,
  /menu/i,
  /search/i,
  /logo/i,
  /cart/i,
  /rating/i,
  /review/i,
  /description/i,
  /summary/i,
  /feature/i,
  /stat/i,
  /counter/i,
  /table/i,
  /form/i,
  /gallery/i,
  /image/i,
  /video/i,
];

function generateSelector(el: cheerio.Cheerio<AnyNode>, $: cheerio.CheerioAPI): string | null {
  const node = el.get(0);
  if (!node || node.type !== "tag") return null;
  const element = node as DomElement;

  // Prefer ID
  const id = el.attr("id");
  if (id && !id.match(/^\d/) && !id.includes(" ")) {
    return `#${id}`;
  }

  // Use tag + class combo
  const tagName = element.tagName.toLowerCase();
  const classes = (el.attr("class") || "")
    .split(/\s+/)
    .filter(
      (c) =>
        c.length > 0 &&
        c.length < 40 &&
        !c.match(/^\d/) &&
        // Exclude Tailwind-style classes with special chars that break CSS selectors
        !c.includes(":") &&
        !c.includes("[") &&
        !c.includes("/") &&
        !c.includes("!")
    );

  if (classes.length > 0) {
    try {
      const selector = `${tagName}.${classes.slice(0, 2).join(".")}`;
      if ($(selector).length === 1) return selector;
      const simpler = `${tagName}.${classes[0]}`;
      if ($(simpler).length <= 3) return simpler;
    } catch {
      // Skip if cheerio can't parse the selector
    }
  }

  // Semantic tags
  if (SEMANTIC_TAGS.includes(tagName)) {
    if ($(tagName).length === 1) return tagName;
  }

  return null;
}

function getTextPreview(el: cheerio.Cheerio<AnyNode>): string {
  const text = el.text().replace(/\s+/g, " ").trim();
  return text.length > 60 ? text.substring(0, 57) + "..." : text;
}

function labelFromSelector(selector: string, tag: string): string {
  if (selector.startsWith("#")) {
    const id = selector.slice(1);
    return id.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  }
  if (SEMANTIC_TAGS.includes(tag)) {
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  }
  const classMatch = selector.match(/\.([^.]+)/);
  if (classMatch) {
    return classMatch[1].replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  }
  return tag;
}

export const extractPageElements = action({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<ElementSuggestion[]> => {
    await getIdentity(ctx);

    const response = await fetch(args.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const suggestions: ElementSuggestion[] = [];
    const seenSelectors = new Set<string>();

    function addSuggestion(el: cheerio.Cheerio<AnyNode>, tag: string) {
      const selector = generateSelector(el, $);
      if (!selector || seenSelectors.has(selector)) return;

      const textPreview = getTextPreview(el);
      if (!textPreview && tag !== "img" && tag !== "video") return;

      seenSelectors.add(selector);
      suggestions.push({
        selector,
        label: labelFromSelector(selector, tag),
        tag,
        textPreview,
      });
    }

    function getTagName(node: AnyNode): string | null {
      if (node.type === "tag") return (node as DomElement).tagName.toLowerCase();
      return null;
    }

    // 1. Headings (h1-h3)
    $("h1, h2, h3").each((_, el) => {
      const $el = $(el);
      const tag = getTagName(el);
      if (tag) addSuggestion($el, tag);
    });

    // 2. Semantic tags
    for (const tag of SEMANTIC_TAGS) {
      $(tag).each((_, el) => {
        addSuggestion($(el), tag);
      });
    }

    // 3. Elements with IDs
    $("[id]").each((_, el) => {
      const $el = $(el);
      const tag = getTagName(el);
      if (!tag || ["script", "style", "link", "meta", "head", "html", "body"].includes(tag)) return;
      addSuggestion($el, tag);
    });

    // 4. Elements matching interesting class patterns
    $("*").each((_, el) => {
      const $el = $(el);
      const className = $el.attr("class") || "";
      const tag = getTagName(el);
      if (!tag || ["script", "style", "link", "meta", "head", "html", "body", "span", "br"].includes(tag)) return;

      for (const pattern of INTERESTING_CLASS_PATTERNS) {
        if (pattern.test(className)) {
          addSuggestion($el, tag);
          break;
        }
      }
    });

    // Limit to 20 suggestions
    return suggestions.slice(0, 20);
  },
});

/**
 * Fetches a page's HTML, strips scripts, adds a <base> tag,
 * and returns sanitized HTML suitable for rendering in a same-origin iframe
 * to extract element bounding boxes for the visual element picker overlay.
 */
export const fetchPageHtml = action({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<string> => {
    await getIdentity(ctx);

    const response = await fetch(args.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Derive base URL from the final URL (after redirects)
    const urlObj = new URL(args.url);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // Strip all <script> and <noscript> tags
    $("script").remove();
    $("noscript").remove();

    // Strip inline event handlers (onclick, onload, etc.)
    $("*").each((_, el) => {
      const $el = $(el);
      const attrs = $el.attr();
      if (attrs) {
        for (const attr of Object.keys(attrs)) {
          if (attr.startsWith("on")) {
            $el.removeAttr(attr);
          }
        }
      }
    });

    // Strip large data-URIs on images (keep the tag for layout, just clear oversized src)
    $("img").each((_, el) => {
      const src = $(el).attr("src") || "";
      if (src.startsWith("data:") && src.length > 1000) {
        $(el).attr(
          "src",
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
    });

    // Add <base> tag so relative URLs resolve to the original domain
    // (CSS <link> tags load cross-origin by default, so external CSS will apply)
    $("head").prepend(`<base href="${baseUrl}/">`);

    const result = $.html();

    // Cap at ~900KB to stay within Convex return limits
    if (result.length > 900_000) {
      // If too large, try stripping inline styles and SVGs
      $("svg").remove();
      $("style").each((_, el) => {
        const content = $(el).html() || "";
        if (content.length > 50_000) $(el).remove();
      });
      const trimmed = $.html();
      return trimmed.substring(0, 900_000);
    }

    return result;
  },
});
