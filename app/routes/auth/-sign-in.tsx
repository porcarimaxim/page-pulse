import { SignIn } from "@clerk/tanstack-react-start";
import { useRouterState } from "@tanstack/react-router";

export default function SignInPage() {
  const search = useRouterState({
    select: (state) => state.location.searchStr,
  });
  const redirectUrl = new URLSearchParams(search).get("redirect_url");

  return (
    <SignIn
      routing="path"
      path="/auth/sign-in"
      fallbackRedirectUrl={redirectUrl || "/dashboard"}
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-lg shadow-sm hover:shadow-md font-semibold text-sm transition-all",
          card: "bg-white border border-gray-200 rounded-xl shadow-lg",
          headerTitle: "text-gray-900 font-bold text-2xl",
          headerSubtitle: "text-gray-500",
          socialButtonsBlockButton:
            "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 rounded-lg transition-all",
          socialButtonsBlockButtonText: "!text-current font-medium",
          formFieldLabel: "text-gray-700 font-medium",
          formFieldInput:
            "bg-white border border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg",
          footerActionLink: "text-emerald-600 hover:text-emerald-700 font-medium",
          footerActionText: "text-gray-500",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-400 font-medium",
          footer: "hidden",
        },
        variables: {
          colorPrimary: "#059669",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#111827",
          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorTextOnPrimaryBackground: "#ffffff",
          colorNeutral: "#111827",
          borderRadius: "0.5rem",
        },
      }}
    />
  );
}
