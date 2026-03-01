import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MonitorCard } from "@/components/monitor/MonitorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Search, Activity, Pause, AlertTriangle, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

type StatusFilter = "all" | "active" | "paused" | "error";

function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const monitors = useQuery(api.monitors.list, isSignedIn ? {} : "skip");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  if (isLoaded && !isSignedIn) {
    navigate({ to: "/auth/sign-in", search: { redirect_url: "/dashboard" } as any });
    return null;
  }

  const stats = useMemo(() => {
    if (!monitors) return { total: 0, active: 0, changes: 0, errors: 0 };
    return {
      total: monitors.length,
      active: monitors.filter((m) => m.status === "active").length,
      changes: monitors.reduce((sum, m) => sum + m.changeCount, 0),
      errors: monitors.filter((m) => m.status === "error").length,
    };
  }, [monitors]);

  const allTags = useMemo(() => {
    if (!monitors) return [];
    const tags = new Set<string>();
    monitors.forEach((m) => m.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [monitors]);

  const filteredMonitors = useMemo(() => {
    if (!monitors) return [];
    return monitors.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (tagFilter && !(m.tags ?? []).includes(tagFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.url.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [monitors, search, statusFilter, tagFilter]);

  return (
    <div className="min-h-screen bg-[#f0f0e8]">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Monitors
          </h1>
          <Button asChild>
            <Link to="/dashboard/new">
              <Plus className="w-4 h-4" />
              New Monitor
            </Link>
          </Button>
        </div>

        {monitors === undefined ? (
          <div className="text-center py-20 text-[#888]">Loading...</div>
        ) : monitors.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Stats strip */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="border-2 border-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-3 h-3 text-[#888]" />
                  <span className="text-[10px] font-bold uppercase text-[#888]">
                    Total
                  </span>
                </div>
                <p className="text-2xl font-black">{stats.total}</p>
              </div>
              <div className="border-2 border-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3 h-3 text-[#2d5a2d]" />
                  <span className="text-[10px] font-bold uppercase text-[#888]">
                    Active
                  </span>
                </div>
                <p className="text-2xl font-black text-[#2d5a2d]">
                  {stats.active}
                </p>
              </div>
              <div className="border-2 border-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3 text-[#888]" />
                  <span className="text-[10px] font-bold uppercase text-[#888]">
                    Changes
                  </span>
                </div>
                <p className="text-2xl font-black">{stats.changes}</p>
              </div>
              <div className="border-2 border-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3 h-3 text-[#dc2626]" />
                  <span className="text-[10px] font-bold uppercase text-[#888]">
                    Errors
                  </span>
                </div>
                <p className={`text-2xl font-black ${stats.errors > 0 ? "text-[#dc2626]" : ""}`}>
                  {stats.errors}
                </p>
              </div>
            </div>

            {/* Search + filters */}
            <div className="space-y-3 mb-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or URL..."
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-0">
                  {(
                    [
                      { value: "all", label: "All", icon: null },
                      { value: "active", label: "Active", icon: Activity },
                      { value: "paused", label: "Paused", icon: Pause },
                      { value: "error", label: "Error", icon: AlertTriangle },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setStatusFilter(f.value)}
                      className={`border-2 border-[#1a1a1a] px-3 py-2 text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                        f.value !== "all" ? "border-l-0" : ""
                      } ${
                        statusFilter === f.value
                          ? "bg-[#1a1a1a] text-[#f0f0e8]"
                          : "bg-transparent text-[#1a1a1a] hover:bg-[#e8e8e0]"
                      }`}
                    >
                      {f.icon && <f.icon className="w-3 h-3" />}
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag filters */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase text-[#888]">
                    Tags:
                  </span>
                  <button
                    onClick={() => setTagFilter(null)}
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 border transition-all ${
                      tagFilter === null
                        ? "border-[#1a1a1a] bg-[#1a1a1a] text-[#f0f0e8]"
                        : "border-[#ccc] text-[#888] hover:border-[#1a1a1a]"
                    }`}
                  >
                    All
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setTagFilter(tagFilter === tag ? null : tag)
                      }
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 border transition-all ${
                        tagFilter === tag
                          ? "border-[#2d5a2d] bg-[#2d5a2d] text-[#f0f0e8]"
                          : "border-[#ccc] text-[#888] hover:border-[#1a1a1a]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results count */}
            <p className="text-xs text-[#888] mb-4">
              {filteredMonitors.length} monitor
              {filteredMonitors.length !== 1 ? "s" : ""}
              {(search || statusFilter !== "all" || tagFilter) && " matching filters"}
            </p>

            {/* Monitor Grid */}
            {filteredMonitors.length === 0 ? (
              <div className="border-2 border-[#ccc] border-dashed p-8 text-center">
                <p className="text-sm text-[#888]">
                  No monitors match your filters.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMonitors.map((monitor) => (
                  <MonitorCard key={monitor._id} monitor={monitor} />
                ))}
              </div>
            )}
          </>
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
