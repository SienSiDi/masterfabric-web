"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { buildViewUrl, type AppSub } from "@/lib/view-router";
import * as authApi from "@/lib/api/auth";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const SUB_LABELS: Record<AppSub, string> = {
  dashboard: "Dashboard",
  sessions: "Sessions",
  monitoring: "Monitoring",
  settings: "Settings",
};

export function AppShell({ sub }: { sub: AppSub }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!user) {
      router.replace(buildViewUrl("auth", "login"));
    }
  }, [user, router]);

  async function onLogout() {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore — clearing local state regardless
      }
    }
    clear();
    toast("Signed out");
    router.replace(buildViewUrl("auth", "login"));
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">MasterFabric</span>
          <span className="text-xs text-muted-foreground">Web-LLM</span>
        </div>
        <nav className="flex items-center gap-1">
          {(Object.keys(SUB_LABELS) as AppSub[]).map((s) => (
            <Button
              key={s}
              variant={sub === s ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push(buildViewUrl("app", s))}
            >
              {SUB_LABELS[s]}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(buildViewUrl("llm", "model-loader"))}
          >
            Web LLM
          </Button>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <Button variant="ghost" size="icon-sm" onClick={onLogout} title="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>{SUB_LABELS[sub]} — coming on Day 11</CardTitle>
            <CardDescription>
              This subview is a placeholder. Full implementation ships on Day 11.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You are signed in as <span className="font-medium text-foreground">{user.email}</span>{" "}
              with roles <span className="font-medium text-foreground">{user.roles.join(", ")}</span>.
              The backend is live at{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                https://mf-masterfabric-backend.onrender.com
              </code>{" "}
              and ready to serve data here.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
