"use node";

import { v } from "convex/values";
import { internalAction, action } from "./_generated/server";
import { internal, api } from "./_generated/api";

/**
 * Generate an AI summary for a detected change using the Claude API.
 * Called asynchronously after a change is recorded.
 */
export const generateChangeSummary = internalAction({
  args: {
    changeId: v.id("changes"),
    monitorId: v.id("monitors"),
    monitorName: v.string(),
    monitorUrl: v.string(),
    diffPercentage: v.number(),
    textDiff: v.optional(v.string()),
    beforeTextContent: v.optional(v.string()),
    afterTextContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user's Claude API key
    const monitor = await ctx.runQuery(internal.schedulerHelpers.getMonitor, {
      monitorId: args.monitorId,
    });
    if (!monitor) return;

    const settings = await ctx.runQuery(internal.aiHelpers.getUserSettings, {
      userId: monitor.userId,
    });
    if (!settings?.claudeApiKey) {
      console.log(`[AI] No Claude API key configured for user ${monitor.userId}`);
      return;
    }

    // Build the prompt
    const hasTextDiff = args.textDiff && args.textDiff.length > 0;
    const hasTextContent = args.beforeTextContent || args.afterTextContent;

    let contentDescription = "";
    if (hasTextDiff) {
      // Truncate very large diffs
      const diff = args.textDiff!.length > 3000
        ? args.textDiff!.slice(0, 3000) + "\n... (truncated)"
        : args.textDiff!;
      contentDescription = `\nText diff (unified format):\n\`\`\`\n${diff}\n\`\`\``;
    } else if (hasTextContent) {
      const before = (args.beforeTextContent ?? "").slice(0, 1500);
      const after = (args.afterTextContent ?? "").slice(0, 1500);
      contentDescription = `\nBefore text (excerpt):\n${before}\n\nAfter text (excerpt):\n${after}`;
    }

    const prompt = `You analyze website changes detected by a monitoring tool. A ${args.diffPercentage.toFixed(1)}% visual change was detected on "${args.monitorName}" (${args.monitorUrl}).

${contentDescription}

Your job is to identify WHAT specifically changed and WHY it matters. Classify the change into one of these categories and lead with it:

- PRICE CHANGE: identify old price → new price, product/plan affected
- STOCK/AVAILABILITY: item went in/out of stock, availability changed
- CONTENT UPDATE: new text, articles, announcements, or sections added/removed
- TIME/DATE UPDATE: timestamps, countdowns, schedules, or dates changed (e.g. a live clock — if so, say "Live clock update — not a meaningful change")
- LAYOUT/DESIGN: visual redesign, new UI elements, styling changes
- REMOVAL: content, products, pages, or sections were removed
- NEW FEATURE: new functionality, buttons, forms appeared
- STATUS CHANGE: service status, badges, labels changed

Rules:
- Be specific: quote actual values that changed (old → new) when available
- For time.is or clock pages: recognize that time display changes are expected and not meaningful
- For e-commerce: focus on prices, stock, and product changes
- For news sites: identify what headline or article changed
- If before/after text is nearly identical except for timestamps or minor dynamic content, say so clearly
- Keep it under 60 words. No markdown. No "Summary:" prefix.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": settings.claudeApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 150,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI] Claude API error ${response.status}: ${errorText}`);
        // Parse error detail if possible
        let detail = `Claude API returned ${response.status}.`;
        try {
          const errJson = JSON.parse(errorText);
          if (errJson.error?.message) {
            detail = errJson.error.message;
          }
        } catch {}
        await ctx.runMutation(internal.aiHelpers.saveAiSummary, {
          changeId: args.changeId,
          summary: `[Error] ${detail}`,
        });
        return;
      }

      const data = await response.json();
      const summary = data.content?.[0]?.text?.trim();

      if (summary) {
        await ctx.runMutation(internal.aiHelpers.saveAiSummary, {
          changeId: args.changeId,
          summary,
        });
        console.log(`[AI] Summary generated for change ${args.changeId}: "${summary.slice(0, 80)}..."`);
      } else {
        await ctx.runMutation(internal.aiHelpers.saveAiSummary, {
          changeId: args.changeId,
          summary: "[Error] No summary returned from Claude API.",
        });
      }
    } catch (error) {
      console.error("[AI] Failed to generate summary:", error);
      await ctx.runMutation(internal.aiHelpers.saveAiSummary, {
        changeId: args.changeId,
        summary: `[Error] ${error instanceof Error ? error.message : "Failed to generate summary"}`,
      });
    }
  },
});

/**
 * Generate AI summary on demand (user-triggered).
 */
export const generateSummaryOnDemand = action({
  args: {
    changeId: v.id("changes"),
  },
  handler: async (ctx, args) => {
    const change = await ctx.runQuery(api.changes.get, {
      changeId: args.changeId,
    });
    if (!change) throw new Error("Change not found");

    const monitor = await ctx.runQuery(internal.schedulerHelpers.getMonitor, {
      monitorId: change.monitorId,
    });
    if (!monitor) throw new Error("Monitor not found");

    const settings = await ctx.runQuery(internal.aiHelpers.getUserSettings, {
      userId: monitor.userId,
    });
    if (!settings?.claudeApiKey) {
      throw new Error("No Claude API key configured. Add your key in Settings.");
    }

    // Trigger async generation
    await ctx.scheduler.runAfter(0, internal.aiActions.generateChangeSummary, {
      changeId: args.changeId,
      monitorId: change.monitorId,
      monitorName: monitor.name,
      monitorUrl: monitor.url,
      diffPercentage: change.diffPercentage,
      textDiff: change.textDiff,
      beforeTextContent: change.beforeTextContent ?? undefined,
      afterTextContent: change.afterTextContent ?? undefined,
    });
  },
});
