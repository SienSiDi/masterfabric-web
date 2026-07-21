"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useAuthStore } from "@/stores/useAuthStore";
import { Activity, BarChart3, Zap, ShieldAlert } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accent ?? "bg-muted"}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-2xl font-semibold leading-none">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles.includes("admin");
  const { data, isLoading } = useMonitoring();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Welcome to MasterFabric</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You are signed in as {user?.email}.<br />
            Start a chat to see your LLM sessions here.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">No monitoring data available.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sessions"
          value={data.totals.sessions}
          icon={Activity}
          accent="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          label="Events"
          value={data.totals.events}
          icon={BarChart3}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          label="Avg Composite"
          value={data.scores.avgComposite.toFixed(2)}
          icon={Zap}
          accent="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          label="Safety Flags"
          value={`${(data.scores.safetyFlagRate * 100).toFixed(0)}%`}
          icon={ShieldAlert}
          accent="bg-red-500/10 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-semibold">{data.latency.p50Ms}ms</div>
                <div className="text-xs text-muted-foreground">p50</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{data.latency.p95Ms}ms</div>
                <div className="text-xs text-muted-foreground">p95</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{data.latency.maxMs}ms</div>
                <div className="text-xs text-muted-foreground">max</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-semibold">{data.tokens.inTotal.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Input tokens</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{data.tokens.outTotal.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Output tokens</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.byModel.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {data.byModel.map((m) => (
                <div
                  key={m.modelId}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium">{m.modelId}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.events} events &middot; p50 {m.p50Ms}ms
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{m.avgComposite.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">composite</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
