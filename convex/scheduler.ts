"use node";

import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const INTERVAL_MS: Record<string, number> = {
  "5min": 5 * 60 * 1000,
  "15min": 15 * 60 * 1000,
  "30min": 30 * 60 * 1000,
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

export const processDueMonitors = internalAction({
  args: {},
  handler: async (ctx) => {
    // Query due monitors via internal mutation
    const dueMonitors = await ctx.runQuery(
      internal.schedulerHelpers.getDueMonitors,
      {}
    );

    if (dueMonitors.length === 0) return;

    // Process each monitor
    for (const monitor of dueMonitors) {
      try {
        // 1. Capture screenshot
        const fullStorageId = await ctx.runAction(
          internal.screenshotActions.captureForMonitor,
          { monitorId: monitor._id, url: monitor.url }
        );

        // 2. Get previous snapshot's cropped storage ID
        const lastSnapshot = monitor.lastSnapshotId
          ? await ctx.runQuery(internal.schedulerHelpers.getSnapshot, {
              snapshotId: monitor.lastSnapshotId,
            })
          : null;

        // 3. Crop and compare
        const result = await ctx.runAction(
          internal.comparisonActions.cropAndCompare,
          {
            monitorId: monitor._id,
            fullStorageId,
            previousCroppedStorageId: lastSnapshot?.storageId,
            zone: monitor.zone,
          }
        );

        // 4. Store new snapshot and update monitor
        const snapshotId = await ctx.runMutation(
          internal.schedulerHelpers.recordSnapshot,
          {
            monitorId: monitor._id,
            storageId: result.croppedStorageId,
            fullStorageId: result.fullStorageId,
          }
        );

        // 5. If changed, create change record and send email
        if (result.changed && lastSnapshot && result.diffStorageId) {
          await ctx.runMutation(internal.schedulerHelpers.recordChange, {
            monitorId: monitor._id,
            beforeSnapshotId: monitor.lastSnapshotId!,
            afterSnapshotId: snapshotId,
            diffStorageId: result.diffStorageId,
            diffPercentage: result.diffPercentage,
          });

          // Send email notification
          const afterUrl = await ctx.storage.getUrl(result.croppedStorageId);
          const beforeUrl = lastSnapshot
            ? await ctx.storage.getUrl(lastSnapshot.storageId)
            : null;
          const diffUrl = result.diffStorageId
            ? await ctx.storage.getUrl(result.diffStorageId)
            : null;

          const userEmail = await ctx.runQuery(
            internal.schedulerHelpers.getMonitorUserEmail,
            { monitorId: monitor._id }
          );

          if (userEmail) {
            await ctx.runAction(internal.emailActions.sendChangeNotification, {
              to: userEmail,
              monitorName: monitor.name,
              monitorUrl: monitor.url,
              diffPercentage: result.diffPercentage,
              beforeUrl: beforeUrl ?? undefined,
              afterUrl: afterUrl ?? undefined,
              diffUrl: diffUrl ?? undefined,
              dashboardUrl: `${process.env.SITE_URL ?? "https://pagepulse.dev"}/dashboard/${monitor._id}`,
            });
          }
        }

        // 6. Update monitor's next check time
        await ctx.runMutation(internal.schedulerHelpers.updateMonitorAfterCheck, {
          monitorId: monitor._id,
          snapshotId,
          changed: result.changed,
        });
      } catch (error) {
        console.error(`Error processing monitor ${monitor._id}:`, error);
        await ctx.runMutation(internal.schedulerHelpers.recordMonitorError, {
          monitorId: monitor._id,
        });
      }
    }
  },
});
