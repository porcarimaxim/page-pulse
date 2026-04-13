"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { getIdentity } from "./auth";

/** Helper: enforce rate limit from within an action */
async function enforceActionRateLimit(
  ctx: { runMutation: (ref: any, args: any) => Promise<any> },
  userId: string,
  actionName: string
) {
  await ctx.runMutation(internal.rateLimitMutations.check, {
    userId,
    action: actionName,
  });
}

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

  const label = `[fetchScreenshot] url=${args.url} selector=${args.selector ?? "none"} provider=${provider}`;
  console.log(`${label} — starting`);
  const t0 = Date.now();

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

    const fetchUrl = `${baseUrl}/take?${params.toString()}`;
    console.log(`${label} — URL length: ${fetchUrl.length} chars`);

    const response = await fetch(fetchUrl);
    const fetchMs = Date.now() - t0;

    if (!response.ok) {
      const errorBody = await response.text();
      console.log(`${label} — FAILED in ${fetchMs}ms: ${response.status}`);
      throw new Error(
        `Screenshot failed: ${response.status} ${response.statusText} — ${errorBody}`
      );
    }

    const t1 = Date.now();
    const blob = await response.blob();
    const blobMs = Date.now() - t1;
    console.log(`${label} — API response: ${fetchMs}ms, blob read: ${blobMs}ms, size: ${blob.size} bytes, total: ${Date.now() - t0}ms`);

    return blob;
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

  const fetchUrl = `${SCREENSHOTONE_API}?${params.toString()}`;
  console.log(`${label} — URL length: ${fetchUrl.length} chars`);

  const response = await fetch(fetchUrl);
  const fetchMs = Date.now() - t0;

  if (!response.ok) {
    const errorBody = await response.text();
    console.log(`${label} — FAILED in ${fetchMs}ms: ${response.status}`);
    throw new Error(
      `Screenshot failed: ${response.status} ${response.statusText} — ${errorBody}`
    );
  }

  const t1 = Date.now();
  const blob = await response.blob();
  const blobMs = Date.now() - t1;
  console.log(`${label} — API response: ${fetchMs}ms, blob read: ${blobMs}ms, size: ${blob.size} bytes, total: ${Date.now() - t0}ms`);

  return blob;
}

export const captureScreenshot = action({
  args: {
    url: v.string(),
    selector: v.optional(v.string()),
    fullPage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    await enforceActionRateLimit(ctx, identity.subject, "screenshot:capture");

    const t0 = Date.now();
    const imageBlob = await fetchScreenshot({
      url: args.url,
      selector: args.selector,
      fullPage: args.fullPage ?? true,
    });
    const screenshotMs = Date.now() - t0;
    console.log(`[captureScreenshot] screenshot fetch: ${screenshotMs}ms (url: ${args.url})`);

    const t1 = Date.now();
    const storageId = await ctx.storage.store(imageBlob);
    const url = await ctx.storage.getUrl(storageId);
    const storeMs = Date.now() - t1;
    console.log(`[captureScreenshot] storage upload: ${storeMs}ms`);
    console.log(`[captureScreenshot] total: ${Date.now() - t0}ms`);

    return { storageId, url };
  },
});

/**
 * Build a JS script that finds the element at a percentage-based position on the
 * full page, generates a CSS selector, highlights it, and sets document.title
 * so we can extract the selector via metadata.
 *
 * Coordinates are percentages (0-100) relative to the full page dimensions.
 * The script scrolls to the target position before using elementFromPoint,
 * which only detects elements visible in the viewport.
 */
