import { Check, CircleAlert, Database, FlaskConical, Terminal } from "lucide-react";

import { SectionHeading, StatusBadge, Surface, Tag } from "@/components/common";
import { localize, ui } from "@/lib/i18n";
import { formatDuration } from "@/lib/utils";
import type { DashboardPayload, Locale } from "@/types";

export function TestsView({ data, locale }: { data: DashboardPayload; locale: Locale }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Surface className="overflow-hidden">
        <div className="border-b border-neutral-100 px-4 py-3.5 sm:px-5">
          <SectionHeading title={ui("testEvidence", locale)} description={ui("testEvidenceHint", locale)} />
        </div>
        <div className="divide-y divide-neutral-100">
          {data.tests.map((test) => (
            <div key={test.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-start gap-3">
                <span className={`grid size-7 shrink-0 place-items-center rounded-md border ${test.state === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : test.state === "failed" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
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
          {data.tests.length === 0 ? <p className="px-5 py-8 text-center text-[12px] text-neutral-500">{ui("noTests", locale)}</p> : null}
        </div>
      </Surface>

      <div className="space-y-4">
        <Surface className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-neutral-800">{ui("verificationGate", locale)}</p>
            <span className="text-[18px] font-semibold tracking-[-0.04em] text-neutral-950">{data.summary.checks_passed}/{data.summary.checks_total}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-neutral-900 transition-[width]" style={{ width: `${data.summary.checks_total === 0 ? 0 : (data.summary.checks_passed / data.summary.checks_total) * 100}%` }} />
          </div>
          <div className="mt-4 space-y-2.5">
            {data.tests.map((test) => <GateRow key={test.id} icon={test.state === "verified" ? Check : CircleAlert} text={localize(test.name, locale)} state={test.state === "verified" ? "pass" : test.state === "failed" ? "fail" : "wait"} />)}
            {data.tests.length === 0 ? <p className="text-[10px] leading-4 text-neutral-500">{ui("waitingForAgent", locale)}</p> : null}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function GateRow({ icon: Icon, text, state }: { icon: typeof Check; text: string; state: "pass" | "fail" | "wait" }) {
  const tone = state === "pass" ? "bg-emerald-50 text-emerald-700" : state === "fail" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700";
  const dot = state === "pass" ? "bg-emerald-500" : state === "fail" ? "bg-red-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className={`grid size-4 place-items-center rounded-full ${tone}`}><Icon className="size-2.5" /></span>
      <span className={state === "pass" ? "text-neutral-600" : state === "fail" ? "text-red-800" : "text-amber-800"}>{text}</span>
      <span className={`ml-auto size-1.5 rounded-full ${dot}`} />
    </div>
  );
}
