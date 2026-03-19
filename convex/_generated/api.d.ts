/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiActions from "../aiActions.js";
import type * as aiHelpers from "../aiHelpers.js";
import type * as auth from "../auth.js";
import type * as changes from "../changes.js";
import type * as comparisonActions from "../comparisonActions.js";
import type * as crons from "../crons.js";
import type * as elementDetection from "../elementDetection.js";
import type * as emailActions from "../emailActions.js";
import type * as http from "../http.js";
import type * as intervals from "../intervals.js";
import type * as monitors from "../monitors.js";
import type * as plans from "../plans.js";
import type * as scheduler from "../scheduler.js";
import type * as schedulerHelpers from "../schedulerHelpers.js";
import type * as screenshotActions from "../screenshotActions.js";
import type * as snapshots from "../snapshots.js";
import type * as textExtraction from "../textExtraction.js";
import type * as webhookActions from "../webhookActions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiActions: typeof aiActions;
  aiHelpers: typeof aiHelpers;
  auth: typeof auth;
  changes: typeof changes;
  comparisonActions: typeof comparisonActions;
  crons: typeof crons;
  elementDetection: typeof elementDetection;
  emailActions: typeof emailActions;
  http: typeof http;
  intervals: typeof intervals;
  monitors: typeof monitors;
  plans: typeof plans;
  scheduler: typeof scheduler;
  schedulerHelpers: typeof schedulerHelpers;
  screenshotActions: typeof screenshotActions;
  snapshots: typeof snapshots;
  textExtraction: typeof textExtraction;
  webhookActions: typeof webhookActions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
