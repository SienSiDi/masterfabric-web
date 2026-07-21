"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { ensureEngine } from "@/lib/webllm/engine";
import { getConfig } from "@/lib/api/llm";
import { createSession } from "@/lib/api/llm";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export function ModelLoader() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const setEngineReady = useChatStore((s) => s.setEngineReady);
  const setModelId = useChatStore((s) => s.setModelId);
  const setModelHash = useChatStore((s) => s.setModelHash);
  const setSessionId = useChatStore((s) => s.setSessionId);
  const setLoadProgress = useChatStore((s) => s.setLoadProgress);
  const setLoadStatus = useChatStore((s) => s.setLoadStatus);
  const loadProgress = useChatStore((s) => s.loadProgress);
  const loadStatus = useChatStore((s) => s.loadStatus);

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["config"],
    queryFn: getConfig,
    staleTime: 300_000,
  });

  const modelId = config?.webllm.modelId ?? "gemma-2b-q4f32_1-MLC";
  const estimatedMB = config
    ? Math.round(config.webllm.estimatedBytes / 1_000_000)
    : 1640;

  async function onLoad() {
    setLoading(true);
    try {
      setLoadProgress(0);
      setLoadStatus("Initializing...");

      const engine = await ensureEngine(modelId, (progress: { progress: number; text: string }) => {
        const pct = Math.round(progress.progress * 100);
        setLoadProgress(pct);
        setLoadStatus(progress.text);
      });

      setModelId(modelId);
      setModelHash(`sha256:${modelId}`);

      // Create a BE session
      try {
        const sess = await createSession(modelId, `sha256:${modelId}`);
        setSessionId(sess.sessionId);
      } catch {
        // BE session is optional — chat works without it
        console.warn("Failed to create BE session; events won't be reported.");
      }

      setEngineReady(true);
      toast.success("Model loaded. Start chatting!");
    } catch (err) {
      console.error("Failed to load model:", err);
      toast.error("Failed to load model. Check your browser supports WebGPU.");
    } finally {
      setLoading(false);
    }
  }

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted-foreground">Loading config...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Load Gemma</CardTitle>
          <CardDescription>
            Run <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{modelId}</code> entirely
            in your browser via WebLLM + WebGPU. No data leaves your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model size</span>
              <span className="font-medium">~{estimatedMB} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Runtime</span>
              <span className="font-medium">WebGPU (client-side)</span>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col gap-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {loadProgress}% — {loadStatus}
              </div>
            </div>
          )}

          <Button
            size="lg"
            onClick={onLoad}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Loading model..." : `Load ${modelId}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
