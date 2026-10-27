import { Check, CircleAlert, Clock3, Database, FlaskConical, Play, Terminal } from "lucide-react";

import { SectionHeading, StatusBadge, Surface, Tag } from "@/components/common";
import { Button } from "@/components/ui/button";
import { localize, ui } from "@/lib/i18n";
import { formatDuration } from "@/lib/utils";
import type { DashboardPayload, Locale } from "@/types";

export function TestsView({ data, locale, onRun }: { data: DashboardPayload; locale: Locale; onRun: () => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Surface className="overflow-hidden">
        <div className="border-b border-neutral-100 px-4 py-3.5 sm:px-5">
          <SectionHeading
            title={ui("testEvidence", locale)}
            description={ui("testEvidenceHint", locale)}
            action={<Button size="sm" onClick={onRun}><Play className="size-3" />{ui("runAcceptance", locale)}</Button>}
          />
        </div>
        <div className="divide-y divide-neutral-100">
          {data.tests.map((test) => (
            <div key={test.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-start gap-3">
                <span className={`grid size-7 shrink-0 place-items-center rounded-md border ${test.state === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                  {test.kind === "database" ? <Database className="size-3.5" /> : <FlaskConical className="size-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[12px] font-medium text-neutral-800">{localize(test.name, locale)}</h3>
                    <StatusBadge state={test.state} locale={locale} />
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400">{test.kind}</span>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-4 text-neutral-500">{localize(test.detail, locale)}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {test.requirement_ids.map((id) => <Tag key={id}>{id}</Tag>)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium tabular-nums text-neutral-700">{formatDuration(test.duration_ms, ui("pending", locale))}</p>
                  <p className="mt-1 text-[9px] text-neutral-400">{test.assertions} {ui("assertions", locale)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-2 font-mono text-[9px] text-neutral-500">
                <Terminal className="size-3 shrink-0 text-neutral-400" />
                <span className="truncate">{test.command}</span>
              </div>
            </div>
          ))}
        </div>
      </Surface>

      <div className="space-y-4">
        <Surface className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-neutral-800">{ui("verificationGate", locale)}</p>
            <span className="text-[18px] font-semibold tracking-[-0.04em] text-neutral-950">7/8</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full w-[87.5%] rounded-full bg-neutral-900" />
          </div>
          <div className="mt-4 space-y-2.5">
            <GateRow icon={Check} text={ui("formatLint", locale)} state="pass" />
            <GateRow icon={Check} text={ui("typeChecks", locale)} state="pass" />
            <GateRow icon={Check} text={ui("unitTests", locale)} state="pass" />
            <GateRow icon={Check} text={ui("integrationTests", locale)} state="pass" />
            <GateRow icon={CircleAlert} text={ui("auditDatabaseAssertion", locale)} state="wait" />
          </div>
        </Surface>

        <Surface className="border-blue-200/80 bg-blue-50/35 p-4">
          <div className="flex gap-2.5">
            <Clock3 className="mt-0.5 size-3.5 shrink-0 text-blue-700" />
            <div>
              <p className="text-[11px] font-semibold text-blue-900">{ui("waitingProfile", locale)}</p>
              <p className="mt-1.5 text-[10px] leading-4 text-blue-800/70">{ui("waitingProfileBody", locale)}</p>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}

function GateRow({ icon: Icon, text, state }: { icon: typeof Check; text: string; state: "pass" | "wait" }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className={`grid size-4 place-items-center rounded-full ${state === "pass" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><Icon className="size-2.5" /></span>
      <span className={state === "pass" ? "text-neutral-600" : "text-amber-800"}>{text}</span>
      <span className={`ml-auto size-1.5 rounded-full ${state === "pass" ? "bg-emerald-500" : "bg-amber-400"}`} />
    </div>
  );
}
