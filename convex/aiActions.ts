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
    if (settings.aiEnabled === false) {
      console.log(`[AI] AI summaries disabled for user ${monitor.userId}`);
      return;
    }

    // Build the prompt
    const hasTextDiff = args.textDiff && args.textDiff.length > 0;
    const hasTextContent = args.beforeTextContent || args.afterTextContent;

    let contentDescription = "";
    if (hasTextDiff) {
      const diff = args.textDiff!.length > 3000
        ? args.textDiff!.slice(0, 3000) + "\n... (truncated)"
        : args.textDiff!;
      contentDescription = `\nText diff (unified format):\n\`\`\`\n${diff}\n\`\`\``;
    } else if (hasTextContent) {
      const before = (args.beforeTextContent ?? "").slice(0, 1500);
      const after = (args.afterTextContent ?? "").slice(0, 1500);
      contentDescription = `\nBefore text (excerpt):\n${before}\n\nAfter text (excerpt):\n${after}`;
    } else {
      contentDescription = `\nNo text content available — only a visual screenshot diff. Infer from the URL and diff percentage what likely changed.`;
    }

    const prompt = `A monitoring tool detected a ${args.diffPercentage.toFixed(1)}% visual change on "${args.monitorName}" (${args.monitorUrl}).
${contentDescription}

Write ONE short sentence describing what changed. Be specific — quote actual values (old → new) when possible. You MUST answer even with limited data — use the URL and diff % to infer.

Examples of good answers:
- "Price dropped $49/mo → $39/mo on Pro plan."
- "Nike Air Max 90 back in stock."
- "3 new job listings added to careers page."
- "Live clock updated — not a real change."
- "New article: 'Q1 2026 Product Roadmap'."
- "Restaurant reservation slots opened for Saturday."
- "Scholarship deadline extended to April 15."
- "Flight LAX→JFK dropped $420 → $380."
- "Concert tickets now showing 'Sold Out'."
- "Competitor added new 'Enterprise' pricing tier."
- "Regulatory filing FR-2026-0042 published."
- "Insurance policy wording updated in Section 4.2."
- "Google ranking for 'best CRM' moved #5 → #3."
- "Product listing photo changed on main SKU."
- "Government press release added about tax reform."
- "Social media bio changed from 'CEO' → 'Founder & CEO'."
- "Course enrollment status changed to 'Closed'."
- "SaaS status page: API latency incident reported."
- "Legal disclaimer text updated with new arbitration clause."
- "News homepage lead story changed to election coverage."

One sentence only. Never say you can't access the site.`;

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
          max_tokens: 80,
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
