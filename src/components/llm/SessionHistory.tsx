"use client";

import { useChatStore } from "@/stores/useChatStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, MessageSquare, Clock, Zap } from "lucide-react";

export function SessionHistory() {
  const history = useChatStore((s) => s.history);

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <History className="size-4" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground text-center py-4">
            No sessions yet. Start chatting to build history.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <History className="size-4" />
          Session History ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {history.slice().reverse().map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SessionCard({ session }: { session: import("@/stores/useChatStore").SessionRecord }) {
  const duration = session.endedAt
    ? session.endedAt - session.startedAt
    : Date.now() - session.startedAt;

  return (
    <div className="rounded-lg border border-border p-3 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium truncate" title={session.modelId}>
          {session.modelId.replace("-q4f32_1-MLC", "")}
        </div>
        <div className="text-muted-foreground">
          {new Date(session.startedAt).toLocaleDateString()}{" "}
          {new Date(session.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageSquare className="size-3" />
          <span>{session.messageCount} msgs</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          <span>{formatDuration(duration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="size-3" />
          <span>{session.metrics.totalTokens.toLocaleString()} tok</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-muted-foreground">
        <span>Avg latency: {session.metrics.avgLatencyMs}ms</span>
        <span>{session.metrics.tokensPerSecond} tok/s</span>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