function buildSelectorScript(clickXPct: number, clickYPct: number): string {
  return `
(function() {
  var SKIP = ['html','head','body','script','style','link','meta','br','hr','noscript','title','base'];

  function findTarget(el) {
    var current = el;
    while (current && current !== document.body) {
      var tag = current.tagName ? current.tagName.toLowerCase() : '';
      if (SKIP.indexOf(tag) !== -1) return null;
      var rect = current.getBoundingClientRect();
      if (rect.width * rect.height > window.innerWidth * window.innerHeight * 0.9) {
        current = current.parentElement;
        continue;
      }
      if (rect.width < 5 || rect.height < 5) {
        current = current.parentElement;
        continue;
      }
      return current;
    }
    return null;
  }

  function escapeCSS(str) {
    return str.replace(/([^a-zA-Z0-9_-])/g, '\\\\$1');
  }

  function genSelector(el) {
    var tag = el.tagName.toLowerCase();

    // ID-based
    if (el.id && !/^\\d/.test(el.id) && el.id.indexOf(' ') === -1 && el.id.indexOf(':') === -1) {
      var idSel = '#' + escapeCSS(el.id);
      try { if (document.querySelectorAll(idSel).length === 1) return idSel; } catch(e) {}
    }

    // Tag + class combo
    var classes = Array.from(el.classList).filter(function(c) {
      return c.length > 0 && c.length < 40 && !/^\\d/.test(c) && c.indexOf(':') === -1 && c.indexOf('[') === -1 && c.indexOf('/') === -1 && c.indexOf('!') === -1;
    });

    if (classes.length > 0) {
      var twoClass = tag + '.' + classes.slice(0, 2).map(escapeCSS).join('.');
      try { if (document.querySelectorAll(twoClass).length <= 3) return twoClass; } catch(e) {}
      var oneClass = tag + '.' + escapeCSS(classes[0]);
      try { if (document.querySelectorAll(oneClass).length <= 3) return oneClass; } catch(e) {}
    }

    // Semantic tags
    var semantic = ['header','nav','main','article','section','aside','footer','h1','h2','h3','h4','form','table'];
    if (semantic.indexOf(tag) !== -1) {
      try { if (document.querySelectorAll(tag).length <= 3) return tag; } catch(e) {}
    }

    // Fallback
    if (classes.length > 0) return tag + '.' + escapeCSS(classes[0]);
    return tag;
  }

  // Compute absolute position from percentages using actual page dimensions
  var pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  var vw = window.innerWidth;
  var absoluteX = (${clickXPct} / 100) * vw;
  var absoluteY = (${clickYPct} / 100) * pageHeight;

  // Scroll so the target position is in the viewport
  var scrollTarget = Math.max(0, absoluteY - window.innerHeight / 2);
  window.scrollTo(0, scrollTarget);

  // elementFromPoint needs viewport-relative coordinates
  var viewportX = absoluteX;
  var viewportY = absoluteY - window.scrollY;

  var el = document.elementFromPoint(viewportX, viewportY);
  if (!el) { var t='__PP__none__PP__'; document.title=t; Object.defineProperty(document,'title',{value:t,writable:false,configurable:false}); return; }

  var target = findTarget(el);
  if (!target) { var t2='__PP__none__PP__'; document.title=t2; Object.defineProperty(document,'title',{value:t2,writable:false,configurable:false}); return; }

  var selector = genSelector(target);
  var t3 = '__PP__' + selector + '__PP__';
  document.title = t3;
  Object.defineProperty(document,'title',{value:t3,writable:false,configurable:false});

  // Highlight the element
  target.style.outline = '3px solid #2d5a2d';
  target.style.outlineOffset = '-1px';
  target.style.backgroundColor = 'rgba(45, 90, 45, 0.15)';
})();
`;
}

/**
 * Resolve which element is at a click position on a page screenshot.
 * Uses ScreenshotOne's scripts + metadata_page_title to extract the CSS selector,
 * and returns a highlighted screenshot preview.
 */
