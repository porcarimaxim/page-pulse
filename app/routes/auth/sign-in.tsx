import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./-layout";
import SignInPage from "./-sign-in";

export const Route = createFileRoute("/auth/sign-in")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect_url: (search.redirect_url as string) ?? "",
  }),
  component: () => (
    <AuthShell>
      <SignInPage />
    </AuthShell>
  ),
});
