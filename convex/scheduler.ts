"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const processOneMonitor = internalAction({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    const monitor = await ctx.runQuery(
      internal.schedulerHelpers.getMonitor,
      { monitorId: args.monitorId }
    );
    if (!monitor) return;

    try {
      const isElementMode =
        monitor.selectionMode === "element" && monitor.cssSelector;

      // 1. Capture screenshot (with selector for element mode)
      const fullStorageId = await ctx.runAction(
        internal.screenshotActions.captureForMonitor,
        {
          monitorId: monitor._id,
          url: monitor.url,
          selector: isElementMode ? monitor.cssSelector : undefined,
        }
      );

      // 2. Get previous snapshot
      const lastSnapshot = monitor.lastSnapshotId
        ? await ctx.runQuery(internal.schedulerHelpers.getSnapshot, {
            snapshotId: monitor.lastSnapshotId,
          })
        : null;

      // 3. Compare
      let result;
      if (isElementMode) {
        // Element mode: compare element screenshots directly (no zone cropping)
        result = await ctx.runAction(
          internal.comparisonActions.compareElementScreenshots,
          {
            monitorId: monitor._id,
            currentStorageId: fullStorageId,
            previousStorageId: lastSnapshot?.storageId,
            sensitivityThreshold: monitor.sensitivityThreshold ?? 0.1,
          }
        );
      } else {
        // Zone mode: crop and compare
        result = await ctx.runAction(
          internal.comparisonActions.cropAndCompare,
          {
            monitorId: monitor._id,
            fullStorageId,
            previousCroppedStorageId: lastSnapshot?.storageId,
            zone: monitor.zone,
            sensitivityThreshold: monitor.sensitivityThreshold ?? 0.1,
          }
        );
      }

      // 4. Store new snapshot
      const snapshotId = await ctx.runMutation(
        internal.schedulerHelpers.recordSnapshot,
        {
          monitorId: monitor._id,
          storageId: result.croppedStorageId,
          fullStorageId: result.fullStorageId,
        }
      );

      // 5. If changed, record and notify
      if (result.changed && lastSnapshot && result.diffStorageId) {
        await ctx.runMutation(internal.schedulerHelpers.recordChange, {
          monitorId: monitor._id,
          beforeSnapshotId: monitor.lastSnapshotId!,
          afterSnapshotId: snapshotId,
          diffStorageId: result.diffStorageId,
          diffPercentage: result.diffPercentage,
        });

        const afterUrl = await ctx.storage.getUrl(result.croppedStorageId);
        const beforeUrl = lastSnapshot
          ? await ctx.storage.getUrl(lastSnapshot.storageId)
          : null;
        const diffUrl = result.diffStorageId
          ? await ctx.storage.getUrl(result.diffStorageId)
          : null;

        // Email notification
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

        // Webhook notification
        if (monitor.webhookUrl) {
          await ctx.runAction(internal.webhookActions.sendWebhook, {
            monitorId: monitor._id,
            monitorName: monitor.name,
            monitorUrl: monitor.url,
            webhookUrl: monitor.webhookUrl,
            webhookType: monitor.webhookType ?? "generic",
            diffPercentage: result.diffPercentage,
            beforeUrl: beforeUrl ?? undefined,
            afterUrl: afterUrl ?? undefined,
            diffUrl: diffUrl ?? undefined,
            dashboardUrl: `${process.env.SITE_URL ?? "https://pagepulse.dev"}/dashboard/${monitor._id}`,
          });
        }
      }

      // 6. Update monitor
      await ctx.runMutation(internal.schedulerHelpers.updateMonitorAfterCheck, {
        monitorId: monitor._id,
        snapshotId,
        changed: result.changed,
      });
    } catch (error) {
      console.error(`Error processing monitor ${args.monitorId}:`, error);
      await ctx.runMutation(internal.schedulerHelpers.recordMonitorError, {
        monitorId: args.monitorId,
      });
    }
  },
});

export const processDueMonitors = internalAction({
  args: {},
  handler: async (ctx) => {
    const dueMonitors = await ctx.runQuery(
      internal.schedulerHelpers.getDueMonitors,
      {}
    );

    if (dueMonitors.length === 0) return;

    for (const monitor of dueMonitors) {
      await ctx.runAction(internal.scheduler.processOneMonitor, {
        monitorId: monitor._id,
      });
    }
  },
});
