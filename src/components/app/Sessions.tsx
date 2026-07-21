"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMonitoring } from "@/hooks/useMonitoring";
import { useAuthStore } from "@/stores/useAuthStore";
import { buildViewUrl } from "@/lib/view-router";
import { MessageSquare } from "lucide-react";

export function Sessions() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles.includes("admin");
  const { data, isLoading } = useMonitoring();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading sessions...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="text-center">
          <h2 className="text-lg font-semibold">No sessions yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a chat in Web LLM to create your first session.
          </p>
        </div>
        <Button onClick={() => router.push(buildViewUrl("llm", "model-loader"))} className="gap-1.5">
          <MessageSquare className="size-4" />
          Open Web LLM
        </Button>
      </div>
    );
  }

  if (!data || data.byModel.length === 0) {
    return <div className="text-sm text-muted-foreground">No sessions recorded yet.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Sessions by Model</h2>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Events</TableHead>
                <TableHead className="text-right">p50 Latency</TableHead>
                <TableHead className="text-right">Avg Composite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byModel.map((m) => (
                <TableRow key={m.modelId}>
                  <TableCell className="font-medium">{m.modelId}</TableCell>
                  <TableCell className="text-right">{m.events}</TableCell>
                  <TableCell className="text-right">{m.p50Ms}ms</TableCell>
                  <TableCell className="text-right font-semibold">
                    {m.avgComposite.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
