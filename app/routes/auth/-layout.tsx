import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-bold text-gray-900">
              Page<span className="text-emerald-600">Pulse</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-gray-500">
            Track any webpage for changes
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default AuthShell;
