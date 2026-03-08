import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-react-start";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  if (isLoaded && !isSignedIn) {
    navigate({ to: "/auth/sign-in", search: { redirect_url: "/dashboard" } as any });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f0f0e8]">
      <DashboardSidebar />
      <div className="ml-56">
        <Outlet />
      </div>
    </div>
  );
}
