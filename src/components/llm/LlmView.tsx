"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LlmSub } from "@/lib/view-router";

const SUB_LABELS: Record<LlmSub, string> = {
  "model-loader": "Model Loader",
  chat: "Chat",
  "event-submit": "Event Submit",
};

export function LlmView({ sub }: { sub: LlmSub }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle>{SUB_LABELS[sub]} — coming on Day 12</CardTitle>
          <CardDescription>
            Master View 3 will load Gemma in your browser via WebLLM and report inference events
            to the backend for raw LLM monitoring + decision scoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This view will use <code className="rounded bg-muted px-1.5 py-0.5 text-xs">@mlc-ai/web-llm</code>{" "}
            to run <code className="rounded bg-muted px-1.5 py-0.5 text-xs">gemma-2b-q4f32_1-MLC</code>{" "}
            entirely client-side, then POST each inference event to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              POST /api/v1/llm/sessions/&#123;id&#125;/events
            </code>{" "}
            and score it via{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              POST /api/v1/llm/sessions/&#123;id&#125;/score
            </code>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
