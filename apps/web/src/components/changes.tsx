import { Braces, FileCode2, FilePlus2, GitCommitHorizontal } from "lucide-react";

import { SectionHeading, Tag } from "@/components/common";
import { localize, ui } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ChangeSummary, DashboardPayload, Locale } from "@/types";

export function ChangesView({ data, locale, selectedChange, onChangeSelect }: {
  data: DashboardPayload;
  locale: Locale;
  selectedChange: ChangeSummary | null;
  onChangeSelect: (change: ChangeSummary) => void;
}) {
  if (!selectedChange) {
    return (
      <div className="grid min-h-[340px] place-items-center rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <div><FileCode2 className="mx-auto size-5 text-neutral-300" /><h2 className="mt-3 text-[13px] font-semibold text-neutral-800">{ui("noChanges", locale)}</h2><p className="mt-1.5 font-mono text-[10px] text-neutral-400">{data.project.base_revision} → {data.project.head_revision}</p></div>
      </div>
    );
  }
  return (
    <div className="grid min-h-[560px] overflow-hidden rounded-lg border border-neutral-200 bg-white lg:grid-cols-[330px_minmax(0,1fr)]">
      <div className="border-b border-neutral-200 lg:border-r lg:border-b-0">
        <div className="border-b border-neutral-100 px-4 py-3.5">
          <SectionHeading title={ui("changedFiles", locale)} description={ui("changedFilesHint", locale)} />
        </div>
        <div className="divide-y divide-neutral-100">
          {data.changes.map((change) => (
            <button
              key={change.path}
              onClick={() => onChangeSelect(change)}
              className={cn("w-full px-4 py-3 text-left transition-colors", selectedChange.path === change.path ? "bg-neutral-50" : "hover:bg-neutral-50/70")}
            >
              <div className="flex items-center gap-2">
                {change.category === "migration" ? <FilePlus2 className="size-3.5 text-violet-500" /> : <FileCode2 className="size-3.5 text-neutral-400" />}
                <span className="min-w-0 truncate font-mono text-[10px] text-neutral-700">{change.path}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 pl-5.5">
                <span className="text-[9px] text-emerald-600">+{change.additions}</span>
                <span className="text-[9px] text-red-500">−{change.deletions}</span>
                <span className="ml-auto text-[9px] capitalize text-neutral-400">{change.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-4 py-3.5 sm:px-5">
          <Braces className="size-3.5 text-neutral-400" />
          <span className="font-mono text-[10px] text-neutral-700">{selectedChange.path}</span>
          <div className="ml-auto flex gap-1.5">
            {selectedChange.requirements.map((requirement) => <Tag key={requirement} tone="blue">{requirement}</Tag>)}
          </div>
        </div>

        <div className="grid gap-6 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_290px]">
          <div>
            <div className="overflow-hidden rounded-md border border-neutral-200 bg-[#fbfbfa]">
              <div className="flex items-center border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-[9px] text-neutral-400">
                <GitCommitHorizontal className="mr-1.5 size-3" /> {ui("diffAt", locale)} {data.project.head_revision}
                <span className="ml-auto text-emerald-600">+{selectedChange.additions}</span>
                <span className="ml-1.5 text-red-500">−{selectedChange.deletions}</span>
              </div>
              <pre className="max-h-[560px] overflow-auto p-3 font-mono text-[10px] leading-[1.75] text-neutral-600"><code>{selectedChange.diff || ui("noChanges", locale)}</code></pre>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-neutral-400">{ui("implementation", locale)}</p>
              <p className="mt-2 text-[11px] leading-5 text-neutral-700">{localize(selectedChange.summary, locale)}</p>
            </div>
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-neutral-400">{ui("whyThisChange", locale)}</p>
              <p className="mt-2 text-[11px] leading-5 text-neutral-700">{localize(selectedChange.rationale, locale)}</p>
              <p className="mt-2 text-[9px] text-neutral-400">{data.project.ticket_source} · {data.project.ticket_reference}</p>
            </div>
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-neutral-400">{ui("relatedRequirements", locale)}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedChange.requirements.map((requirement) => <Tag key={requirement}>{requirement}</Tag>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
