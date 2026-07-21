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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildViewUrl } from "@/lib/view-router";

function checkWebGPUSupport(): { ok: boolean; reason?: string } {
  if (typeof navigator === "undefined") return { ok: false, reason: "Server-side rendering" };
  const nav = navigator as Navigator & { gpu?: unknown };
  if (!nav.gpu) return { ok: false, reason: "WebGPU API not available in this browser." };
  return { ok: true };
}

export function ModelLoader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [webgpu, setWebgpu] = useState<{ ok: boolean; reason?: string }>({ ok: true });
  const setEngineReady = useChatStore((s) => s.setEngineReady);
  const setModelId = useChatStore((s) => s.setModelId);
  const setModelHash = useChatStore((s) => s.setModelHash);
  const setSessionId = useChatStore((s) => s.setSessionId);
  const setLoadProgress = useChatStore((s) => s.setLoadProgress);
  const setLoadStatus = useChatStore((s) => s.setLoadStatus);
  const loadProgress = useChatStore((s) => s.loadProgress);
  const loadStatus = useChatStore((s) => s.loadStatus);

  useEffect(() => {
    setWebgpu(checkWebGPUSupport());
  }, []);

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["config"],
    queryFn: getConfig,
    staleTime: 300_000,
  });

  const MODEL_ID = "gemma-2-2b-it-q4f32_1-MLC";
  const modelId = MODEL_ID;
  const estimatedMB = config
    ? Math.round(config.webllm.estimatedBytes / 1_000_000)
    : 2508;

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
      router.push(buildViewUrl("llm", "chat"));
    } catch (err: unknown) {
      console.error("Failed to load model:", err);
      const msg = err instanceof Error ? err.message : String(err);

      if (/WebGPU/i.test(msg)) {
        toast.error(`WebGPU error: ${msg}. Use Chrome 113+ or Edge 113+.`);
      } else if (/ShaderF16/i.test(msg)) {
        toast.error("GPU doesn't support float16 shaders. Try a different browser or device.");
      } else if (/DeviceLost/i.test(msg)) {
        toast.error("GPU device lost (likely out of memory). Close other GPU-heavy tabs and retry.");
      } else if (/OOM|out of memory/i.test(msg)) {
        toast.error("Out of GPU memory. Close other tabs using GPU and retry.");
      } else {
        toast.error(`Model load failed: ${msg}`);
      }
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
      {!webgpu.ok && (
        <Card className="max-w-md w-full border-destructive/50 bg-destructive/5 mb-6">
          <CardHeader>
            <CardTitle className="text-destructive">WebGPU Not Supported</CardTitle>
            <CardDescription>
              {webgpu.reason ?? "Your browser does not support WebGPU."} WebLLM requires WebGPU to
              run LLMs locally in the browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Supported browsers:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Chrome 113+</strong> (Desktop &amp; Android)</li>
              <li><strong>Edge 113+</strong></li>
              <li><strong>Firefox 141+</strong> (experimental flag)</li>
              <li><strong>Safari 18+</strong> (macOS Sequoia only, partial)</li>
            </ul>
            <p className="mt-3">
              Open this page in Chrome or Edge to use WebLLM.
            </p>
          </CardContent>
        </Card>
      )}

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
            disabled={loading || !webgpu.ok}
            className="w-full"
          >
            {loading ? "Loading model..." : `Load ${modelId}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
