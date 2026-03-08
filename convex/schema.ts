import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  monitors: defineTable({
    userId: v.string(),
    url: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    zone: v.object({
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
    }),
    // Element picker fields
    cssSelector: v.optional(v.string()),
    selectionMode: v.optional(
      v.union(v.literal("zone"), v.literal("element"))
    ),
    interval: v.union(
      v.literal("5min"),
      v.literal("15min"),
      v.literal("30min"),
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("error")
    ),
    lastCheckedAt: v.optional(v.number()),
    nextCheckAt: v.number(),
    lastSnapshotId: v.optional(v.id("snapshots")),
    changeCount: v.number(),
    consecutiveErrors: v.number(),
    isChecking: v.optional(v.boolean()),
    fullScreenshotStorageId: v.optional(v.id("_storage")),
    sensitivityThreshold: v.optional(v.number()),
    // Webhook fields
    webhookUrl: v.optional(v.string()),
    webhookType: v.optional(
      v.union(
        v.literal("generic"),
        v.literal("slack"),
        v.literal("discord")
      )
    ),
    // Tags
    tags: v.optional(v.array(v.string())),
  })
    .index("by_userId", ["userId"])
    .index("by_nextCheckAt", ["nextCheckAt"])
    .index("by_status_nextCheckAt", ["status", "nextCheckAt"]),

  snapshots: defineTable({
    monitorId: v.id("monitors"),
    storageId: v.id("_storage"),
    fullStorageId: v.id("_storage"),
    capturedAt: v.number(),
  })
    .index("by_monitorId", ["monitorId"])
    .index("by_monitorId_capturedAt", ["monitorId", "capturedAt"]),

  changes: defineTable({
    monitorId: v.id("monitors"),
    beforeSnapshotId: v.id("snapshots"),
    afterSnapshotId: v.id("snapshots"),
    diffStorageId: v.id("_storage"),
    diffPercentage: v.number(),
    detectedAt: v.number(),
    notified: v.boolean(),
  })
    .index("by_monitorId", ["monitorId"])
    .index("by_monitorId_detectedAt", ["monitorId", "detectedAt"]),
});
