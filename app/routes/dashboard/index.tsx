import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MonitorCard } from "@/components/monitor/MonitorCard";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const monitors = useQuery(api.monitors.list, isSignedIn ? {} : "skip");

  if (isLoaded && !isSignedIn) {
    navigate({ to: "/auth/sign-in", search: { redirect_url: "/dashboard" } });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f0f0e8]">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              Monitors
            </h1>
            <p className="text-sm text-[#888] mt-1">
              {monitors?.length ?? 0} active monitor{monitors?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/new">
              <Plus className="w-4 h-4" />
              New Monitor
            </Link>
          </Button>
        </div>

        {/* Monitor Grid */}
        {monitors === undefined ? (
          <div className="text-center py-20 text-[#888]">Loading...</div>
        ) : monitors.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitors.map((monitor) => (
              <MonitorCard key={monitor._id} monitor={monitor} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-2 border-[#1a1a1a] border-dashed p-16 text-center">
      <Eye className="w-12 h-12 mx-auto mb-4 text-[#888]" />
      <h2 className="text-xl font-black uppercase tracking-tighter mb-2">
        No Monitors Yet
      </h2>
      <p className="text-sm text-[#888] mb-6 max-w-sm mx-auto">
        Create your first monitor to start tracking a webpage for changes.
      </p>
      <Button asChild>
        <Link to="/dashboard/new">
          <Plus className="w-4 h-4" />
          Create Your First Monitor
        </Link>
      </Button>
    </div>
  );
}
