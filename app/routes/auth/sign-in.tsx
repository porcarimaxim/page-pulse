import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./-layout";
import SignInPage from "./-sign-in";

export const Route = createFileRoute("/auth/sign-in")({
  component: () => (
    <AuthShell>
      <SignInPage />
    </AuthShell>
  ),
});
