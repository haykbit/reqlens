import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ActivityView } from "@/components/activity";
import { ChangesView } from "@/components/changes";
import { StatusBadge } from "@/components/common";
import { RevisionStrip, Sidebar, Topbar } from "@/components/layout";
import { OverviewView } from "@/components/overview";
import { ReplayView } from "@/components/replay";
import { TestsView } from "@/components/tests";
import { Button } from "@/components/ui/button";
import { createAction, getDashboard } from "@/lib/api";
import { localize, ui, viewLabel } from "@/lib/i18n";
import type { ActionResponse, DashboardPayload, Locale, ViewId } from "@/types";

const DEFAULT_VIEW: ViewId = "overview";

export function App() {
  const [locale, setLocale] = useState<Locale>("en");
  const [activeView, setActiveView] = useState<ViewId>(DEFAULT_VIEW);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCriterionId, setSelectedCriterionId] = useState<string | null>(null);
  const [selectedChangePath, setSelectedChangePath] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<ActionResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await getDashboard();
      setData(dashboard);
      setSelectedCriterionId((current) => current ?? dashboard.criteria[0]?.id ?? null);
      setSelectedChangePath((current) => current ?? dashboard.changes[0]?.path ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const selectedCriterion = useMemo(
    () => data?.criteria.find((criterion) => criterion.id === selectedCriterionId) ?? data?.criteria[0],
    [data, selectedCriterionId],
  );
  const selectedChange = useMemo(
    () => data?.changes.find((change) => change.path === selectedChangePath) ?? data?.changes[0],
    [data, selectedChangePath],
  );

  async function runAction(action: "run_acceptance" | "open_preview" | "request_changes") {
    if (!data) return;
    setPendingAction(action);
    try {
      setNotice(await createAction(action, data.project.head_revision));
      if (action === "open_preview") setActiveView("replay");
      if (action === "run_acceptance") setActiveView("tests");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unknown error");
    } finally {
      setPendingAction(null);
    }
  }

  if (loading) return <LoadingState locale={locale} />;
  if (!data || error) return <ErrorState locale={locale} detail={error} onRetry={() => void load()} />;

  return (
    <div className="flex min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Sidebar activeView={activeView} locale={locale} onViewChange={setActiveView} />

      <div className="min-w-0 flex-1">
        <Topbar data={data} locale={locale} onLocaleChange={setLocale} />
        <RevisionStrip data={data} locale={locale} />

        <main className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-medium text-neutral-400">ENG-284</span>
                  <StatusBadge state={data.status} locale={locale} />
                  <span className="text-[10px] text-neutral-400">{ui("updatedTwoMinutes", locale)}</span>
                </div>
                <h1 className="mt-3 text-[24px] font-semibold leading-[1.15] tracking-[-0.04em] text-neutral-950 sm:text-[30px]">
                  {localize(data.title, locale)}
                </h1>
                <p className="mt-2 max-w-2xl text-[13px] leading-5 text-neutral-500 sm:text-[14px] sm:leading-6">
                  {localize(data.description, locale)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => void runAction("open_preview")} disabled={pendingAction !== null}>
                  <ArrowUpRight className="size-3.5" />
                  {ui("openPreview", locale)}
                </Button>
                <Button onClick={() => void runAction("run_acceptance")} disabled={pendingAction !== null}>
                  <Play className="size-3.5 fill-current" />
                  {ui("runAcceptance", locale)}
                </Button>
                <Button variant="ghost" aria-label={ui("requestChanges", locale)} onClick={() => void runAction("request_changes")} disabled={pendingAction !== null}>
                  <CircleAlert className="size-3.5" />
                  <span className="hidden xl:inline">{ui("requestChanges", locale)}</span>
                </Button>
              </div>
            </div>

            <SummaryStrip data={data} locale={locale} />

            <div className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-neutral-200">
              {(["overview", "changes", "tests", "replay", "activity"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`relative shrink-0 px-3 pb-2.5 text-[12px] font-medium transition-colors ${activeView === view ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-700"}`}
                >
                  {ui(viewLabel[view], locale)}
                  {activeView === view ? <span className="absolute inset-x-2 -bottom-px h-px bg-neutral-950" /> : null}
                </button>
              ))}
            </div>

            <div key={activeView} className="mt-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
              {activeView === "overview" && selectedCriterion ? (
                <OverviewView data={data} locale={locale} selectedCriterion={selectedCriterion} onCriterionSelect={(criterion) => setSelectedCriterionId(criterion.id)} />
              ) : null}
              {activeView === "changes" && selectedChange ? (
                <ChangesView data={data} locale={locale} selectedChange={selectedChange} onChangeSelect={(change) => setSelectedChangePath(change.path)} />
              ) : null}
              {activeView === "tests" ? <TestsView data={data} locale={locale} onRun={() => void runAction("run_acceptance")} /> : null}
              {activeView === "replay" ? <ReplayView data={data} locale={locale} /> : null}
              {activeView === "activity" ? <ActivityView data={data} locale={locale} /> : null}
            </div>
          </div>
        </main>
      </div>

      {notice ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-2.5 rounded-lg border border-neutral-200 bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,0.09)]">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check className="size-3" /></span>
          <div><p className="text-[11px] font-semibold text-neutral-800">{ui("actionQueued", locale)}</p><p className="mt-0.5 text-[10px] leading-4 text-neutral-500">{localize(notice.message, locale)}</p></div>
          <button aria-label="Close" className="ml-2 text-neutral-300 hover:text-neutral-600" onClick={() => setNotice(null)}><X className="size-3" /></button>
        </div>
      ) : null}
    </div>
  );
}

