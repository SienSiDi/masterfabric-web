"use client";

import { useChatStore } from "@/stores/useChatStore";
import { ModelLoader } from "./ModelLoader";
import { ChatWindow } from "./ChatWindow";
import { PromptComposer } from "./PromptComposer";
import { Button } from "@/components/ui/button";
import { buildViewUrl } from "@/lib/view-router";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

export function LlmView({ sub }: { sub: "model-loader" | "chat" | "event-submit" }) {
  const router = useRouter();
  const engineReady = useChatStore((s) => s.engineReady);
  const clear = useChatStore((s) => s.clear);

  function onNewChat() {
    clear();
    router.push(buildViewUrl("llm", "model-loader"));
  }

  if (!engineReady) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">MasterFabric</span>
            <span className="text-xs text-muted-foreground">Web-LLM</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push(buildViewUrl("app", "dashboard"))}>
            ← Back to app
          </Button>
        </header>
        <ModelLoader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">MasterFabric</span>
          <span className="text-xs text-muted-foreground">Web-LLM</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onNewChat} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            New chat
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push(buildViewUrl("app", "dashboard"))}>
            ← Back to app
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden p-6">
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <ChatWindow />
        </div>
        <PromptComposer />
      </main>
    </div>
  );
}
