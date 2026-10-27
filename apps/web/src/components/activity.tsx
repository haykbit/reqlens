import { Bot, Box, CheckCircle2, GitCommitHorizontal, UserRound } from "lucide-react";

import { SectionHeading, Surface } from "@/components/common";
import { localize, ui } from "@/lib/i18n";
import type { ActivityEvent, DashboardPayload, Locale } from "@/types";

const icons: Record<ActivityEvent["kind"], typeof Bot> = {
  product: UserRound,
  agent: Bot,
  git: GitCommitHorizontal,
  test: CheckCircle2,
  review: Box,
};

export function ActivityView({ data, locale }: { data: DashboardPayload; locale: Locale }) {
  return (
    <Surface className="mx-auto max-w-3xl overflow-hidden">
      <div className="border-b border-neutral-100 px-4 py-3.5 sm:px-5">
        <SectionHeading title={ui("timeline", locale)} description={ui("timelineHint", locale)} />
      </div>
      <div className="px-4 py-2 sm:px-5">
        {data.activity.map((event, index) => {
          const Icon = icons[event.kind];
          return (
            <div key={event.id} className="relative grid grid-cols-[42px_24px_minmax(0,1fr)] gap-3 py-4">
              {index < data.activity.length - 1 ? <span className="absolute left-[53px] top-9 h-[calc(100%-18px)] w-px bg-neutral-200" /> : null}
              <time className="pt-1 font-mono text-[9px] text-neutral-400">{event.time}</time>
              <span className="relative z-10 grid size-6 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-500"><Icon className="size-3" /></span>
              <div>
                <div className="flex flex-wrap items-center gap-2"><p className="text-[11px] font-medium text-neutral-800">{localize(event.title, locale)}</p><span className="text-[9px] text-neutral-400">{localize(event.actor, locale)}</span></div>
                <p className="mt-1 text-[10px] leading-4 text-neutral-500">{localize(event.detail, locale)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
