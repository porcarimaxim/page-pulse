import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";

export function useWebhookTest() {
  const testWebhookAction = useAction(api.webhookActions.testWebhook);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestWebhook = async (
    webhookUrl: string,
    webhookType: "generic" | "slack" | "discord"
  ) => {
    if (!webhookUrl) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      await testWebhookAction({ webhookUrl, webhookType });
      setTestResult("success");
    } catch (err) {
      console.error("Webhook test failed:", err);
      setTestResult("error");
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  return { isTesting, testResult, handleTestWebhook };
}
