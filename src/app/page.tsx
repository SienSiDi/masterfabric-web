"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { parseViewState, type View, type AppSub } from "@/lib/view-router";
import { AuthCard } from "@/components/auth/AuthCard";
import { AppShell } from "@/components/app/AppShell";
import { LlmView } from "@/components/llm/LlmView";
import { Dashboard } from "@/components/app/Dashboard";
import { Sessions } from "@/components/app/Sessions";
import { Monitoring } from "@/components/app/Monitoring";
import { Settings } from "@/components/app/Settings";

const APP_SUB_VIEWS: Record<AppSub, React.ComponentType> = {
  dashboard: Dashboard,
  sessions: Sessions,
  monitoring: Monitoring,
  settings: Settings,
};

function ViewSwitcher() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const subParam = searchParams.get("sub");
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { view, sub } = useMemo(() => {
    const defaultView: View = user && accessToken ? "app" : "auth";
    return parseViewState(viewParam, subParam, defaultView);
  }, [viewParam, subParam, user, accessToken]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (view === "auth") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">MasterFabric Web-LLM</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Run Gemma in your browser. Monitor + score every inference.
          </p>
        </div>
        <AuthCard sub={sub as "login" | "register" | "forgot-password"} />
      </div>
    );
  }

  if (view === "app") {
    const appSub = sub as AppSub;
    const SubComponent = APP_SUB_VIEWS[appSub] ?? Dashboard;
    return (
      <AppShell sub={appSub}>
        <SubComponent />
      </AppShell>
    );
  }

  return <LlmView sub={sub as "model-loader" | "chat" | "event-submit"} />;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <ViewSwitcher />
    </Suspense>
  );
}
