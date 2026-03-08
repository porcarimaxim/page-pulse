import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { Eye, Zap, CheckCircle } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const { isSignedIn } = useAuth();
  const monitors = useQuery(api.monitors.list, isSignedIn ? {} : "skip");

  const stats = useMemo(() => {
    if (!monitors) return { checks: 0, changes: 0, noChanges: 0 };
    const totalChanges = monitors.reduce((sum, m) => sum + m.changeCount, 0);
    const totalChecked = monitors.filter((m) => m.lastCheckedAt).length;
    return {
      checks: totalChecked,
      changes: totalChanges,
      noChanges: Math.max(0, totalChecked - totalChanges),
    };
  }, [monitors]);

  return (
    <main className="px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Dashboard
        </h1>
        <p className="text-sm text-[#888] mt-1">
          Overview of your checks and changes
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#2d5a2d] flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#f0f0e8]" />
            </div>
            <span className="text-sm font-bold uppercase text-[#888]">
              Checks
            </span>
          </div>
          <p className="text-4xl font-black">{stats.checks}</p>
          <div className="mt-3 h-1 bg-[#2d5a2d]" />
        </div>

        <div className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#7cb87c] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#f0f0e8]" />
            </div>
            <span className="text-sm font-bold uppercase text-[#888]">
              Changes
            </span>
          </div>
          <p className="text-4xl font-black">{stats.changes}</p>
          <div className="mt-3 h-1 bg-[#7cb87c]" />
        </div>

        <div className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#1a1a1a] flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-[#f0f0e8]" />
            </div>
            <span className="text-sm font-bold uppercase text-[#888]">
              No Changes
            </span>
          </div>
          <p className="text-4xl font-black">{stats.noChanges}</p>
          <div className="mt-3 h-1 bg-[#1a1a1a]" />
        </div>
      </div>

      {/* Checks and changes trend */}
      <div className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <h2 className="text-lg font-black uppercase tracking-tighter mb-4">
          Checks and Changes Trend
        </h2>
        {monitors === undefined ? (
          <div className="text-center py-12 text-[#888]">Loading...</div>
        ) : monitors.length === 0 ? (
          <div className="text-center py-12 text-[#888]">
            <p className="text-sm">No monitoring data yet.</p>
            <p className="text-xs mt-1">Create a monitor to start tracking changes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Simple bar chart representation */}
            <div className="flex items-center gap-4 text-xs text-[#888]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#2d5a2d]" />
                <span>Changes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#ccc]" />
                <span>No changes</span>
              </div>
            </div>
            <div className="border-t border-[#ccc] pt-4">
              {monitors.map((m) => (
                <div key={m._id} className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold w-32 truncate">{m.name}</span>
                  <div className="flex-1 h-6 bg-[#e8e8e0] relative overflow-hidden">
                    {m.changeCount > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 bg-[#2d5a2d]"
                        style={{
                          width: `${Math.min(100, m.changeCount * 10)}%`,
                        }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-[#888] w-8 text-right">
                    {m.changeCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
