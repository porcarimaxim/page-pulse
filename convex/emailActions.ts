"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

export const sendChangeNotification = internalAction({
  args: {
    to: v.string(),
    monitorName: v.string(),
    monitorUrl: v.string(),
    diffPercentage: v.number(),
    beforeUrl: v.optional(v.string()),
    afterUrl: v.optional(v.string()),
    diffUrl: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
    dashboardUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY — skipping email");
      return;
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "Snaplert <notifications@snaplert.com>",
      to: [args.to],
      subject: `Change detected: ${args.monitorName}`,
      html: `
        <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #f0f0e8; padding: 32px; border: 2px solid #1a1a1a;">
          <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin: 0 0 8px 0; color: #1a1a1a;">
            CHANGE DETECTED
          </h1>
          <p style="color: #888; font-size: 14px; margin: 0 0 24px 0;">
            ${args.monitorName} &mdash; ${args.diffPercentage}% changed
          </p>

          <div style="border: 2px solid #1a1a1a; padding: 16px; margin-bottom: 24px; background: white;">
            <p style="font-size: 12px; text-transform: uppercase; font-weight: bold; color: #888; margin: 0 0 4px 0;">
              Monitored URL
            </p>
            <a href="${args.monitorUrl}" style="color: #2d5a2d; font-size: 14px;">
              ${args.monitorUrl}
            </a>
          </div>

          ${args.aiSummary ? `
            <div style="border: 2px solid #7c3aed; padding: 16px; margin-bottom: 24px; background: #faf5ff;">
              <p style="font-size: 12px; text-transform: uppercase; font-weight: bold; color: #7c3aed; margin: 0 0 8px 0;">
                &#10024; AI Summary
              </p>
              <p style="font-size: 14px; color: #1a1a1a; margin: 0; line-height: 1.5;">
                ${args.aiSummary}
              </p>
            </div>
          ` : ""}

          ${args.beforeUrl && args.afterUrl ? `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="width: 50%; padding-right: 8px; vertical-align: top;">
                  <p style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #888; margin: 0 0 8px 0;">Before</p>
                  <img src="${args.beforeUrl}" style="width: 100%; border: 2px solid #1a1a1a;" />
                </td>
                <td style="width: 50%; padding-left: 8px; vertical-align: top;">
                  <p style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #888; margin: 0 0 8px 0;">After</p>
                  <img src="${args.afterUrl}" style="width: 100%; border: 2px solid #1a1a1a;" />
                </td>
              </tr>
            </table>
          ` : ""}

          ${args.diffUrl ? `
            <div style="margin-bottom: 24px;">
              <p style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #888; margin: 0 0 8px 0;">Diff</p>
              <img src="${args.diffUrl}" style="width: 100%; border: 2px solid #dc2626;" />
            </div>
          ` : ""}

          <a href="${args.dashboardUrl}" style="display: inline-block; background: #1a1a1a; color: #f0f0e8; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 0.05em; border: 2px solid #1a1a1a;">
            View Details
          </a>

          <p style="color: #888; font-size: 11px; margin-top: 24px;">
            Sent by Snaplert &mdash; You're receiving this because you set up monitoring for this URL.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw new Error(`Email failed: ${error.message}`);
    }

    return data;
  },
});

export const sendErrorNotification = internalAction({
  args: {
    to: v.string(),
    monitorName: v.string(),
    monitorUrl: v.string(),
    errorMessage: v.string(),
    dashboardUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY — skipping error email");
      return;
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "Snaplert <notifications@snaplert.com>",
      to: [args.to],
      subject: `Error: ${args.monitorName}`,
      html: `
        <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #f0f0e8; padding: 32px; border: 2px solid #dc2626;">
          <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin: 0 0 8px 0; color: #dc2626;">
            MONITOR ERROR
          </h1>
          <p style="color: #888; font-size: 14px; margin: 0 0 24px 0;">
            ${args.monitorName} encountered an error during check
          </p>

          <div style="border: 2px solid #1a1a1a; padding: 16px; margin-bottom: 16px; background: white;">
            <p style="font-size: 12px; text-transform: uppercase; font-weight: bold; color: #888; margin: 0 0 4px 0;">
              Monitored URL
            </p>
            <a href="${args.monitorUrl}" style="color: #2d5a2d; font-size: 14px;">
              ${args.monitorUrl}
            </a>
          </div>

          <div style="border: 2px solid #dc2626; padding: 16px; margin-bottom: 24px; background: #fef2f2;">
            <p style="font-size: 12px; text-transform: uppercase; font-weight: bold; color: #dc2626; margin: 0 0 4px 0;">
              Error
            </p>
            <p style="font-size: 13px; color: #1a1a1a; margin: 0; word-break: break-all;">
              ${args.errorMessage}
            </p>
          </div>

          <a href="${args.dashboardUrl}" style="display: inline-block; background: #1a1a1a; color: #f0f0e8; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 0.05em; border: 2px solid #1a1a1a;">
            View Monitor
          </a>

          <p style="color: #888; font-size: 11px; margin-top: 24px;">
            Sent by Snaplert &mdash; You're receiving this because you enabled error alerts for this monitor.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send error email:", error);
      throw new Error(`Error email failed: ${error.message}`);
    }

    return data;
  },
});
