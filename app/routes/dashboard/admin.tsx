import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/tanstack-react-start";
import { api } from "@convex/_generated/api";
import { formatRelativeTime, intervalLabel } from "@/lib/utils";
import { useState } from "react";
import {
  Shield,
  Users,
  Eye,
  AlertTriangle,
  Zap,
  Loader2,
  Check,
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminPage,
});

const ADMIN_USER_IDS = (
  import.meta.env.VITE_ADMIN_USER_IDS ?? ""
)
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

type Tab = "users" | "monitors";

function AdminPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("users");

  // Gate: only admin users can see this page
  const isAdmin = user?.id && ADMIN_USER_IDS.includes(user.id);

  if (!isAdmin) {
    return (
      <main className="px-8 py-8 max-w-[1100px]">
        <div className="border-2 border-[#dc2626] p-12 text-center">
          <Shield className="w-10 h-10 text-[#dc2626] mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-[#888]">
            This page is restricted to administrators.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-8 py-8 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 border-2 border-[#1a1a1a] bg-[#1a1a1a] flex items-center justify-center">
          <Shield className="w-4 h-4 text-[#f0f0e8]" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Admin
          </h1>
          <p className="text-sm text-[#888] mt-0.5">
            System-wide overview and controls
          </p>
        </div>
      </div>

      <StatsBar />

      {/* Tab bar */}
      <div className="flex border-2 border-[#1a1a1a] mb-6">
        {(
          [
            { key: "users", label: "Users", icon: Users },
            { key: "monitors", label: "Monitors", icon: Eye },
          ] as const
        ).map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
              i > 0 ? "border-l-2 border-[#1a1a1a]" : ""
            } ${
              tab === t.key
                ? "bg-[#1a1a1a] text-[#f0f0e8]"
                : "text-[#888] hover:bg-[#e8e8e0]"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" ? <UsersTable /> : <MonitorsTable />}
    </main>
  );
}

/* ─── Stats Bar ─── */

function StatsBar() {
  const stats = useQuery(api.admin.stats);

  if (!stats) {
    return (
      <div className="border-2 border-[#1a1a1a] p-4 mb-6 text-center text-[#888] text-sm">
        Loading stats...
      </div>
    );
  }

  const items = [
    { label: "Users", value: stats.totalUsers },
    { label: "Monitors", value: stats.totalMonitors },
    { label: "Active", value: stats.activeMonitors, color: "text-[#2d5a2d]" },
    { label: "Paused", value: stats.pausedMonitors, color: "text-[#888]" },
    { label: "Errors", value: stats.errorMonitors, color: "text-[#dc2626]" },
    { label: "Changes", value: stats.totalChanges },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-0 border-2 border-[#1a1a1a] mb-6">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`p-4 text-center ${
            i > 0 ? "border-l border-[#ccc]" : ""
          }`}
        >
          <p
            className={`text-2xl font-black tracking-tighter ${
              item.color ?? ""
            }`}
          >
            {item.value}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#888] mt-0.5">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Users Table ─── */

function UsersTable() {
  const users = useQuery(api.admin.listAllUsers);
  const updatePlan = useMutation(api.admin.updateUserPlan);
  const toggleBlock = useMutation(api.admin.toggleUserBlock);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [savedUser, setSavedUser] = useState<string | null>(null);
  const [blockingUser, setBlockingUser] = useState<string | null>(null);
  const [pendingOverrides, setPendingOverrides] = useState<
    Record<string, string>
  >({});

  if (!users) {
    return (
      <div className="text-center py-12 text-[#888]">Loading users...</div>
    );
  }

  const handlePlanChange = (userId: string, value: string) => {
    setPendingOverrides((prev) => ({ ...prev, [userId]: value }));
  };

  const handleSave = async (userId: string) => {
    const override = pendingOverrides[userId];
    if (override === undefined) return;

    setSavingUser(userId);
    try {
      await updatePlan({
        userId,
        planOverride: override as "free" | "pro" | "business" | "special" | "none",
      });
      setSavedUser(userId);
      setPendingOverrides((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setTimeout(() => setSavedUser(null), 2000);
    } finally {
      setSavingUser(null);
    }
  };

  const handleToggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    const action = currentlyBlocked ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} this user? ${!currentlyBlocked ? "All their active monitors will be paused." : ""}`)) return;

    setBlockingUser(userId);
    try {
      await toggleBlock({ userId, blocked: !currentlyBlocked });
    } finally {
      setBlockingUser(null);
    }
  };

  return (
    <div className="border-2 border-[#1a1a1a]">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-4 py-3 bg-[#1a1a1a] text-[#f0f0e8] items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider">
          User
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Monitors
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Plan Override
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider w-20 text-center">
          Plan
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider w-20 text-center">
          Block
        </span>
      </div>

      {users.length === 0 ? (
        <div className="p-8 text-center text-[#888] text-sm">No users yet</div>
      ) : (
        users.map((u, i) => {
          const currentOverride =
            pendingOverrides[u.userId] ?? u.planOverride ?? "none";
          const hasChange = pendingOverrides[u.userId] !== undefined;

          const isBlocked = u.blocked ?? false;

          return (
            <div
              key={u.userId}
              className={`grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-4 py-3 items-center ${
                i < users.length - 1 ? "border-b border-[#ccc]" : ""
              } ${isBlocked ? "bg-[#fef2f2]" : "hover:bg-[#e8e8e0]"} transition-colors`}
            >
              {/* User info */}
              <div className="min-w-0 flex items-center gap-2">
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isBlocked ? "line-through text-[#888]" : ""}`}>
                    {u.email || u.userId}
                  </p>
                  {u.email && (
                    <p className="text-[10px] text-[#888] font-mono truncate">
                      {u.userId}
                    </p>
                  )}
                </div>
                {isBlocked && (
                  <span className="shrink-0 px-1.5 py-0.5 bg-[#dc2626] text-white text-[8px] font-bold uppercase tracking-wider">
                    Blocked
                  </span>
                )}
              </div>

              {/* Monitor count */}
              <span className="text-sm font-black">{u.monitorCount}</span>

              {/* Plan override select */}
              <select
                value={currentOverride}
                onChange={(e) => handlePlanChange(u.userId, e.target.value)}
                className="border-2 border-[#1a1a1a] bg-white px-2 py-1.5 text-xs font-bold uppercase"
              >
                <option value="none">— Default —</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
                <option value="special">Special</option>
              </select>

              {/* Save button */}
              <div className="w-20 flex justify-center">
                {hasChange ? (
                  <button
                    onClick={() => handleSave(u.userId)}
                    disabled={savingUser === u.userId}
                    className="px-3 py-1.5 bg-[#2d5a2d] text-[#f0f0e8] text-[10px] font-bold uppercase tracking-wider hover:bg-[#3a6a3a] disabled:opacity-50 transition-colors"
                  >
                    {savingUser === u.userId ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                ) : savedUser === u.userId ? (
                  <span className="text-[#2d5a2d]">
                    <Check className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="text-[10px] text-[#ccc]">—</span>
                )}
              </div>

              {/* Block toggle */}
              <div className="w-20 flex justify-center">
                <button
                  onClick={() => handleToggleBlock(u.userId, isBlocked)}
                  disabled={blockingUser === u.userId}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 transition-colors disabled:opacity-50 ${
                    isBlocked
                      ? "bg-[#e8e8e0] text-[#1a1a1a] border-[#1a1a1a] hover:bg-[#d8d8d0]"
                      : "bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]"
                  }`}
                >
                  {blockingUser === u.userId ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isBlocked ? (
                    "Unblock"
                  ) : (
                    "Block"
                  )}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ─── Monitors Table ─── */

function MonitorsTable() {
  const monitors = useQuery(api.admin.listAllMonitors);
  const toggleMonitor = useMutation(api.admin.toggleMonitor);

  if (!monitors) {
    return (
      <div className="text-center py-12 text-[#888]">Loading monitors...</div>
    );
  }

  return (
    <div className="border-2 border-[#1a1a1a]">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-[#1a1a1a] text-[#f0f0e8] items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Monitor
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          User
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Interval
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Last Check
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Changes
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider w-16 text-center">
          Status
        </span>
      </div>

      {monitors.length === 0 ? (
        <div className="p-8 text-center text-[#888] text-sm">
          No monitors yet
        </div>
      ) : (
        monitors.map((m, i) => (
          <div
            key={m._id}
            className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 items-center ${
              i < monitors.length - 1 ? "border-b border-[#ccc]" : ""
            } hover:bg-[#e8e8e0] transition-colors`}
          >
            {/* Monitor name + url */}
            <div className="min-w-0">
              <Link
                to="/dashboard/$monitorId"
                params={{ monitorId: m._id } as any}
                className="text-xs font-black uppercase tracking-tighter truncate block hover:text-[#2d5a2d] transition-colors"
              >
                {m.name}
              </Link>
              <p className="text-[10px] text-[#888] font-mono truncate">
                {m.url}
              </p>
            </div>

            {/* User */}
            <p className="text-[10px] text-[#888] truncate">{m.email || m.userId}</p>

            {/* Interval */}
            <span className="text-xs text-[#888]">
              {intervalLabel(m.interval)}
            </span>

            {/* Last check */}
            <span className="text-xs text-[#888]">
              {m.lastCheckedAt ? formatRelativeTime(m.lastCheckedAt) : "Never"}
            </span>

            {/* Changes */}
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-black ${
                  m.changeCount > 0 ? "text-[#1a1a1a]" : "text-[#ccc]"
                }`}
              >
                {m.changeCount}
              </span>
              {m.status === "error" && (
                <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />
              )}
            </div>

            {/* Status toggle */}
            <button
              onClick={() =>
                toggleMonitor({ monitorId: m._id as Id<"monitors"> })
              }
              className={`w-16 px-2 py-1 text-[8px] font-bold uppercase tracking-wider border-2 text-center transition-colors ${
                m.status === "active"
                  ? "bg-[#2d5a2d] text-[#f0f0e8] border-[#2d5a2d] hover:bg-[#3a6a3a]"
                  : m.status === "error"
                    ? "bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]"
                    : "bg-[#e8e8e0] text-[#888] border-[#ccc] hover:bg-[#d8d8d0]"
              }`}
            >
              {m.status}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
