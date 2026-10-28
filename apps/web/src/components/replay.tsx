import { Check, CircleAlert, ExternalLink, Pause, Play, Route } from "lucide-react";
import { useEffect, useState } from "react";

import { SectionHeading, StateIcon, Surface, Tag } from "@/components/common";
import { localize, ui } from "@/lib/i18n";
import { cn, formatTimestamp } from "@/lib/utils";
import type { DashboardPayload, Locale } from "@/types";

export function ReplayView({ data, locale }: { data: DashboardPayload; locale: Locale }) {
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setActiveStep((current) => {
        if (current + 1 >= data.replay_steps.length) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1700);
    return () => window.clearInterval(timer);
  }, [playing, data.replay_steps.length]);

  const step = data.replay_steps[activeStep] ?? data.replay_steps[0];
  if (!step) {
    return <Surface className="mx-auto max-w-3xl p-10 text-center"><Route className="mx-auto size-5 text-neutral-300" /><p className="mt-3 text-[12px] text-neutral-500">{ui("noReplay", locale)}</p></Surface>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Surface className="overflow-hidden bg-neutral-950 text-white">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Route className="size-3.5 text-white/50" />
          <span className="min-w-0 flex-1 truncate font-mono text-[9px] text-white/50">{data.project.preview_url ?? `${data.project.repository} · ${data.project.head_revision}`}</span>
          {data.project.preview_url ? <a href={data.project.preview_url} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white"><ExternalLink className="size-3" /></a> : null}
        </div>

        <div className="relative min-h-[430px] overflow-hidden p-8 sm:p-12">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#737373_0.7px,transparent_0.7px)] [background-size:16px_16px]" />
          <div className="relative mx-auto flex min-h-[330px] max-w-2xl flex-col justify-between rounded-xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between gap-4"><Tag tone="violet">{data.project.ticket_reference}</Tag><span className="font-mono text-[9px] text-white/35">{formatTimestamp(step.timestamp_seconds)}</span></div>
              <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">{ui("step", locale)} {step.order}</p>
              <h3 className="mt-3 max-w-xl text-[24px] font-semibold leading-8 tracking-[-0.035em]">{localize(step.title, locale)}</h3>
              <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/55">{localize(step.expectation, locale)}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">{step.requirement_ids.map((id) => <span key={id} className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[9px] text-white/55">{id}</span>)}</div>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-3"><div className="flex items-center gap-3"><button onClick={() => { if (activeStep === data.replay_steps.length - 1) setActiveStep(0); setPlaying((value) => !value); }} className="grid size-7 place-items-center rounded-full bg-white text-neutral-950 transition-transform active:scale-95">{playing ? <Pause className="size-3" /> : <Play className="ml-0.5 size-3" />}</button><div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${((activeStep + 1) / data.replay_steps.length) * 100}%` }} /></div><span className="font-mono text-[9px] text-white/40">{activeStep + 1}/{data.replay_steps.length}</span></div></div>
      </Surface>

      <Surface className="overflow-hidden">
        <div className="border-b border-neutral-100 px-4 py-3.5"><SectionHeading title={ui("acceptanceReplay", locale)} description={ui("acceptanceReplayHint", locale)} action={<Tag tone="violet">{ui("recordedRun", locale)}</Tag>} /></div>
        <div className="divide-y divide-neutral-100">
          {data.replay_steps.map((replayStep, index) => (
            <button key={replayStep.id} onClick={() => { setActiveStep(index); setPlaying(false); }} className={cn("w-full px-4 py-3.5 text-left transition-colors", activeStep === index ? "bg-neutral-50" : "hover:bg-neutral-50/70")}>
              <div className="flex items-start gap-2.5"><span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border", replayStep.state === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}><StateIcon state={replayStep.state} className="size-3" /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">{ui("step", locale)} {replayStep.order}</span><span className="ml-auto font-mono text-[9px] text-neutral-400">{formatTimestamp(replayStep.timestamp_seconds)}</span></span><span className="mt-1 block text-[11px] font-medium text-neutral-800">{localize(replayStep.title, locale)}</span><span className="mt-1 block text-[9px] leading-4 text-neutral-500">{localize(replayStep.expectation, locale)}</span></span></div>
            </button>
          ))}
        </div>
        <div className="border-t border-neutral-100 bg-neutral-50/60 p-3"><div className="flex items-center gap-2 text-[9px] text-neutral-500">{data.replay_steps.every((item) => item.state === "verified") ? <Check className="size-3 text-emerald-600" /> : <CircleAlert className="size-3 text-amber-600" />}{data.replay_steps.filter((item) => item.state === "verified").length}/{data.replay_steps.length} {ui("verified", locale).toLowerCase()}</div></div>
      </Surface>
    </div>
  );
}
