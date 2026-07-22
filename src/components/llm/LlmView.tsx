"use client";

import { useChatStore } from "@/stores/useChatStore";
import { useMediaStore } from "@/stores/useMediaStore";
import { ModelLoader } from "./ModelLoader";
import { ChatWindow } from "./ChatWindow";
import { PromptComposer } from "./PromptComposer";
import { CinemaStats, TopGenres, RecentActivity } from "./CinemaTheme";
import { FilmShelf } from "./FilmShelf";
import { BookShelf } from "./BookShelf";
import { DiscussionList } from "./DiscussionCard";
import { Button } from "@/components/ui/button";
import { buildViewUrl } from "@/lib/view-router";
import { useRouter } from "next/navigation";
import { RotateCcw, PanelLeftClose, PanelLeft, Film, BookOpen, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

type Tab = "chat" | "films" | "books" | "discussions";

export function LlmView({ sub }: { sub: "model-loader" | "chat" | "event-submit" }) {
  const router = useRouter();
  const engineReady = useChatStore((s) => s.engineReady);
  const clear = useChatStore((s) => s.clear);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const hydrateMedia = useMediaStore((s) => s.hydrate);

  useEffect(() => {
    hydrateMedia();
  }, [hydrateMedia]);

  function onNewChat() {
    clear();
    router.push(buildViewUrl("llm", "model-loader"));
  }

  if (!engineReady) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-amber-950/10">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">Sinematek</span>
            <span className="text-xs text-muted-foreground">Film & Kitap Sohbetleri</span>
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-amber-950/10">
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
          <span className="text-base font-semibold tracking-tight">Sinematek</span>
          <span className="text-xs text-muted-foreground">Film & Kitap Sohbetleri</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onNewChat} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            Yeni Sohbet
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push(buildViewUrl("app", "dashboard"))}>
            ← Back to app
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="w-80 border-r border-border overflow-y-auto flex-shrink-0">
            <div className="p-4 space-y-4">
              <CinemaStats />
              <TopGenres />
              <RecentActivity />
            </div>
          </aside>
        )}

        <main className="flex flex-1 overflow-hidden">
          <div className="flex flex-col w-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-border px-4">
              <TabButton
                active={activeTab === "chat"}
                onClick={() => setActiveTab("chat")}
                icon={<MessageSquare className="size-4" />}
                label="Sohbet"
              />
              <TabButton
                active={activeTab === "films"}
                onClick={() => setActiveTab("films")}
                icon={<Film className="size-4" />}
                label="Filmler"
              />
              <TabButton
                active={activeTab === "books"}
                onClick={() => setActiveTab("books")}
                icon={<BookOpen className="size-4" />}
                label="Kitaplar"
              />
              <TabButton
                active={activeTab === "discussions"}
                onClick={() => setActiveTab("discussions")}
                icon={<MessageSquare className="size-4" />}
                label="Tartışmalar"
              />
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "chat" && (
                <div className="flex flex-col h-full p-6">
                  <div className="flex-1 overflow-y-auto">
                    <ChatWindow />
                  </div>
                  <PromptComposer />
                </div>
              )}

              {activeTab === "films" && (
                <div className="p-6">
                  <FilmShelf />
                </div>
              )}

              {activeTab === "books" && (
                <div className="p-6">
                  <BookShelf />
                </div>
              )}

              {activeTab === "discussions" && (
                <div className="p-6">
                  <DiscussionList />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-amber-500 text-amber-500"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
