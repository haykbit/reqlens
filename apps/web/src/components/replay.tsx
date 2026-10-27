import { Check, CircleAlert, ExternalLink, LockKeyhole, MousePointer2, Pause, Play, ShieldCheck } from "lucide-react";
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
        const next = current + 1;
        if (next >= data.replay_steps.length) {
          setPlaying(false);
          return current;
        }
        return next;
      });
    }, 1700);
    return () => window.clearInterval(timer);
  }, [playing, data.replay_steps.length]);

  const step = data.replay_steps[activeStep] ?? data.replay_steps[0];
  if (!step) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Surface className="overflow-hidden bg-neutral-950">
        <div className="flex items-center border-b border-white/10 px-3.5 py-2.5 text-white">
          <div className="flex gap-1.5"><span className="size-2 rounded-full bg-red-400/80" /><span className="size-2 rounded-full bg-amber-300/80" /><span className="size-2 rounded-full bg-emerald-400/80" /></div>
          <div className="mx-auto flex h-6 w-[55%] items-center justify-center rounded-md border border-white/10 bg-white/5 font-mono text-[9px] text-white/50">localhost:4173/sign-in</div>
          <ExternalLink className="size-3 text-white/40" />
        </div>

        <div className="relative grid min-h-[430px] place-items-center overflow-hidden bg-[#f3f4f0] p-8">
          <div className="absolute inset-0 opacity-[0.28] [background-image:radial-gradient(#b7b9b1_0.6px,transparent_0.6px)] [background-size:14px_14px]" />
          <div className="relative w-full max-w-[340px] rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_18px_55px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="grid size-8 place-items-center rounded-lg bg-neutral-950 text-white"><ShieldCheck className="size-4" /></div>
            <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.035em] text-neutral-950">{ui("welcomeBack", locale)}</h3>
            <p className="mt-1 text-[11px] text-neutral-500">{ui("signInContinue", locale)}</p>
            <div className="mt-5 space-y-3">
              <div><label className="mb-1.5 block text-[10px] font-medium text-neutral-600">{ui("email", locale)}</label><div className="flex h-9 items-center rounded-md border border-neutral-200 px-3 text-[11px] text-neutral-600">alex@northstar.dev</div></div>
              <div><label className="mb-1.5 block text-[10px] font-medium text-neutral-600">{ui("password", locale)}</label><div className={cn("flex h-9 items-center rounded-md border px-3 text-[11px] transition-colors", activeStep >= 1 ? "border-red-200 bg-red-50/50 text-red-400" : "border-neutral-200 text-neutral-400")}>••••••••••••</div></div>
              {activeStep >= 2 ? (
                <div className="animate-in fade-in slide-in-from-top-1 rounded-md border border-amber-200 bg-amber-50 p-2.5">
                  <div className="flex gap-2"><LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-amber-700" /><div><p className="text-[10px] font-semibold text-amber-900">{ui("accountLocked", locale)}</p><p className="mt-0.5 text-[9px] leading-4 text-amber-800/70">{ui("tryAgain", locale)}</p></div></div>
                </div>
              ) : null}
              <button className="h-9 w-full rounded-md bg-neutral-950 text-[11px] font-medium text-white">{ui("signIn", locale)}</button>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md border border-neutral-200 bg-white/90 px-2.5 py-1.5 text-[9px] text-neutral-500 backdrop-blur">
            <MousePointer2 className="size-3" /> {ui("step", locale)} {step.order} · {localize(step.title, locale)}
          </div>
        </div>

        <div className="border-t border-white/10 bg-neutral-950 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeStep === data.replay_steps.length - 1) setActiveStep(0);
                setPlaying((value) => !value);
              }}
              className="grid size-7 place-items-center rounded-full bg-white text-neutral-950 transition-transform active:scale-95"
            >
              {playing ? <Pause className="size-3" /> : <Play className="ml-0.5 size-3" />}
            </button>
            <span className="w-7 font-mono text-[9px] tabular-nums text-white/50">{formatTimestamp(step.timestamp_seconds)}</span>
            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${((activeStep + 1) / data.replay_steps.length) * 100}%` }} />
            </div>
            <span className="font-mono text-[9px] text-white/40">0:36</span>
          </div>
        </div>
      </Surface>

      <Surface className="overflow-hidden">
        <div className="border-b border-neutral-100 px-4 py-3.5">
          <SectionHeading title={ui("acceptanceReplay", locale)} description={ui("acceptanceReplayHint", locale)} action={<Tag tone="violet">{ui("demoRun", locale)}</Tag>} />
        </div>
        <div className="divide-y divide-neutral-100">
          {data.replay_steps.map((replayStep, index) => (
            <button
              key={replayStep.id}
              onClick={() => { setActiveStep(index); setPlaying(false); }}
              className={cn("w-full px-4 py-3.5 text-left transition-colors", activeStep === index ? "bg-neutral-50" : "hover:bg-neutral-50/70")}
            >
              <div className="flex items-start gap-2.5">
                <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border", replayStep.state === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>
                  <StateIcon state={replayStep.state} className="size-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2"><span className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">{ui("step", locale)} {replayStep.order}</span><span className="ml-auto font-mono text-[9px] text-neutral-400">{formatTimestamp(replayStep.timestamp_seconds)}</span></span>
                  <span className="mt-1 block text-[11px] font-medium text-neutral-800">{localize(replayStep.title, locale)}</span>
                  <span className="mt-1 block text-[9px] leading-4 text-neutral-500">{localize(replayStep.expectation, locale)}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-neutral-100 bg-neutral-50/60 p-3">
          <div className="flex items-center gap-2 text-[9px] text-neutral-500">
            {data.replay_steps.every((item) => item.state === "verified") ? <Check className="size-3 text-emerald-600" /> : <CircleAlert className="size-3 text-amber-600" />}
            {ui("replayEvidenceSummary", locale)}
          </div>
        </div>
      </Surface>
    </div>
  );
}
