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
      { title: "PagePulse — Website Change Detection & Monitoring Alerts" },
      {
        name: "description",
        content:
          "Monitor any webpage for visual changes. Get email alerts with before/after screenshots when something changes. Track competitors, prices, job postings, and more.",
      },
      { property: "og:site_name", content: "PagePulse" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pagepulse.io" },
      { property: "og:image", content: "https://pagepulse.io/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://pagepulse.io/og-image.png" },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#2d5a2d" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://pagepulse.io" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "PagePulse",
          url: "https://pagepulse.io",
          description:
            "Website change detection and monitoring alerts for teams and individuals.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://pagepulse.io/use-cases?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "PagePulse",
          url: "https://pagepulse.io",
          logo: "https://pagepulse.io/logo.png",
          sameAs: [],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "PagePulse",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          description:
            "Monitor any webpage for visual changes. Get email alerts with before/after screenshots when something changes.",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "120",
          },
        }),
      },
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