export const resolveElementFromClick = action({
  args: {
    url: v.string(),
    clickX: v.number(), // percentage 0-100
    clickY: v.number(), // percentage 0-100
    mobileViewport: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    await enforceActionRateLimit(ctx, identity.subject, "screenshot:resolveElement");
    const totalStart = Date.now();
    const label = `[resolveElementFromClick] url=${args.url} click=(${args.clickX.toFixed(1)}%,${args.clickY.toFixed(1)}%)`;
    console.log(`${label} — starting`);

    const vw = args.mobileViewport ? 375 : 1280;
    const vh = args.mobileViewport ? 812 : 800;

    // Pass percentages directly — the script computes absolute position
    // using actual page dimensions (scrollHeight) at runtime
    const script = buildSelectorScript(args.clickX, args.clickY);

    const provider = getProvider();
    let apiKey: string;
    let baseUrl: string;

    if (provider === "pagess") {
      const pagessUrl = process.env.PAGESS_URL;
      const pagessKey = process.env.PAGESS_API_KEY;
      if (!pagessUrl) throw new Error("Missing PAGESS_URL");
      if (!pagessKey) throw new Error("Missing PAGESS_API_KEY");
      apiKey = pagessKey;
      baseUrl = `${pagessUrl}/take`;
    } else {
      const ssKey = process.env.SCREENSHOTONE_API_KEY;
      if (!ssKey) throw new Error("Missing SCREENSHOTONE_API_KEY");
      apiKey = ssKey;
      baseUrl = SCREENSHOTONE_API;
    }

    // Call 1: Get selector via metadata (JSON response)
    const metadataParams = new URLSearchParams({
      access_key: apiKey,
      url: args.url,
      full_page: "true",
      viewport_width: String(vw),
      viewport_height: String(vh),
      format: "png",
      block_ads: "true",
      block_cookie_banners: "true",
      delay: "3",
      scripts: script,
      scripts_wait_until: "networkidle0",
      response_type: "json",
      metadata_page_title: "true",
    });

    const t1 = Date.now();
    const metadataResponse = await fetch(
      `${baseUrl}?${metadataParams.toString()}`
    );
    const call1Ms = Date.now() - t1;

    if (!metadataResponse.ok) {
      const errorBody = await metadataResponse.text();
      console.log(`${label} — call 1 (metadata) FAILED in ${call1Ms}ms: ${metadataResponse.status}`);
      throw new Error(`Element detection failed: ${metadataResponse.status} — ${errorBody}`);
    }

    const metadataJson = await metadataResponse.json();
    const pageTitle: string = metadataJson?.metadata?.page_title ?? "";
    console.log(`${label} — call 1 (metadata): ${call1Ms}ms`);

    // Extract selector from __PP__selector__PP__ format
    const match = pageTitle.match(/__PP__(.+)__PP__/);
    const selector = match ? match[1] : null;

    if (!selector || selector === "none") {
      console.log(`${label} — no element found, total: ${Date.now() - totalStart}ms`);
      return {
        selector: null,
        highlightedStorageId: null,
        highlightedUrl: null,
        error: "No element found at this position. Try clicking on a visible element.",
      };
    }

    console.log(`${label} — resolved selector: ${selector}`);

    // Call 2: Get highlighted screenshot (full page with element outlined)
    const imageParams = new URLSearchParams({
      access_key: apiKey,
      url: args.url,
      full_page: "true",
      viewport_width: String(vw),
      viewport_height: String(vh),
      format: "png",
      block_ads: "true",
      block_cookie_banners: "true",
      delay: "3",
      scripts: script,
      scripts_wait_until: "networkidle0",
    });

    const t2 = Date.now();
    const imageResponse = await fetch(
      `${baseUrl}?${imageParams.toString()}`
    );
    const call2Ms = Date.now() - t2;

    if (!imageResponse.ok) {
      console.log(`${label} — call 2 (highlight image) FAILED in ${call2Ms}ms: ${imageResponse.status}`);
      // Selector was found but screenshot failed — return selector without preview
      return {
        selector,
        highlightedStorageId: null,
        highlightedUrl: null,
        error: null,
      };
    }

    const imageBlob = await imageResponse.blob();
    console.log(`${label} — call 2 (highlight image): ${call2Ms}ms, size: ${imageBlob.size} bytes`);

    const t3 = Date.now();
    const highlightedStorageId = await ctx.storage.store(imageBlob);
    const highlightedUrl = await ctx.storage.getUrl(highlightedStorageId);
    console.log(`${label} — storage upload: ${Date.now() - t3}ms`);
    console.log(`${label} — total: ${Date.now() - totalStart}ms (call1: ${call1Ms}ms, call2: ${call2Ms}ms)`);

    return {
      selector,
      highlightedStorageId,
      highlightedUrl,
      error: null,
    };
  },
});

/**
 * Build a script that collects bounding boxes of all significant elements
 * and encodes them compactly in document.title as:
 * __PP_MAP__selector|xPct|yPct|wPct|hPct;....__PP_MAP__
 */
