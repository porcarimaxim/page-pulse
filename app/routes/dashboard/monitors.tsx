import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
import {
  Plus,
  Search,
  Activity,
  Pause,
  AlertTriangle,
  Eye,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/monitors")({
  component: MonitorsListPage,
});

function MonitorsListPage() {
  const { isSignedIn } = useAuth();
  const monitors = useQuery(api.monitors.list, isSignedIn ? {} : "skip");
  const pauseMonitor = useMutation(api.monitors.pause);
  const resumeMonitor = useMutation(api.monitors.resume);
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    if (!monitors) return { total: 0, active: 0, changes: 0 };
    return {
      total: monitors.length,
      active: monitors.filter((m) => m.status === "active").length,
      changes: monitors.reduce((sum, m) => sum + m.changeCount, 0),
    };
  }, [monitors]);

  const filteredMonitors = useMemo(() => {
    if (!monitors) return [];
    if (!search) return monitors;
    const q = search.toLowerCase();
    return monitors.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.url.toLowerCase().includes(q)
    );
  }, [monitors, search]);

  const handleToggle = async (
    monitorId: string,
    currentStatus: string
  ) => {
    const id = monitorId as Id<"monitors">;
    if (currentStatus === "active") {
      await pauseMonitor({ monitorId: id });
    } else {
      await resumeMonitor({ monitorId: id });
    }
  };

  return (
    <main className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Monitoring Jobs
        </h1>
        <Button asChild>
          <Link to="/dashboard/new">
            <Plus className="w-4 h-4" />
            Add New
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
            <div className="border-2 border-[#1a1a1a] p-4">
              <p className="text-xs font-bold uppercase text-[#888]">
                Total Jobs
              </p>
              <p className="text-2xl font-black mt-1">{stats.total}</p>
            </div>
            <div className="border-2 border-[#1a1a1a] p-4">
              <p className="text-xs font-bold uppercase text-[#888]">
                Active Jobs
              </p>
              <p className="text-2xl font-black mt-1">
                {stats.active}
                <span className="text-sm font-bold text-[#888]">
                  {" "}
                  of {stats.total}
                </span>
              </p>
            </div>
            <div className="border-2 border-[#1a1a1a] p-4">
              <p className="text-xs font-bold uppercase text-[#888]">
                Detected Changes
              </p>
              <p className="text-2xl font-black mt-1">{stats.changes}</p>
            </div>
            <div className="border-2 border-[#1a1a1a] p-4">
              <p className="text-xs font-bold uppercase text-[#888]">
                Remaining Checks
              </p>
              <p className="text-2xl font-black mt-1">&infin;</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="pl-10"
              />
            </div>
            <div className="flex-1" />
            <button className="border-2 border-[#1a1a1a] p-2 hover:bg-[#e8e8e0] transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="border-2 border-[#1a1a1a]">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a] text-left">
                  <th className="px-4 py-3 text-xs font-bold uppercase text-[#888]">
                    Is Active
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-[#888]">
                    Job Name
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-[#888]">
                    Interval
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-[#888]">
                    Last Check
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-[#888]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-[#888]">
                    Changes
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-[#888]" />
                </tr>
              </thead>
              <tbody>
                {filteredMonitors.map((monitor) => (
                  <tr
                    key={monitor._id}
                    className="border-b border-[#ccc] hover:bg-[#e8e8e0] transition-colors"
                  >
                    {/* Toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleToggle(monitor._id, monitor.status)
                        }
                        className={`w-10 h-5 relative transition-colors ${
                          monitor.status === "active"
                            ? "bg-[#2d5a2d]"
                            : "bg-[#ccc]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-[#f0f0e8] transition-transform ${
                            monitor.status === "active"
                              ? "translate-x-5"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Name + URL */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-bold">{monitor.name}</p>
                        <p className="text-xs text-[#888] font-mono truncate max-w-xs">
                          {monitor.url}
                        </p>
                      </div>
                    </td>

                    {/* Interval */}
                    <td className="px-4 py-3 text-xs text-[#888]">
                      {intervalLabel(monitor.interval)}
                    </td>

                    {/* Last Check */}
                    <td className="px-4 py-3 text-xs text-[#888]">
                      {monitor.lastCheckedAt
                        ? formatRelativeTime(monitor.lastCheckedAt)
                        : "Never"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={monitor.status}
                        changeCount={monitor.changeCount}
                      />
                    </td>

                    {/* Changes */}
                    <td className="px-4 py-3 text-sm font-bold">
                      {monitor.changeCount}
                    </td>

                    {/* Detail link */}
                    <td className="px-4 py-3">
                      <Link
                        to="/dashboard/$monitorId"
                        params={{ monitorId: monitor._id } as any}
                        className="text-xs font-bold uppercase text-[#2d5a2d] hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination hint */}
          <div className="flex items-center justify-end mt-3">
            <p className="text-xs text-[#888]">
              Showing {filteredMonitors.length} of {monitors.length}
            </p>
          </div>
        </>
      )}
    </main>
  );
}

function StatusBadge({
  status,
  changeCount,
}: {
  status: string;
  changeCount: number;
}) {
  if (status === "error") {
    return (
      <span className="text-xs font-bold uppercase text-[#dc2626]">
        Error
      </span>
    );
  }
  if (status === "paused") {
    return (
      <span className="text-xs font-bold uppercase text-[#888]">
        Paused
      </span>
    );
  }
  if (changeCount > 0) {
    return (
      <span className="text-xs font-bold uppercase text-[#2d5a2d]">
        Changed
      </span>
    );
  }
  return (
    <span className="text-xs font-bold uppercase text-[#888]">
      No change
    </span>
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