function SummaryStrip({ data, locale }: { data: DashboardPayload; locale: Locale }) {
  const items = [
    { label: ui("acceptance", locale), value: `${data.summary.acceptance_verified}/${data.summary.acceptance_total}`, sub: data.summary.acceptance_verified === data.summary.acceptance_total ? ui("verified", locale) : ui("needsEvidence", locale) },
    { label: ui("checks", locale), value: `${data.summary.checks_passed}/${data.summary.checks_total}`, sub: "87.5%" },
    { label: ui("changes", locale), value: `+${data.summary.additions}`, sub: `−${data.summary.deletions}` },
    { label: ui("openFindings", locale), value: String(data.summary.findings_open), sub: ui("required", locale) },
  ];

  return (
    <div className="mt-6 grid overflow-hidden rounded-lg border border-neutral-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.label} className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? "border-t border-neutral-100 sm:border-t-0 sm:border-l" : ""} ${index === 2 ? "sm:border-t xl:border-t-0" : ""}`}>
          <div className="min-w-0 flex-1"><p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-neutral-400">{item.label}</p><p className="mt-1 text-[11px] text-neutral-500">{item.sub}</p></div>
          <span className="font-mono text-[14px] font-semibold tracking-[-0.02em] text-neutral-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function LoadingState({ locale }: { locale: Locale }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f7f5]">
      <div className="flex items-center gap-2 text-[12px] text-neutral-500"><span className="size-2 animate-pulse rounded-full bg-neutral-900" />{ui("loading", locale)}</div>
    </div>
  );
}

function ErrorState({ locale, detail, onRetry }: { locale: Locale; detail: string | null; onRetry: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f7f5] p-6">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6">
        <span className="grid size-8 place-items-center rounded-lg bg-red-50 text-red-700"><CircleAlert className="size-4" /></span>
        <h1 className="mt-4 text-[17px] font-semibold tracking-[-0.025em] text-neutral-950">{ui("errorTitle", locale)}</h1>
        <p className="mt-2 text-[12px] leading-5 text-neutral-500">{ui("errorBody", locale)}</p>
        {detail ? <p className="mt-3 rounded-md bg-neutral-50 p-2 font-mono text-[9px] text-neutral-500">{detail}</p> : null}
        <Button className="mt-5" onClick={onRetry}><RotateCcw className="size-3.5" />{ui("retry", locale)}</Button>
      </div>
    </div>
  );
}
