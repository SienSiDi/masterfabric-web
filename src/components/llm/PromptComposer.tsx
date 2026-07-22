"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore, nextMsgId } from "@/stores/useChatStore";
import { getCachedEngine } from "@/lib/webllm/engine";
import { recordEvent } from "@/lib/api/llm";
import { toast } from "sonner";
import { Send, Settings2, ChevronDown } from "lucide-react";
import { SYSTEM_PROMPT } from "@/lib/bot/persona";

const MAX_CHARS = 4000;

const QUICK_PROMPTS = [
  "Son izlediğim film hakkında konuşalım",
  "Bu kitap hakkında ne düşünüyorsun?",
  "Bana film önerir misin?",
  "Klasik filmler hakkında ne düşünüyorsun?",
  "Yönetmenlerin üslupları hakkında konuşalım",
  "Bu roman hakkında ne diyorsun?",
];

export function PromptComposer() {
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    streaming,
    sessionId,
    addMessage,
    updateLastAssistant,
    setStreaming,
    metrics,
    modelId,
  } = useChatStore();

  const charCount = input.length;
  const overLimit = charCount > MAX_CHARS;
  const canSend = input.trim().length > 0 && !streaming && !overLimit;

  async function onSend() {
    if (!canSend) return;
    const prompt = input.trim();
    setInput("");

    addMessage({
      id: nextMsgId(),
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    });

    const assistantId = nextMsgId();
    addMessage({
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      modelId: modelId ?? undefined,
    });

    setStreaming(true);

    try {
      const engine = getCachedEngine();
      if (!engine) {
        toast.error("Model not loaded. Please reload the page.");
        setStreaming(false);
        return;
      }

      const t0 = performance.now();
      const response = await engine.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: 1024,
      });

      let fullContent = "";
      let tokensIn = 0;
      let tokensOut = 0;

      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          updateLastAssistant(fullContent);
        }
        if (chunk.usage) {
          tokensIn = chunk.usage.prompt_tokens;
          tokensOut = chunk.usage.completion_tokens;
        }
      }

      const t1 = performance.now();
      const latencyMs = Math.round(t1 - t0);

      if (!tokensIn) tokensIn = Math.round(prompt.length / 4);
      if (!tokensOut) tokensOut = Math.round(fullContent.length / 4);

      const tokensPerSecond = latencyMs > 0 ? Math.round((tokensOut / latencyMs) * 1000) : 0;

      if (sessionId) {
        try {
          const evt = await recordEvent(sessionId, {
            prompt,
            completion: fullContent,
            tokensIn,
            tokensOut,
            latencyMs,
          });

          const msgs = useChatStore.getState().messages;
          const lastAssistant = msgs[msgs.length - 1];
          if (lastAssistant && lastAssistant.role === "assistant") {
            useChatStore.setState({
              messages: [
                ...msgs.slice(0, -1),
                {
                  ...lastAssistant,
                  eventId: evt.eventId,
                  latencyMs,
                  tokensIn,
                  tokensOut,
                  modelId: modelId ?? undefined,
                },
              ],
            });
          }
        } catch {
          // non-blocking
        }
      }

      if (tokensPerSecond > 0) {
        toast.success(`${tokensPerSecond} tokens/sec`, { duration: 2000 });
      }
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Chat failed. Try again.");
      updateLastAssistant("Error: failed to generate response.");
    } finally {
      setStreaming(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  function insertQuickPrompt(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          rows={3}
          disabled={streaming}
          className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 pr-12 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <span
            className={`text-xs ${overLimit ? "text-red-500" : "text-muted-foreground"}`}
          >
            {charCount}/{MAX_CHARS}
          </span>
          <Button
            size="icon-sm"
            onClick={onSend}
            disabled={!canSend}
            title="Send"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {metrics.totalMessages > 0 && (
            <span className="text-xs text-muted-foreground">
              {metrics.totalMessages} messages &middot; {metrics.tokensPerSecond} tok/s
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-muted-foreground"
        >
          <Settings2 className="size-3 mr-1" />
          Quick prompts
          {showSettings ? <ChevronUp className="size-3 ml-1" /> : <ChevronDown className="size-3 ml-1" />}
        </Button>
      </div>

      {showSettings && (
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              onClick={() => insertQuickPrompt(prompt)}
              className="text-xs"
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}
