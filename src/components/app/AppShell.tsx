"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { buildViewUrl, type AppSub } from "@/lib/view-router";
import * as authApi from "@/lib/api/auth";
import { toast } from "sonner";
import { LogOut, LayoutDashboard, BarChart3, Settings, MessageSquare, Shield } from "lucide-react";

const NAV_ITEMS: { sub: AppSub; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { sub: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { sub: "sessions", label: "Sessions", icon: BarChart3 },
  { sub: "monitoring", label: "Monitoring", icon: Shield, adminOnly: true },
  { sub: "settings", label: "Settings", icon: Settings },
];

export function AppShell({
  sub,
  children,
}: {
  sub: AppSub;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!user) router.replace(buildViewUrl("auth", "login"));
  }, [user, router]);

  useEffect(() => {
    if (sub === "monitoring" && user && !user.roles.includes("admin")) {
      router.replace(buildViewUrl("app", "dashboard"));
    }
  }, [sub, user, router]);

  async function onLogout() {
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    }
    clear();
    toast("Signed out");
    router.replace(buildViewUrl("auth", "login"));
  }

  if (!user) return null;

  const isAdmin = user.roles.includes("admin");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">MasterFabric</span>
          <span className="text-xs text-muted-foreground">Web-LLM</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(buildViewUrl("llm", "model-loader"))}
            className="gap-1.5"
          >
            <MessageSquare className="size-3.5" />
            New chat
          </Button>
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {user.roles.join(", ")}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={onLogout} title="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Side Nav */}
        <nav className="flex w-48 flex-col border-r border-border py-3">
          {NAV_ITEMS.filter((i) => !i.adminOnly || isAdmin).map((item) => {
            const Icon = item.icon;
            const active = sub === item.sub;
            return (
              <button
                key={item.sub}
                onClick={() => router.push(buildViewUrl("app", item.sub))}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
