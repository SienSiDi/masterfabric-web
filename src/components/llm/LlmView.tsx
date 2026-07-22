"use client";

import { useChatStore } from "@/stores/useChatStore";
import { ModelLoader } from "./ModelLoader";
import { ChatWindow } from "./ChatWindow";
import { PromptComposer } from "./PromptComposer";
import { MetricsPanel } from "./MetricsPanel";
import { SessionHistory } from "./SessionHistory";
import { Button } from "@/components/ui/button";
import { buildViewUrl } from "@/lib/view-router";
import { useRouter } from "next/navigation";
import { RotateCcw, PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";

export function LlmView({ sub }: { sub: "model-loader" | "chat" | "event-submit" }) {
  const router = useRouter();
  const engineReady = useChatStore((s) => s.engineReady);
  const clear = useChatStore((s) => s.clear);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
          </Button>
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

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="w-72 border-r border-border overflow-y-auto flex-shrink-0">
            <MetricsPanel />
            <div className="border-t border-border">
              <SessionHistory />
            </div>
          </aside>
        )}

        <main className="flex flex-1 flex-col overflow-hidden p-6">
          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            <ChatWindow />
          </div>
          <PromptComposer />
        </main>
      </div>
    </div>
  );
}
