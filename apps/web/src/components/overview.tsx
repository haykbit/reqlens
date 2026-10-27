import { ArrowRight, Check, CircleAlert, Code2, FlaskConical, GitPullRequest, Layers3 } from "lucide-react";

import { SectionHeading, StateIcon, StatusBadge, Surface, Tag } from "@/components/common";
import { localize, ui } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AcceptanceCriterion, DashboardPayload, Locale } from "@/types";

export function OverviewView({ data, locale, selectedCriterion, onCriterionSelect }: {
  data: DashboardPayload;
  locale: Locale;
  selectedCriterion: AcceptanceCriterion;
  onCriterionSelect: (criterion: AcceptanceCriterion) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
      <div className="space-y-4">
        <Surface className="overflow-hidden">
          <div className="border-b border-neutral-100 px-4 py-3.5 sm:px-5">
            <SectionHeading title={ui("acceptanceChain", locale)} description={ui("acceptanceChainHint", locale)} />
          </div>
          <div className="grid gap-0 p-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.chain.map((node, index) => (
              <div key={node.kind} className="relative min-w-0 px-2.5 py-2.5">
                {index < data.chain.length - 1 ? <ArrowRight className="absolute -right-1 top-1/2 z-10 hidden size-3 -translate-y-1/2 text-neutral-300 lg:block" /> : null}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.09em] text-neutral-400">{localize(node.eyebrow, locale)}</span>
                  <StateIcon state={node.state} className="ml-auto size-3 text-emerald-600" />
                </div>
                <p className="mt-1.5 truncate text-[12px] font-medium tracking-[-0.01em] text-neutral-800">{localize(node.title, locale)}</p>
                <p className="mt-1 font-mono text-[9px] text-neutral-400">{node.reference}</p>
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="overflow-hidden">
          <div className="border-b border-neutral-100 px-4 py-3.5 sm:px-5">
            <SectionHeading title={ui("criteria", locale)} description={ui("criteriaHint", locale)} />
          </div>
          <div className="divide-y divide-neutral-100">
            {data.criteria.map((criterion) => {
              const active = selectedCriterion.id === criterion.id;
              return (
                <button
                  key={criterion.id}
                  onClick={() => onCriterionSelect(criterion)}
                  className={cn(
                    "group grid w-full grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-2.5 px-4 py-3.5 text-left transition-colors sm:px-5",
                    active ? "bg-neutral-50" : "hover:bg-neutral-50/70",
                  )}
                >
                  <span className={cn("mt-0.5 grid size-5 place-items-center rounded-full border", criterion.state === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>
                    <StateIcon state={criterion.state} className="size-3" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] text-neutral-400">{criterion.id}</span>
                      <span className="text-[12px] font-medium tracking-[-0.01em] text-neutral-800">{localize(criterion.title, locale)}</span>
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-neutral-500">{localize(criterion.detail, locale)}</span>
                  </span>
                  <span className="mt-0.5 hidden text-right sm:block">
                    <span className="block text-[10px] font-medium text-neutral-600">{localize(criterion.evidence_label, locale)}</span>
                    <span className="mt-1 block text-[9px] text-neutral-400">{criterion.test_count} {ui("testsLinked", locale)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Surface>
      </div>

      <div className="space-y-4">
        <Surface className="overflow-hidden">
          <div className="border-b border-neutral-100 px-4 py-3.5">
            <SectionHeading title={ui("selectedCriterion", locale)} />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Tag tone="blue">{selectedCriterion.id}</Tag>
              <StatusBadge state={selectedCriterion.state} locale={locale} />
            </div>
            <h3 className="mt-3 text-[14px] font-semibold leading-5 tracking-[-0.02em] text-neutral-900">{localize(selectedCriterion.title, locale)}</h3>
            <p className="mt-2 text-[11px] leading-5 text-neutral-500">{localize(selectedCriterion.detail, locale)}</p>

            <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
              <div className="flex gap-2.5">
                <Code2 className="mt-0.5 size-3.5 text-neutral-400" />
                <div>
                  <p className="text-[10px] font-medium text-neutral-500">{ui("implementation", locale)}</p>
                  <div className="mt-1.5 space-y-1">
                    {selectedCriterion.implementation.map((item) => <p key={item} className="font-mono text-[9px] text-neutral-700">{item}</p>)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <FlaskConical className="mt-0.5 size-3.5 text-neutral-400" />
                <div>
                  <p className="text-[10px] font-medium text-neutral-500">{ui("proof", locale)}</p>
                  <p className="mt-1.5 text-[10px] leading-4 text-neutral-700">{localize(selectedCriterion.evidence_label, locale)}</p>
                </div>
              </div>
            </div>
          </div>
        </Surface>

        <Surface className="overflow-hidden border-amber-200/80">
          <div className="border-b border-amber-100 bg-amber-50/60 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <CircleAlert className="size-3.5 text-amber-700" />
              <h2 className="text-[12px] font-semibold text-amber-900">{ui("reviewSummary", locale)}</h2>
            </div>
            <p className="mt-1.5 text-[10px] leading-4 text-amber-800/70">{ui("reviewSummaryHint", locale)}</p>
          </div>
          <div className="p-4">
            {data.findings.map((finding) => (
              <div key={finding.id}>
                <div className="flex items-center gap-2">
                  <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-700">{ui("required", locale)}</span>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">{ui("verification", locale)}</span>
                </div>
                <p className="mt-2.5 text-[12px] font-medium leading-4 text-neutral-800">{localize(finding.title, locale)}</p>
                <p className="mt-1.5 text-[10px] leading-4 text-neutral-500">{localize(finding.detail, locale)}</p>
                <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 p-2.5">
                  <p className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">{ui("nextAction", locale)}</p>
                  <p className="mt-1 text-[10px] leading-4 text-neutral-700">{localize(finding.action, locale)}</p>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <div className="grid grid-cols-2 gap-2">
          <Metric icon={Layers3} label={ui("acceptance", locale)} value={`${data.summary.acceptance_verified}/${data.summary.acceptance_total}`} />
          <Metric icon={Check} label={ui("checks", locale)} value={`${data.summary.checks_passed}/${data.summary.checks_total}`} />
          <Metric icon={GitPullRequest} label={ui("revision", locale)} value={data.project.head_revision} mono />
          <Metric icon={CircleAlert} label={ui("openFindings", locale)} value={String(data.summary.findings_open)} />
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, mono = false }: { icon: typeof Layers3; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-neutral-400"><Icon className="size-3" /><span className="text-[9px] font-medium uppercase tracking-wider">{label}</span></div>
      <p className={cn("mt-2 text-[16px] font-semibold tracking-[-0.03em] text-neutral-900", mono && "font-mono text-[12px] tracking-normal")}>{value}</p>
    </div>
  );
}
