import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/tanstack-react-start";
import type { ReactNode } from "react";

import { ConvexClientProvider } from "@/lib/convex";
import { TooltipProvider } from "@/components/ui/tooltip";
import appCss from "../app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PagePulse — Track any webpage for changes" },
      {
        name: "description",
        content:
          "Monitor any webpage for visual changes. Get email alerts with before/after screenshots when something changes. Dead simple page monitoring.",
      },
      { property: "og:site_name", content: "PagePulse" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
  errorComponent: ({ error }) => {
    return (
      <main className="pt-16 p-4 container mx-auto">
        <h1 className="font-black text-2xl uppercase">Error</h1>
        <p className="mt-2 text-[#888]">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </main>
    );
  },
});

function RootComponent() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <RootDocument>{children}</RootDocument>
    </ClerkProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className="h-full antialiased">
        <ConvexClientProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ConvexClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