function buildElementMapScript(): string {
  return `(function(){
var r=[],seen={};
var pH=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
var pW=document.documentElement.clientWidth;
var SKIP=['html','head','body','script','style','link','meta','br','hr','noscript','title','base'];

function escCSS(s){return s.replace(/([^a-zA-Z0-9_-])/g,'\\\\$1');}

function genSel(el){
  var tag=el.tagName.toLowerCase();
  if(el.id&&!/^\\d/.test(el.id)&&el.id.indexOf(' ')===-1&&el.id.indexOf(':')===-1){
    var idS='#'+escCSS(el.id);
    try{if(document.querySelectorAll(idS).length===1)return idS;}catch(e){}
  }
  var cls=Array.from(el.classList).filter(function(c){
    return c.length>0&&c.length<40&&!/^\\d/.test(c)&&c.indexOf(':')===-1&&c.indexOf('[')===-1&&c.indexOf('/')===-1&&c.indexOf('!')===-1;
  });
  if(cls.length>0){
    var tw=tag+'.'+cls.slice(0,2).map(escCSS).join('.');
    try{if(document.querySelectorAll(tw).length<=3)return tw;}catch(e){}
    var ow=tag+'.'+escCSS(cls[0]);
    try{if(document.querySelectorAll(ow).length<=3)return ow;}catch(e){}
  }
  var sem=['header','nav','main','article','section','aside','footer','h1','h2','h3','h4','form','table'];
  if(sem.indexOf(tag)!==-1){try{if(document.querySelectorAll(tag).length<=3)return tag;}catch(e){}}
  if(cls.length>0)return tag+'.'+escCSS(cls[0]);
  return null;
}

function isVisible(el){
  var st=window.getComputedStyle(el);
  if(st.display==='none'||st.visibility==='hidden'||st.opacity==='0')return false;
  if(st.pointerEvents==='none')return false;
  // Check ARIA and common popup attributes
  if(el.getAttribute('aria-hidden')==='true')return false;
  var role=el.getAttribute('role');
  if(role&&['menu','menubar','listbox','tooltip','dialog','alertdialog','presentation'].indexOf(role)!==-1)return false;
  if(el.getAttribute('data-popper-placement')!==null)return false;
  if(el.getAttribute('data-radix-popper-content-wrapper')!==null)return false;
  return true;
}

function add(el){
  var tag=el.tagName?el.tagName.toLowerCase():'';
  if(SKIP.indexOf(tag)!==-1)return;
  if(!isVisible(el))return;
  // Walk ancestors for hidden containers
  var anc=el.parentElement;
  while(anc&&anc!==document.body){
    if(!isVisible(anc))return;
    anc=anc.parentElement;
  }
  var rect=el.getBoundingClientRect();
  var absTop=rect.top+window.scrollY;
  var absLeft=rect.left+window.scrollX;
  var w=rect.width;var h=rect.height;
  if(w<10||h<10)return;
  if(w*h>pW*pH*0.8)return;
  if(absLeft+w<0||absTop+h<0||absLeft>pW)return;
  // elementFromPoint check — verify element is actually the topmost at its center
  // Only works for elements within the current viewport
  var cx=rect.left+w/2;
  var cy=rect.top+h/2;
  if(cx>=0&&cy>=0&&cx<pW&&cy<window.innerHeight){
    var topEl=document.elementFromPoint(cx,cy);
    if(topEl&&topEl!==el&&!el.contains(topEl)&&!topEl.contains(el))return;
  }
  var sel=genSel(el);
  if(!sel||seen[sel])return;
  seen[sel]=1;
  var xP=(absLeft/pW*100).toFixed(2);
  var yP=(absTop/pH*100).toFixed(2);
  var wP=(w/pW*100).toFixed(2);
  var hP=(h/pH*100).toFixed(2);
  r.push(sel+'|'+xP+'|'+yP+'|'+wP+'|'+hP);
}

var els=document.querySelectorAll('h1,h2,h3,h4,h5,h6,[id],header,nav,main,article,section,aside,footer,form,table,img,video,picture,figure,a,button,input,textarea,select,ul,ol,dl,blockquote,pre,code,p,div,span,li');
for(var i=0;i<els.length&&r.length<200;i++)add(els[i]);
var t='__PP_MAP__'+r.join(';')+'__PP_MAP__';
document.title=t;
Object.defineProperty(document,'title',{value:t,writable:false,configurable:false});
})()`;
}

/**
 * Pre-load a map of all significant elements and their bounding boxes.
 * Returns an array of { selector, x, y, w, h } where coordinates are percentages.
 */
