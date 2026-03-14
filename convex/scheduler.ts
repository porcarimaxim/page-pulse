"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { createTwoFilesPatch } from "diff";

/**
 * Check if keyword conditions are met for triggering a change alert.
 * Returns true if the change should be reported, false if suppressed.
 */
function checkKeywords(
  keywords: string[],
  mode: "added" | "deleted" | "any",
  oldText: string | undefined,
  newText: string | undefined
): boolean {
  if (keywords.length === 0) return true; // No keyword filter = always report

  const oldLower = (oldText ?? "").toLowerCase();
  const newLower = (newText ?? "").toLowerCase();

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();
    const wasPresent = oldLower.includes(kw);
    const isPresent = newLower.includes(kw);

    if (mode === "added" && !wasPresent && isPresent) return true;
    if (mode === "deleted" && wasPresent && !isPresent) return true;
    if (mode === "any" && wasPresent !== isPresent) return true;
  }

  return false; // No keyword condition met — suppress
}

export const processOneMonitor = internalAction({
  args: { monitorId: v.id("monitors") },
  handler: async (ctx, args) => {
    const monitor = await ctx.runQuery(
      internal.schedulerHelpers.getMonitor,
      { monitorId: args.monitorId }
    );
    if (!monitor) return;

    // Active days gate — skip check if today is not an active day
    if (monitor.activeDays && monitor.activeDays.length > 0) {
      const today = new Date().getDay(); // 0=Sun..6=Sat
      if (!monitor.activeDays.includes(today)) {
        await ctx.runMutation(internal.schedulerHelpers.rescheduleMonitor, {
          monitorId: args.monitorId,
        });
        return;
      }
    }

    const compareType = monitor.compareType ?? "all";

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
          mobileViewport: monitor.mobileViewport,
          blockAds: monitor.blockAds,
          delay: monitor.delay,
        }
      );

      // 1.5 Extract text content (skip if visual-only compare)
      let textContent: string | undefined;
      if (compareType !== "visual") {
        try {
          textContent = await ctx.runAction(
            internal.textExtraction.extractTextContent,
            {
              url: monitor.url,
              selector: isElementMode ? monitor.cssSelector : undefined,
            }
          );
        } catch (e) {
          console.error("Text extraction failed (non-fatal):", e);
        }
      }

      // 2. Get previous snapshot
      const lastSnapshot = monitor.lastSnapshotId
        ? await ctx.runQuery(internal.schedulerHelpers.getSnapshot, {
            snapshotId: monitor.lastSnapshotId,
          })
        : null;

      // 3. Compare (visual comparison)
      let result;
      if (compareType === "text") {
        // Text-only mode: still need to crop/store the screenshot, but skip pixelmatch
        if (isElementMode) {
          result = {
            croppedStorageId: fullStorageId,
            fullStorageId: fullStorageId,
            changed: false,
            diffPercentage: 0,
            diffStorageId: undefined as string | undefined,
          };
        } else {
          // Crop the zone but don't compare
          result = await ctx.runAction(
            internal.comparisonActions.cropAndCompare,
            {
              monitorId: monitor._id,
              fullStorageId,
              previousCroppedStorageId: undefined, // no previous = no comparison, just crop
              zone: monitor.zone,
              sensitivityThreshold: monitor.sensitivityThreshold ?? 0,
            }
          );
          // Override changed to false since we only care about text
          result = { ...result, changed: false, diffPercentage: 0 };
        }

        // Text-only change detection
        if (lastSnapshot?.textContent && textContent) {
          if (lastSnapshot.textContent !== textContent) {
            result = { ...result, changed: true, diffPercentage: 0 };
          }
        }
      } else if (isElementMode) {
        result = await ctx.runAction(
          internal.comparisonActions.compareElementScreenshots,
          {
            monitorId: monitor._id,
            currentStorageId: fullStorageId,
            previousStorageId: lastSnapshot?.storageId,
            sensitivityThreshold: monitor.sensitivityThreshold ?? 0,
          }
        );
      } else {
        result = await ctx.runAction(
          internal.comparisonActions.cropAndCompare,
          {
            monitorId: monitor._id,
            fullStorageId,
            previousCroppedStorageId: lastSnapshot?.storageId,
            zone: monitor.zone,
            sensitivityThreshold: monitor.sensitivityThreshold ?? 0,
          }
        );
      }

      // For "all" mode: also check text changes even if visual didn't change
      if (compareType === "all" && !result.changed && lastSnapshot?.textContent && textContent) {
        if (lastSnapshot.textContent !== textContent) {
          result = { ...result, changed: true };
        }
      }

      // Keyword filtering: suppress change if keywords are configured but no match
      if (
        result.changed &&
        monitor.keywords &&
        monitor.keywords.length > 0 &&
        lastSnapshot
      ) {
        const keywordMatch = checkKeywords(
          monitor.keywords,
          monitor.keywordMode ?? "any",
          lastSnapshot.textContent,
          textContent
        );
        if (!keywordMatch) {
          result = { ...result, changed: false };
        }
      }

      // 4. Store new snapshot
      const snapshotId = await ctx.runMutation(
        internal.schedulerHelpers.recordSnapshot,
        {
          monitorId: monitor._id,
          storageId: result.croppedStorageId,
          fullStorageId: result.fullStorageId,
          textContent,
        }
      );

      // 5. If changed, record and notify
      if (result.changed && lastSnapshot) {
        // Compute text diff if text content is available
        let textDiff: string | undefined;
        if (textContent && lastSnapshot.textContent) {
          const previousText = lastSnapshot.textContent;
          if (previousText !== textContent) {
            textDiff = createTwoFilesPatch(
              "before",
              "after",
              previousText,
              textContent,
              "",
              "",
              { context: 3 }
            );
          }
        }

        await ctx.runMutation(internal.schedulerHelpers.recordChange, {
          monitorId: monitor._id,
          beforeSnapshotId: monitor.lastSnapshotId!,
          afterSnapshotId: snapshotId,
          diffStorageId: result.diffStorageId ?? result.croppedStorageId,
          diffPercentage: result.diffPercentage,
          textDiff,
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
          try {
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
          } catch (e) {
            console.error("Email notification failed (non-fatal):", e);
          }
        }

        // Webhook notification
        if (monitor.webhookUrl) {
          try {
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
          } catch (e) {
            console.error("Webhook notification failed (non-fatal):", e);
          }
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

      // Alert on error notifications
      if (monitor.alertOnError) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const dashboardUrl = `${process.env.SITE_URL ?? "https://pagepulse.dev"}/dashboard/${monitor._id}`;

        const userEmail = await ctx.runQuery(
          internal.schedulerHelpers.getMonitorUserEmail,
          { monitorId: monitor._id }
        );

        if (userEmail) {
          try {
            await ctx.runAction(internal.emailActions.sendErrorNotification, {
              to: userEmail,
              monitorName: monitor.name,
              monitorUrl: monitor.url,
              errorMessage,
              dashboardUrl,
            });
          } catch (e) {
            console.error("Error email notification failed (non-fatal):", e);
          }
        }

        if (monitor.webhookUrl) {
          try {
            await ctx.runAction(internal.webhookActions.sendErrorWebhook, {
              monitorId: monitor._id,
              monitorName: monitor.name,
              monitorUrl: monitor.url,
              webhookUrl: monitor.webhookUrl,
              webhookType: monitor.webhookType ?? "generic",
              errorMessage,
              dashboardUrl,
            });
          } catch (e) {
            console.error("Error webhook notification failed (non-fatal):", e);
          }
        }
      }
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
