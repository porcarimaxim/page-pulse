"use node";

import { v } from "convex/values";
import { internalAction, action } from "./_generated/server";
import { internal, api } from "./_generated/api";

/* ─── Shared helper: call Claude API and return summary ─── */

export async function callClaudeForSummary(args: {
  monitorName: string;
  monitorUrl: string;
  diffPercentage: number;
  textDiff?: string;
  beforeTextContent?: string;
  afterTextContent?: string;
}): Promise<string | null> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return null;

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
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 80,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] Claude API error ${response.status}: ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error("[AI] Failed to generate summary:", error);
    return null;
  }
}

/**
 * Generate an AI summary for a detected change using the Claude API.
 * Called from the scheduler pipeline (inline) or async as fallback.
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
    if (!process.env.CLAUDE_API_KEY) {
      console.log("[AI] No CLAUDE_API_KEY configured");
      return;
    }

    const monitor = await ctx.runQuery(internal.schedulerHelpers.getMonitor, {
      monitorId: args.monitorId,
    });
    if (!monitor) return;

    const settings = await ctx.runQuery(internal.aiHelpers.getUserSettings, {
      userId: monitor.userId,
    });
    if (settings?.aiEnabled === false) {
      console.log(`[AI] AI summaries disabled for user ${monitor.userId}`);
      return;
    }

    const summary = await callClaudeForSummary({
      monitorName: args.monitorName,
      monitorUrl: args.monitorUrl,
      diffPercentage: args.diffPercentage,
      textDiff: args.textDiff,
      beforeTextContent: args.beforeTextContent,
      afterTextContent: args.afterTextContent,
    });

    await ctx.runMutation(internal.aiHelpers.saveAiSummary, {
      changeId: args.changeId,
      summary: summary ?? "[Error] Failed to generate summary.",
    });

    if (summary) {
      console.log(`[AI] Summary generated for change ${args.changeId}: "${summary.slice(0, 80)}..."`);
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

    if (!process.env.CLAUDE_API_KEY) {
      throw new Error("AI summaries are not available — server API key not configured.");
    }

    // Check if user has AI enabled
    const settings = await ctx.runQuery(internal.aiHelpers.getUserSettings, {
      userId: monitor.userId,
    });
    if (settings?.aiEnabled === false) {
      throw new Error("AI summaries are disabled. Enable them in Settings.");
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
