"use client";

import { useChatStore, type ChatMessage } from "@/stores/useChatStore";
import { EventSubmit } from "./EventSubmit";
import { Copy, Check, Clock, Zap, Hash } from "lucide-react";
import { useState } from "react";

export function ChatWindow() {
  const messages = useChatStore((s) => s.messages);
  const streaming = useChatStore((s) => s.streaming);

  return (
    <div
      className="flex flex-col gap-3 overflow-auto"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-lg font-semibold">Start a conversation</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Ask Gemma anything. Each inference is reported to the backend for monitoring + scoring.
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Tip: Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {streaming && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-xl bg-muted px-4 py-3 text-sm">
            <span className="animate-pulse">Thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        <div className="whitespace-pre-wrap">{msg.content}</div>
      </div>

      {!isUser && (
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            title="Copy response"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </button>

          {msg.latencyMs !== undefined && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {msg.latencyMs}ms
            </span>
          )}

          {msg.tokensOut !== undefined && msg.tokensOut > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="size-3" />
              {msg.tokensOut} tokens
            </span>
          )}

          {msg.modelId && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Hash className="size-3" />
              {msg.modelId.replace("-q4f32_1-MLC", "")}
            </span>
          )}
        </div>
      )}

      {!isUser && msg.eventId && !msg.scored && (
        <EventSubmit
          eventId={msg.eventId}
          completion={msg.content}
          latencyMs={msg.latencyMs ?? 0}
          tokensIn={msg.tokensIn ?? 0}
          tokensOut={msg.tokensOut ?? 0}
        />
      )}

      {!isUser && msg.scored && (
        <div className="text-xs text-green-600 flex items-center gap-1">
          <Check className="size-3" />
          Scored
        </div>
      )}
    </div>
  );
}
