import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <main className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Settings
        </h1>
        <p className="text-sm text-[#888] mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <h2 className="text-lg font-black uppercase tracking-tighter mb-4">
          Account
        </h2>
        <p className="text-sm text-[#888]">
          Account settings are managed through your authentication provider.
        </p>
      </div>
    </main>
  );
}
