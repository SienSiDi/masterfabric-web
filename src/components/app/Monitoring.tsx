"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { buildViewUrl } from "@/lib/view-router";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function Monitoring() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles.includes("admin");
  const { data, isLoading } = useMonitoring();

  useEffect(() => {
    if (!isAdmin) router.replace(buildViewUrl("app", "dashboard"));
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading monitoring data...</div>;
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">No monitoring data available.</div>;
  }

  const latencyData = data.byModel.map((m) => ({
    name: m.modelId.replace("-MLC", "").replace("gemma-", ""),
    p50: m.p50Ms,
    composite: m.avgComposite,
  }));

  const scoreData = [
    { name: "Correctness", value: data.scores.avgCorrectness },
    { name: "Composite", value: data.scores.avgComposite },
    { name: "Accept Rate", value: data.scores.userAcceptRate },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Monitoring</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Latency by Model</CardTitle>
          </CardHeader>
          <CardContent>
            {latencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="p50" fill="#3b82f6" radius={[4, 4, 0, 0]} name="p50 (ms)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Decision Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {scoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {scoreData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Model Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {data.byModel.length > 0 ? (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={data.byModel.map((m) => ({ name: m.modelId, value: m.events }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${value}`}
                  >
                    {data.byModel.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {data.byModel.map((m, i) => (
                  <div key={m.modelId} className="flex items-center gap-2 text-sm">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{m.modelId}</span>
                    <span className="font-medium">{m.events} events</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
