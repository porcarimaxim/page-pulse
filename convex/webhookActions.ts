"use node";

import { v } from "convex/values";
import { internalAction, action } from "./_generated/server";
import { getIdentity } from "./auth";

export const sendWebhook = internalAction({
  args: {
    monitorId: v.id("monitors"),
    monitorName: v.string(),
    monitorUrl: v.string(),
    webhookUrl: v.string(),
    webhookType: v.string(),
    diffPercentage: v.number(),
    beforeUrl: v.optional(v.string()),
    afterUrl: v.optional(v.string()),
    diffUrl: v.optional(v.string()),
    dashboardUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    let body: string;

    if (args.webhookType === "slack") {
      body = JSON.stringify({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Change detected: ${args.monitorName}`,
            },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*URL:*\n${args.monitorUrl}` },
              {
                type: "mrkdwn",
                text: `*Diff:*\n${args.diffPercentage}%`,
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View in Dashboard" },
                url: args.dashboardUrl,
              },
            ],
          },
        ],
      });
    } else if (args.webhookType === "discord") {
      body = JSON.stringify({
        embeds: [
          {
            title: `Change detected: ${args.monitorName}`,
            url: args.dashboardUrl,
            color: 0x2d5a2d,
            fields: [
              { name: "URL", value: args.monitorUrl, inline: true },
              {
                name: "Diff",
                value: `${args.diffPercentage}%`,
                inline: true,
              },
            ],
            image: args.diffUrl ? { url: args.diffUrl } : undefined,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } else {
      // Generic JSON
      body = JSON.stringify({
        event: "change_detected",
        monitor: {
          id: args.monitorId,
          name: args.monitorName,
          url: args.monitorUrl,
        },
        change: {
          diffPercentage: args.diffPercentage,
          beforeUrl: args.beforeUrl,
          afterUrl: args.afterUrl,
          diffUrl: args.diffUrl,
          dashboardUrl: args.dashboardUrl,
          detectedAt: new Date().toISOString(),
        },
      });
    }

    try {
      const response = await fetch(args.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        console.error(
          `Webhook failed for monitor ${args.monitorId}: ${response.status}`
        );
      }
    } catch (error) {
      console.error(`Webhook error for monitor ${args.monitorId}:`, error);
    }
  },
});

export const sendErrorWebhook = internalAction({
  args: {
    monitorId: v.id("monitors"),
    monitorName: v.string(),
    monitorUrl: v.string(),
    webhookUrl: v.string(),
    webhookType: v.string(),
    errorMessage: v.string(),
    dashboardUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    let body: string;

    if (args.webhookType === "slack") {
      body = JSON.stringify({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Error: ${args.monitorName}`,
            },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*URL:*\n${args.monitorUrl}` },
              { type: "mrkdwn", text: `*Error:*\n${args.errorMessage}` },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View in Dashboard" },
                url: args.dashboardUrl,
              },
            ],
          },
        ],
      });
    } else if (args.webhookType === "discord") {
      body = JSON.stringify({
        embeds: [
          {
            title: `Error: ${args.monitorName}`,
            url: args.dashboardUrl,
            color: 0xdc2626,
            fields: [
              { name: "URL", value: args.monitorUrl, inline: true },
              { name: "Error", value: args.errorMessage, inline: false },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } else {
      body = JSON.stringify({
        event: "monitor_error",
        monitor: {
          id: args.monitorId,
          name: args.monitorName,
          url: args.monitorUrl,
        },
        error: {
          message: args.errorMessage,
          dashboardUrl: args.dashboardUrl,
          detectedAt: new Date().toISOString(),
        },
      });
    }

    try {
      const response = await fetch(args.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        console.error(
          `Error webhook failed for monitor ${args.monitorId}: ${response.status}`
        );
      }
    } catch (error) {
      console.error(`Error webhook error for monitor ${args.monitorId}:`, error);
    }
  },
});

export const testWebhook = action({
  args: {
    webhookUrl: v.string(),
    webhookType: v.union(
      v.literal("generic"),
      v.literal("slack"),
      v.literal("discord")
    ),
  },
  handler: async (ctx, args) => {
    await getIdentity(ctx);

    let body: string;

    if (args.webhookType === "slack") {
      body = JSON.stringify({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "PagePulse Test Notification",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "This is a test webhook from PagePulse. Your integration is working correctly!",
            },
          },
        ],
      });
    } else if (args.webhookType === "discord") {
      body = JSON.stringify({
        embeds: [
          {
            title: "PagePulse Test Notification",
            description:
              "This is a test webhook from PagePulse. Your integration is working correctly!",
            color: 0x2d5a2d,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } else {
      body = JSON.stringify({
        event: "test",
        message:
          "This is a test webhook from PagePulse. Your integration is working correctly!",
        timestamp: new Date().toISOString(),
      });
    }

    const response = await fetch(args.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!response.ok) {
      throw new Error(`Webhook test failed: ${response.status}`);
    }

    return { success: true };
  },
});
