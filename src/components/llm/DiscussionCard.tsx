"use client";

import { useMediaStore } from "@/stores/useMediaStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, Plus, X, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { useState } from "react";
import type { Discussion } from "@/lib/bot/types";

export function DiscussionList() {
  const discussions = useMediaStore((s) => s.discussions);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="size-4 text-green-500" />
          Tartışmalar ({discussions.length})
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdd(!showAdd)}
          className="gap-1"
        >
          <Plus className="size-3" />
          Yeni Tartışma
        </Button>
      </div>

      {showAdd && <AddDiscussionForm onClose={() => setShowAdd(false)} />}

      {discussions.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            Henüz tartışma yok. Sinematek ile konuşmalarından önemli noktaları kaydedebilirsin.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {discussions.map((d) => (
            <DiscussionCard key={d.id} discussion={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function DiscussionCard({ discussion }: { discussion: Discussion }) {
  const removeDiscussion = useMediaStore((s) => s.removeDiscussion);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium">{discussion.title}</CardTitle>
          <div className="flex items-center gap-1">
            <SentimentBadge sentiment={discussion.sentiment} />
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => removeDiscussion(discussion.id)}
              className="text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{discussion.content}</p>

        {discussion.keyQuotes.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium">Öne Çıkan Sözler:</div>
            {discussion.keyQuotes.map((q, i) => (
              <div
                key={i}
                className="text-xs italic text-muted-foreground pl-3 border-l-2 border-amber-500/50"
              >
                &ldquo;{q}&rdquo;
              </div>
            ))}
          </div>
        )}

        {discussion.relatedTopics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {discussion.relatedTopics.map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {new Date(discussion.createdAt).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SentimentBadge({ sentiment }: { sentiment: Discussion["sentiment"] }) {
  const config = {
    positive: { icon: ThumbsUp, color: "text-green-500", bg: "bg-green-500/10" },
    neutral: { icon: Minus, color: "text-muted-foreground", bg: "bg-muted" },
    negative: { icon: ThumbsDown, color: "text-red-500", bg: "bg-red-500/10" },
  };

  const { icon: Icon, color, bg } = config[sentiment];

  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${bg}`}>
      <Icon className={`size-3 ${color}`} />
    </div>
  );
}

function AddDiscussionForm({ onClose }: { onClose: () => void }) {
  const addDiscussion = useMediaStore((s) => s.addDiscussion);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<Discussion["sentiment"]>("positive");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const discussion: Discussion = {
      id: `disc_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      sentiment,
      keyQuotes: [],
      relatedTopics: [],
      createdAt: Date.now(),
    };

    addDiscussion(discussion);
    onClose();
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Yeni Tartışma</span>
            <Button size="icon-xs" variant="ghost" type="button" onClick={onClose}>
              <X className="size-3" />
            </Button>
          </div>

          <input
            type="text"
            placeholder="Tartışma başlığı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
          />

          <textarea
            placeholder="Ne hakkında konuştuğunuzu yazın..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
          />

          <div className="flex gap-2">
            {(["positive", "neutral", "negative"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSentiment(s)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  sentiment === s
                    ? s === "positive"
                      ? "bg-green-500 text-white"
                      : s === "neutral"
                        ? "bg-muted text-foreground"
                        : "bg-red-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s === "positive" ? "👍 Olumlu" : s === "neutral" ? "➖ Nötr" : "👎 Olumsuz"}
              </button>
            ))}
          </div>

          <Button type="submit" size="sm" className="w-full">
            Kaydet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