export const getPageElementMap = action({
  args: {
    url: v.string(),
    mobileViewport: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    await enforceActionRateLimit(ctx, identity.subject, "screenshot:elementMap");

    const vw = args.mobileViewport ? 375 : 1280;
    const vh = args.mobileViewport ? 812 : 800;
    const script = buildElementMapScript();

    const provider = getProvider();
    let apiKey: string;
    let baseUrl: string;

    if (provider === "pagess") {
      const pagessUrl = process.env.PAGESS_URL;
      const pagessKey = process.env.PAGESS_API_KEY;
      if (!pagessUrl) throw new Error("Missing PAGESS_URL");
      if (!pagessKey) throw new Error("Missing PAGESS_API_KEY");
      apiKey = pagessKey;
      baseUrl = `${pagessUrl}/take`;
    } else {
      const ssKey = process.env.SCREENSHOTONE_API_KEY;
      if (!ssKey) throw new Error("Missing SCREENSHOTONE_API_KEY");
      apiKey = ssKey;
      baseUrl = SCREENSHOTONE_API;
    }

    const params = new URLSearchParams({
      access_key: apiKey,
      url: args.url,
      full_page: "true",
      viewport_width: String(vw),
      viewport_height: String(vh),
      format: "png",
      block_ads: "true",
      block_cookie_banners: "true",
      delay: "3",
      scripts: script,
      response_type: "json",
      metadata_page_title: "true",
    });

    const t0 = Date.now();
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const screenshotMs = Date.now() - t0;
    console.log(`[getPageElementMap] screenshot API call: ${screenshotMs}ms (url: ${args.url})`);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Element map failed: ${response.status} — ${errorBody}`);
    }

    const t1 = Date.now();
    const json = await response.json();
    const pageTitle: string = json?.metadata?.page_title ?? "";

    const match = pageTitle.match(/__PP_MAP__(.+)__PP_MAP__/);
    if (!match) {
      console.log(`[getPageElementMap] parsing: ${Date.now() - t1}ms — no elements found`);
      console.log(`[getPageElementMap] total: ${Date.now() - t0}ms`);
      return [];
    }

    const entries = match[1].split(";").filter(Boolean);
    const result = entries.map((entry: string) => {
      const [selector, x, y, w, h] = entry.split("|");
      return {
        selector,
        x: parseFloat(x),
        y: parseFloat(y),
        w: parseFloat(w),
        h: parseFloat(h),
      };
    });
    console.log(`[getPageElementMap] parsing: ${Date.now() - t1}ms — ${result.length} elements found`);
    console.log(`[getPageElementMap] total: ${Date.now() - t0}ms`);
    return result;
  },
});

/** Internal version of getPageElementMap — no auth, for scheduler use */
export const getPageElementMapInternal = internalAction({
  args: {
    url: v.string(),
    mobileViewport: v.optional(v.boolean()),
  },
  handler: async (_ctx, args) => {
    const vw = args.mobileViewport ? 375 : 1280;
    const vh = args.mobileViewport ? 812 : 800;
    const script = buildElementMapScript();

    const provider = getProvider();
    let apiKey: string;
    let baseUrl: string;

    if (provider === "pagess") {
      const pagessUrl = process.env.PAGESS_URL;
      const pagessKey = process.env.PAGESS_API_KEY;
      if (!pagessUrl) throw new Error("Missing PAGESS_URL");
      if (!pagessKey) throw new Error("Missing PAGESS_API_KEY");
      apiKey = pagessKey;
      baseUrl = `${pagessUrl}/take`;
    } else {
      const ssKey = process.env.SCREENSHOTONE_API_KEY;
      if (!ssKey) throw new Error("Missing SCREENSHOTONE_API_KEY");
      apiKey = ssKey;
      baseUrl = SCREENSHOTONE_API;
    }

    const params = new URLSearchParams({
      access_key: apiKey,
      url: args.url,
      full_page: "true",
      viewport_width: String(vw),
      viewport_height: String(vh),
      format: "png",
      block_ads: "true",
      block_cookie_banners: "true",
      delay: "3",
      scripts: script,
      response_type: "json",
      metadata_page_title: "true",
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Element map failed: ${response.status} — ${errorBody}`);
    }

    const json = await response.json();
    const pageTitle: string = json?.metadata?.page_title ?? "";

    const match = pageTitle.match(/__PP_MAP__(.+)__PP_MAP__/);
    if (!match) return [];

    return match[1].split(";").filter(Boolean).map((entry: string) => {
      const [selector, x, y, w, h] = entry.split("|");
      return { selector, x: parseFloat(x), y: parseFloat(y), w: parseFloat(w), h: parseFloat(h) };
    });
  },
});

/**
 * Build a JS script that extracts visible text content from elements
 * whose bounding boxes overlap with a percentage-based zone rectangle.
 * Text is URI-encoded and stored in document.title for extraction via metadata.
 */
