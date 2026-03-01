import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./-layout";
import SignUpPage from "./-sign-up";

export const Route = createFileRoute("/auth/sign-up/$")({
  component: () => (
    <AuthShell>
      <SignUpPage />
    </AuthShell>
  ),
});
