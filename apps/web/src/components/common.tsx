import { Check, CircleAlert, Clock3, LoaderCircle, X } from "lucide-react";
import type { ReactNode } from "react";

import { ui } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { EvidenceState, Locale, ReviewDecision } from "@/types";

const stateClasses: Record<EvidenceState, string> = {
  verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  needs_evidence: "border-amber-200 bg-amber-50 text-amber-800",
  in_review: "border-blue-200 bg-blue-50 text-blue-700",
  pending: "border-neutral-200 bg-neutral-50 text-neutral-600",
  failed: "border-red-200 bg-red-50 text-red-700",
};

const stateCopy = {
  verified: "verified",
  needs_evidence: "needsEvidence",
  in_review: "inReview",
  pending: "pending",
  failed: "failed",
} as const;

export function StateIcon({ state, className }: { state: EvidenceState; className?: string }) {
  const icons = {
    verified: Check,
    needs_evidence: CircleAlert,
    in_review: LoaderCircle,
    pending: Clock3,
    failed: X,
  };
  const Icon = icons[state];
  return <Icon className={cn("size-3.5", state === "in_review" && "animate-[spin_2.8s_linear_infinite]", className)} />;
}

export function StatusBadge({ state, locale, compact = false }: { state: EvidenceState; locale: Locale; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", stateClasses[state])}>
      <StateIcon state={state} />
      {!compact && ui(stateCopy[state], locale)}
    </span>
  );
}

const decisionCopy = {
  in_review: "awaitingDecision",
  accepted: "accepted",
  changes_requested: "changesRequested",
  stale: "stale",
} as const;

const decisionClasses: Record<ReviewDecision, string> = {
  in_review: "border-neutral-200 bg-neutral-50 text-neutral-600",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  changes_requested: "border-amber-200 bg-amber-50 text-amber-800",
  stale: "border-violet-200 bg-violet-50 text-violet-700",
};

export function DecisionBadge({ decision, locale }: { decision: ReviewDecision; locale: Locale }) {
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium", decisionClasses[decision])}>{ui(decisionCopy[decision], locale)}</span>;
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h2 className="text-[14px] font-semibold tracking-[-0.015em] text-neutral-950">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-[12px] leading-5 text-neutral-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "blue" | "violet" }) {
  const tones = {
    neutral: "border-neutral-200 bg-neutral-50 text-neutral-600",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
  };
  return <span className={cn("inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px]", tones[tone])}>{children}</span>;
}

export function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-neutral-200/90 bg-white", className)}>{children}</section>;
}