function buildZoneTextScript(xPct: number, yPct: number, wPct: number, hPct: number): string {
  return `(function(){
var pH=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
var pW=document.documentElement.clientWidth;
var zL=(${xPct}/100)*pW, zT=(${yPct}/100)*pH;
var zR=zL+(${wPct}/100)*pW, zB=zT+(${hPct}/100)*pH;
var skip={script:1,style:1,noscript:1,link:1,meta:1,svg:1};
var texts=[];
var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);
while(walker.nextNode()){
  var node=walker.currentNode;
  var text=node.textContent.trim();
  if(!text)continue;
  var p=node.parentElement;
  if(!p)continue;
  var tag=p.tagName.toLowerCase();
  if(skip[tag])continue;
  var st=window.getComputedStyle(p);
  if(st.display==='none'||st.visibility==='hidden')continue;
  var rect=p.getBoundingClientRect();
  var absT=rect.top+window.scrollY, absL=rect.left+window.scrollX;
  if(absL<zR&&absL+rect.width>zL&&absT<zB&&absT+rect.height>zT){
    texts.push(text);
  }
}
var result=encodeURIComponent(texts.join('\\n').substring(0,30000));
var t='__PP_ZTEXT__'+result+'__PP_ZTEXT__';
document.title=t;
Object.defineProperty(document,'title',{value:t,writable:false,configurable:false});
})()`;
}

/**
 * Extract text content from elements within a zone rectangle on the page.
 * Uses the screenshot API's JS injection to run a DOM walker in the real browser
 * and filter text nodes by their visual position.
 */
export const extractTextForZone = internalAction({
  args: {
    url: v.string(),
    zone: v.object({
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
    }),
    mobileViewport: v.optional(v.boolean()),
    blockAds: v.optional(v.boolean()),
    delay: v.optional(v.number()),
  },
  handler: async (_ctx, args): Promise<string> => {
    const t0 = Date.now();
    const label = `[extractTextForZone] url=${args.url}`;

    const script = buildZoneTextScript(args.zone.x, args.zone.y, args.zone.width, args.zone.height);

    const provider = getProvider();
    let apiKey: string;
    let baseUrl: string;

    if (provider === "pagess") {
      const pagessUrl = process.env.PAGESS_URL;
      const pagessKey = process.env.PAGESS_API_KEY;
      if (!pagessUrl) throw new Error("Missing PAGESS_URL");
      if (!pagessKey) throw new Error("Missing PAGESS_API_KEY");
      apiKey = pagessKey;
      baseUrl = `${pagessUrl}/take`;
    } else {
      const ssKey = process.env.SCREENSHOTONE_API_KEY;
      if (!ssKey) throw new Error("Missing SCREENSHOTONE_API_KEY");
      apiKey = ssKey;
      baseUrl = SCREENSHOTONE_API;
    }

    const vw = args.mobileViewport ? 375 : 1280;
    const vh = args.mobileViewport ? 812 : 800;

    const params = new URLSearchParams({
      access_key: apiKey,
      url: args.url,
      full_page: "true",
      viewport_width: String(vw),
      viewport_height: String(vh),
      format: "png",
      block_ads: (args.blockAds ?? true) ? "true" : "false",
      block_cookie_banners: "true",
      delay: String(args.delay ?? 3),
      scripts: script,
      response_type: "json",
      metadata_page_title: "true",
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`${label} — FAILED in ${Date.now() - t0}ms: ${response.status}`);
      throw new Error(`Zone text extraction failed: ${response.status} — ${errorBody}`);
    }

    const json = await response.json();
    const pageTitle: string = json?.metadata?.page_title ?? "";

    const match = pageTitle.match(/__PP_ZTEXT__(.+)__PP_ZTEXT__/);
    if (!match) {
      console.log(`${label} — no text found in zone, total: ${Date.now() - t0}ms`);
      return "";
    }

    const text = decodeURIComponent(match[1]);
    console.log(`${label} — extracted ${text.length} chars, total: ${Date.now() - t0}ms`);
    return text;
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
    const t0 = Date.now();
    const imageBlob = await fetchScreenshot({
      url: args.url,
      selector: args.selector,
      fullPage: args.fullPage ?? true,
      viewportWidth: args.mobileViewport ? 375 : 1280,
      viewportHeight: args.mobileViewport ? 812 : 800,
      blockAds: args.blockAds,
      delay: args.delay,
    });
    const screenshotMs = Date.now() - t0;
    console.log(`[captureForMonitor] screenshot fetch: ${screenshotMs}ms (url: ${args.url})`);

    const t1 = Date.now();
    const fullStorageId = await ctx.storage.store(imageBlob);
    console.log(`[captureForMonitor] storage upload: ${Date.now() - t1}ms`);
    console.log(`[captureForMonitor] total: ${Date.now() - t0}ms`);

    return fullStorageId;
  },
});
