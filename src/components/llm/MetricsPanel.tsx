"use client";

import { useChatStore } from "@/stores/useChatStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, Clock, Shield, BarChart3, Cpu } from "lucide-react";

export function MetricsPanel() {
  const metrics = useChatStore((s) => s.metrics);
  const modelId = useChatStore((s) => s.modelId);
  const sessionId = useChatStore((s) => s.sessionId);

  return (
    <div className="flex flex-col gap-3 p-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cpu className="size-4" />
            Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground break-all">
            {modelId ?? "Not loaded"}
          </div>
          {sessionId && (
            <div className="text-xs text-muted-foreground mt-1 truncate" title={sessionId}>
              Session: {sessionId.slice(0, 8)}...
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="size-4" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">Total</div>
              <div className="text-lg font-bold">{metrics.totalMessages}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Scored</div>
              <div className="text-lg font-bold">{metrics.scoredCount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">User</div>
              <div className="font-medium">{metrics.userMessages}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Assistant</div>
              <div className="font-medium">{metrics.assistantMessages}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="size-4" />
            Latency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgLatencyMs}ms</div>
          <div className="text-xs text-muted-foreground">average response time</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="size-4" />
            Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{metrics.totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Input</span>
              <span className="font-medium">{metrics.totalTokensIn.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Output</span>
              <span className="font-medium">{metrics.totalTokensOut.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg/Msg</span>
              <span className="font-medium">{metrics.avgTokensPerMessage}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Speed</span>
              <span className="font-medium text-primary">{metrics.tokensPerSecond} tok/s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="size-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Errors</span>
              <span className={`font-medium ${metrics.errorCount > 0 ? "text-red-500" : "text-green-500"}`}>
                {metrics.errorCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Safety Flags</span>
              <span className={`font-medium ${metrics.safetyFlags > 0 ? "text-amber-500" : "text-green-500"}`}>
                {metrics.safetyFlags}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="size-4" />
            Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Started</span>
              <span className="font-medium">
                {metrics.totalMessages > 0
                  ? new Date(useChatStore.getState().messages[0]?.timestamp ?? Date.now()).toLocaleTimeString()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">
                {metrics.totalMessages > 0
                  ? formatDuration(Date.now() - (useChatStore.getState().messages[0]?.timestamp ?? Date.now()))
                  : "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
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
