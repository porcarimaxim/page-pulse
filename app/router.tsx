import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultPending() {
  return (
    <div className="min-h-screen bg-[#f0f0e8] flex items-center justify-center">
      <div className="text-[#888]">Loading...</div>
    </div>
  );
}

export function getRouter() {
  // @ts-expect-error TanStack Router's typings require strictNullChecks=true.
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultPendingComponent: DefaultPending,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
