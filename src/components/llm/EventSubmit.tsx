"use client";

import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { scoreEvent } from "@/lib/api/llm";
import { computeScore, type ScoreOutput } from "@/lib/scoring/compute";
import { toast } from "sonner";
import { Check, X, Pencil, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState<ScoreOutput | null>(null);
  const markScored = useChatStore((s) => s.markScored);
  const sessionId = useChatStore((s) => s.sessionId);

  function getPreview(signal: "accept" | "reject" | "edit") {
    return computeScore({
      completion,
      tokensIn,
      tokensOut,
      latencyMs,
      userSignal: signal,
    });
  }

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
      toast.success(`Scored: ${score.composite.toFixed(2)} (${score.grade})`);
    } catch (err) {
      console.error("Score error:", err);
      toast.error("Failed to score event");
    } finally {
      setLoading(false);
      setExpanded(false);
      setPreview(null);
    }
  }

  return (
    <div className="flex flex-col gap-1">
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
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => {
            setExpanded(!expanded);
            if (!expanded) {
              setPreview(getPreview("accept"));
            }
          }}
          disabled={loading}
          title="Show score breakdown"
        >
          {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </Button>
      </div>

      {expanded && preview && (
        <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2">
          <div className="font-medium">Score Preview</div>
          <div className="grid grid-cols-2 gap-2">
            <ScoreItem label="Correctness" value={preview.breakdown.correctness} />
            <ScoreItem label="Latency" value={preview.breakdown.latency} />
            <ScoreItem label="Cost" value={preview.breakdown.cost} />
            <ScoreItem label="Signal" value={preview.breakdown.signal} />
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-medium">Composite</span>
            <span className="font-bold">{preview.composite.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Grade</span>
            <span className={`font-bold ${getGradeColor(preview.grade)}`}>{preview.grade}</span>
          </div>
          <div className="text-muted-foreground">
            Formula: 0.4×Correctness + 0.2×Latency + 0.2×Cost + 0.2×Signal
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: { value: number; weight: number } }) {
  const percentage = Math.round(value.value * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-muted-foreground">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${getBarColor(value.value)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getBarColor(value: number): string {
  if (value >= 0.7) return "bg-green-500";
  if (value >= 0.4) return "bg-amber-500";
  return "bg-red-500";
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A": return "text-green-600";
    case "B": return "text-blue-600";
    case "C": return "text-amber-600";
    case "D": return "text-orange-600";
    case "F": return "text-red-600";
    default: return "text-muted-foreground";
  }
}
