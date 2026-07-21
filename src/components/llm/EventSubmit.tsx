"use client";

import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { scoreEvent } from "@/lib/api/llm";
import { computeScore } from "@/lib/scoring/compute";
import { toast } from "sonner";
import { Check, X, Pencil } from "lucide-react";
import { useState } from "react";

interface EventSubmitProps {
  eventId: string;
  completion: string;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
}

export function EventSubmit({
  eventId,
  completion,
  latencyMs,
  tokensIn,
  tokensOut,
}: EventSubmitProps) {
  const [loading, setLoading] = useState(false);
  const markScored = useChatStore((s) => s.markScored);
  const sessionId = useChatStore((s) => s.sessionId);

  async function onSubmit(signal: "accept" | "reject" | "edit") {
    if (!sessionId) return;
    setLoading(true);
    try {
      const score = computeScore({
        completion,
        tokensIn,
        tokensOut,
        latencyMs,
        userSignal: signal,
      });

      await scoreEvent(sessionId, {
        eventId,
        correctness: score.correctness,
        latencyScore: score.latencyScore,
        safetyFlag: score.safetyFlag,
        costScore: score.costScore,
        userSignal: signal,
        composite: score.composite,
      });

      markScored(eventId);
      toast.success(`Scored: ${score.composite.toFixed(2)} composite`);
    } catch (err) {
      console.error("Score error:", err);
      toast.error("Failed to score event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1">Score:</span>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => onSubmit("accept")}
        disabled={loading}
        title="Accept"
        className="text-green-600 hover:text-green-700 hover:bg-green-500/10"
      >
        <Check className="size-3" />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => onSubmit("reject")}
        disabled={loading}
        title="Reject"
        className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
      >
        <X className="size-3" />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => onSubmit("edit")}
        disabled={loading}
        title="Edit"
        className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
      >
        <Pencil className="size-3" />
      </Button>
    </div>
  );
}
