"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { createTwoFilesPatch } from "diff";
import { callClaudeForSummary } from "./aiActions";

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
    const pipelineStart = Date.now();
    const monitor = await ctx.runQuery(
      internal.schedulerHelpers.getMonitor,
      { monitorId: args.monitorId }
    );
    if (!monitor) return;

    const label = `[processOneMonitor] "${monitor.name}" (${monitor.url})`;
    console.log(`${label} — starting pipeline`);

    // Active days gate — skip check if today is not an active day
    if (monitor.activeDays && monitor.activeDays.length > 0) {
      const today = new Date().getDay(); // 0=Sun..6=Sat
      if (!monitor.activeDays.includes(today)) {
        console.log(`${label} — skipped (day ${today} not in activeDays)`);
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
      const t1 = Date.now();
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
      const screenshotMs = Date.now() - t1;
      console.log(`${label} — step 1 screenshot: ${screenshotMs}ms`);

      // 1.5 Extract text content (skip if visual-only compare)
      let textContent: string | undefined;
      if (compareType !== "visual") {
        const t15 = Date.now();
        try {
          textContent = await ctx.runAction(
            internal.textExtraction.extractTextContent,
            {
              url: monitor.url,
              selector: isElementMode ? monitor.cssSelector : undefined,
            }
          );
          console.log(`${label} — step 1.5 text extraction: ${Date.now() - t15}ms (${textContent?.length ?? 0} chars)`);
        } catch (e) {
          console.error(`${label} — step 1.5 text extraction FAILED in ${Date.now() - t15}ms:`, e);
        }
      }

      // 2. Get previous snapshot
      const t2 = Date.now();
      const lastSnapshot = monitor.lastSnapshotId
        ? await ctx.runQuery(internal.schedulerHelpers.getSnapshot, {
            snapshotId: monitor.lastSnapshotId,
          })
        : null;
      console.log(`${label} — step 2 get previous snapshot: ${Date.now() - t2}ms (found: ${!!lastSnapshot})`);

      // 3. Compare (visual comparison)
      const t3 = Date.now();
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
      const compareMs = Date.now() - t3;
      console.log(`${label} — step 3 comparison (${compareType}/${isElementMode ? "element" : "zone"}): ${compareMs}ms, changed=${result.changed}, diff=${result.diffPercentage}%`);

      // For "all" mode: also check text changes even if visual didn't change
      if (compareType === "all" && !result.changed && lastSnapshot?.textContent && textContent) {
        if (lastSnapshot.textContent !== textContent) {
          result = { ...result, changed: true };
          console.log(`${label} — text change detected (visual was unchanged)`);
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
          console.log(`${label} — change suppressed by keyword filter (mode=${monitor.keywordMode})`);
        }
      }

      // 4. Store new snapshot
      const t4 = Date.now();
      const snapshotId = await ctx.runMutation(
        internal.schedulerHelpers.recordSnapshot,
        {
          monitorId: monitor._id,
          storageId: result.croppedStorageId,
          fullStorageId: result.fullStorageId,
          textContent,
        }
      );
      console.log(`${label} — step 4 record snapshot: ${Date.now() - t4}ms`);

      // 5. If changed, record and notify
      if (result.changed && lastSnapshot) {
        const t5 = Date.now();
        // Compute text diff if text content is available
        let textDiff: string | undefined;
        if (textContent && lastSnapshot.textContent) {
          const previousText = lastSnapshot.textContent;
          if (previousText !== textContent) {
            const tDiff = Date.now();
            textDiff = createTwoFilesPatch(
              "before",
              "after",
              previousText,
              textContent,
              "",
              "",
              { context: 3 }
            );
            console.log(`${label} — text diff generation: ${Date.now() - tDiff}ms`);
          }
        }

        const changeId = await ctx.runMutation(internal.schedulerHelpers.recordChange, {
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

        // Generate AI summary inline (before email so we can include it)
        let aiSummary: string | undefined;
        const tAi = Date.now();
        try {
          // Check if user has AI enabled
          const userSettings = await ctx.runQuery(internal.aiHelpers.getUserSettings, {
            userId: monitor.userId,
          });
          if (userSettings?.aiEnabled !== false) {
            const summary = await callClaudeForSummary({
              monitorName: monitor.name,
              monitorUrl: monitor.url,
              diffPercentage: result.diffPercentage,
              textDiff,
              beforeTextContent: lastSnapshot?.textContent,
              afterTextContent: textContent,
            });
            if (summary) {
              aiSummary = summary;
              // Save to the change record
              await ctx.runMutation(internal.aiHelpers.saveAiSummary, {
                changeId: changeId!,
                summary,
              });
              console.log(`${label} — AI summary: ${Date.now() - tAi}ms "${summary.slice(0, 60)}..."`);
            }
          }
        } catch (e) {
          console.error(`${label} — AI summary FAILED in ${Date.now() - tAi}ms:`, e);
        }

        // Email notification
        const tEmail = Date.now();
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
              aiSummary,
              dashboardUrl: `${process.env.SITE_URL ?? "https://pagepulse.dev"}/dashboard/${monitor._id}`,
            });
            console.log(`${label} — email notification: ${Date.now() - tEmail}ms`);
          } catch (e) {
            console.error(`${label} — email notification FAILED in ${Date.now() - tEmail}ms:`, e);
          }
        }

        // Webhook notification
        if (monitor.webhookUrl) {
          const tWebhook = Date.now();
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
            console.log(`${label} — webhook notification: ${Date.now() - tWebhook}ms`);
          } catch (e) {
            console.error(`${label} — webhook notification FAILED in ${Date.now() - tWebhook}ms:`, e);
          }
        }

        console.log(`${label} — step 5 change recording + notifications: ${Date.now() - t5}ms`);
      }

      // 5.5 Look up element bounding box for element monitors missing zone data
      let elementZone: { x: number; y: number; width: number; height: number } | undefined;
      if (
        isElementMode &&
        monitor.zone.x === 0 && monitor.zone.y === 0 &&
        monitor.zone.width === 100 && monitor.zone.height === 100
      ) {
        try {
          const elements = await ctx.runAction(
            internal.screenshotActions.getPageElementMapInternal,
            { url: monitor.url, mobileViewport: monitor.mobileViewport }
          ) as Array<{ selector: string; x: number; y: number; w: number; h: number }>;
          const match = elements.find((el) => el.selector === monitor.cssSelector);
          if (match) {
            elementZone = { x: match.x, y: match.y, width: match.w, height: match.h };
            console.log(`${label} — resolved element zone: ${JSON.stringify(elementZone)}`);
          }
        } catch (e) {
          console.error(`${label} — element zone lookup failed (non-fatal):`, e);
        }
      }

      // 6. Update monitor
      const t6 = Date.now();
      await ctx.runMutation(internal.schedulerHelpers.updateMonitorAfterCheck, {
        monitorId: monitor._id,
        snapshotId,
        changed: result.changed,
        elementZone,
      });
      console.log(`${label} — step 6 update monitor: ${Date.now() - t6}ms`);
      console.log(`${label} — PIPELINE COMPLETE: ${Date.now() - pipelineStart}ms (screenshot: ${screenshotMs}ms, compare: ${compareMs}ms, changed: ${result.changed})`);
    } catch (error) {
      console.error(`${label} — PIPELINE FAILED after ${Date.now() - pipelineStart}ms:`, error);
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
