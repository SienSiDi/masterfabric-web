"use client";

import { useChatStore, type ChatMessage } from "@/stores/useChatStore";
import { EventSubmit } from "./EventSubmit";

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
        <div className="text-xs text-muted-foreground">Scored</div>
      )}

      {!isUser && msg.latencyMs !== undefined && (
        <div className="text-xs text-muted-foreground">
          {msg.latencyMs}ms &middot; {msg.tokensIn} in / {msg.tokensOut} out
        </div>
      )}
    </div>
  );
}
