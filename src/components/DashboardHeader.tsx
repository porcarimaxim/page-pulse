import { Link } from "@tanstack/react-router";
import { UserButton } from "@clerk/tanstack-react-start";

export function DashboardHeader() {
  return (
    <header className="border-b-2 border-[#1a1a1a] px-6 py-4 flex items-center justify-between bg-[#f0f0e8]">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-xl font-black tracking-tighter">
          PAGE<span className="text-[#2d5a2d]">PULSE</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-sm font-bold uppercase tracking-wider text-[#888] hover:text-[#1a1a1a] transition-colors [&.active]:text-[#1a1a1a]"
          >
            Monitors
          </Link>
        </nav>
      </div>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "border-2 border-[#1a1a1a]",
          },
        }}
      />
    </header>
  );
}
