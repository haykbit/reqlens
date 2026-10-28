import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Database,
  FolderGit2,
  RefreshCw,
  RotateCcw,
  TerminalSquare,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ActivityView } from "@/components/activity";
import { ChangesView } from "@/components/changes";
import { StatusBadge, Surface } from "@/components/common";
import { RevisionStrip, Sidebar, Topbar } from "@/components/layout";
import { OverviewView } from "@/components/overview";
import { ReplayView } from "@/components/replay";
import { TestsView } from "@/components/tests";
import { Button } from "@/components/ui/button";
import { createAction, getReview, getWorkspace } from "@/lib/api";
import { localize, ui, viewLabel } from "@/lib/i18n";
import type {
  ActionResponse,
  DashboardPayload,
  Locale,
  ReviewAction,
  ViewId,
  WorkspacePayload,
} from "@/types";

const DEFAULT_VIEW: ViewId = "overview";

export function App() {
  const [locale, setLocale] = useState<Locale>("en");
  const [activeView, setActiveView] = useState<ViewId>(DEFAULT_VIEW);
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCriterionId, setSelectedCriterionId] = useState<string | null>(null);
  const [selectedChangePath, setSelectedChangePath] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);
  const [notice, setNotice] = useState<ActionResponse | null>(null);

  const loadReview = useCallback(async (reviewId: string) => {
    const dashboard = await getReview(reviewId);
    setData(dashboard);
    setSelectedCriterionId((current) => dashboard.criteria.some((item) => item.id === current) ? current : dashboard.criteria[0]?.id ?? null);
    setSelectedChangePath((current) => dashboard.changes.some((item) => item.path === current) ? current : dashboard.changes[0]?.path ?? null);
  }, []);

  const load = useCallback(async (preferredReviewId?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const nextWorkspace = await getWorkspace();
      setWorkspace(nextWorkspace);
      const reviewId = preferredReviewId
        ?? (activeReviewId && nextWorkspace.reviews.some((item) => item.id === activeReviewId) ? activeReviewId : null)
        ?? nextWorkspace.selected_review_id;
      setActiveReviewId(reviewId);
      if (reviewId) await loadReview(reviewId);
      else setData(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [activeReviewId, loadReview]);

  useEffect(() => {
    void load();
  }, []); // The workspace should load once; selection changes are explicit.

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const selectedCriterion = useMemo(
    () => data?.criteria.find((criterion) => criterion.id === selectedCriterionId) ?? data?.criteria[0] ?? null,
    [data, selectedCriterionId],
  );
  const selectedChange = useMemo(
    () => data?.changes.find((change) => change.path === selectedChangePath) ?? data?.changes[0] ?? null,
    [data, selectedChangePath],
  );

  async function selectReview(reviewId: string) {
    setActiveReviewId(reviewId);
    setLoading(true);
    setError(null);
    try {
      await loadReview(reviewId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(action: ReviewAction) {
    if (!data) return;
    setPendingAction(action);
    try {
      const response = await createAction(data.project.review_id, action);
      setNotice(response);
      if (response.target_url) window.open(response.target_url, "_blank", "noopener,noreferrer");
      if (action !== "open_preview") await load(data.project.review_id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unknown error");
    } finally {
      setPendingAction(null);
    }
  }

  if (loading && !workspace) return <LoadingState locale={locale} />;
  if (error) return <ErrorState locale={locale} detail={error} onRetry={() => void load(activeReviewId)} />;
  if (!workspace || workspace.reviews.length === 0 || !data) {
    return <EmptyWorkspace locale={locale} onLocaleChange={setLocale} onRefresh={() => void load()} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Sidebar
        activeView={activeView}
        locale={locale}
        onViewChange={setActiveView}
        reviews={workspace.reviews}
        activeReviewId={activeReviewId ?? data.project.review_id}
        onReviewChange={(reviewId) => void selectReview(reviewId)}
        data={data}
      />

      <div className="min-w-0 flex-1">
        <Topbar data={data} locale={locale} onLocaleChange={setLocale} />
        <RevisionStrip data={data} locale={locale} />

        <main className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-medium text-neutral-400">{data.project.ticket_reference}</span>
                  <StatusBadge state={data.status} locale={locale} />
                  <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400"><Database className="size-3" />{ui("realData", locale)}</span>
                  <span className="text-[10px] text-neutral-400">{formatUpdated(data.project.updated_at, locale)}</span>
                </div>
                <h1 className="mt-3 text-[24px] font-semibold leading-[1.15] tracking-[-0.04em] text-neutral-950 sm:text-[30px]">
                  {localize(data.title, locale)}
                </h1>
                {localize(data.description, locale) ? (
                  <p className="mt-2 max-w-2xl text-[13px] leading-5 text-neutral-500 sm:text-[14px] sm:leading-6">
                    {localize(data.description, locale)}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => void runAction("open_preview")} disabled={pendingAction !== null}>
                  <ArrowUpRight className="size-3.5" />
                  {ui("openPreview", locale)}
                </Button>
                <Button onClick={() => void runAction("sync_repository")} disabled={pendingAction !== null}>
                  <RefreshCw className={`size-3.5 ${pendingAction === "sync_repository" ? "animate-spin" : ""}`} />
                  {ui("syncRepository", locale)}
                </Button>
                <Button variant="ghost" onClick={() => void runAction("request_changes")} disabled={pendingAction !== null}>
                  <CircleAlert className="size-3.5" />
                  <span className="hidden xl:inline">{ui("requestChanges", locale)}</span>
                </Button>
              </div>
            </div>

            <SummaryStrip data={data} locale={locale} />

            <div className="mt-6 flex items-center gap-1 overflow-hidden border-b border-neutral-200">
              {(["overview", "changes", "tests", "replay", "activity"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`relative min-w-0 flex-1 whitespace-nowrap px-1.5 pb-2.5 text-[12px] font-medium transition-colors sm:flex-none sm:px-3 ${activeView === view ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-700"}`}
                >
                  {ui(viewLabel[view], locale)}
                  {activeView === view ? <span className="absolute inset-x-2 -bottom-px h-px bg-neutral-950" /> : null}
                </button>
              ))}
            </div>

            <div key={activeView} className="mt-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
              {activeView === "overview" ? (
                <OverviewView data={data} locale={locale} selectedCriterion={selectedCriterion} onCriterionSelect={(criterion) => setSelectedCriterionId(criterion.id)} />
              ) : null}
              {activeView === "changes" ? (
                <ChangesView data={data} locale={locale} selectedChange={selectedChange} onChangeSelect={(change) => setSelectedChangePath(change.path)} />
              ) : null}
              {activeView === "tests" ? <TestsView data={data} locale={locale} onRun={() => void runAction("sync_repository")} /> : null}
              {activeView === "replay" ? <ReplayView data={data} locale={locale} /> : null}
              {activeView === "activity" ? <ActivityView data={data} locale={locale} /> : null}
            </div>
          </div>
        </main>
      </div>

      {notice ? <Notice response={notice} locale={locale} onClose={() => setNotice(null)} /> : null}
    </div>
  );
}

function SummaryStrip({ data, locale }: { data: DashboardPayload; locale: Locale }) {
  const percentage = data.summary.checks_total > 0
    ? `${Math.round((data.summary.checks_passed / data.summary.checks_total) * 100)}%`
    : ui("waitingForAgent", locale);
  const items = [
    { label: ui("acceptance", locale), value: `${data.summary.acceptance_verified}/${data.summary.acceptance_total}`, sub: data.summary.acceptance_total > 0 ? ui(data.status === "verified" ? "verified" : "needsEvidence", locale) : ui("waitingForAgent", locale) },
    { label: ui("checks", locale), value: `${data.summary.checks_passed}/${data.summary.checks_total}`, sub: percentage },
    { label: ui("changes", locale), value: `+${data.summary.additions}`, sub: `−${data.summary.deletions}` },
    { label: ui("openFindings", locale), value: String(data.summary.findings_open), sub: data.summary.findings_open > 0 ? ui("required", locale) : ui("noFindings", locale) },
  ];

  return (
    <div className="mt-6 grid overflow-hidden rounded-lg border border-neutral-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.label} className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? "border-t border-neutral-100 sm:border-t-0 sm:border-l" : ""} ${index === 2 ? "sm:border-t xl:border-t-0" : ""}`}>
          <div className="min-w-0 flex-1"><p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-neutral-400">{item.label}</p><p className="mt-1 truncate text-[11px] text-neutral-500">{item.sub}</p></div>
          <span className="font-mono text-[14px] font-semibold tracking-[-0.02em] text-neutral-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyWorkspace({ locale, onLocaleChange, onRefresh }: { locale: Locale; onLocaleChange: (locale: Locale) => void; onRefresh: () => void }) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <header className="flex h-13 items-center border-b border-neutral-200 bg-white px-4 sm:px-6">
        <div className="grid size-6 place-items-center rounded-md bg-neutral-950 text-[12px] font-semibold text-white">R</div>
        <span className="ml-2.5 text-[13px] font-semibold tracking-[-0.02em]">ReqLens</span>
        <span className="ml-2 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-neutral-500">local</span>
        <div className="ml-auto flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5">
          {(["en", "es"] as const).map((language) => <button key={language} onClick={() => onLocaleChange(language)} className={`h-5 rounded px-1.5 text-[9px] font-semibold uppercase ${locale === language ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400"}`}>{language}</button>)}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />API ready · :7332</span>
          <h1 className="mt-5 text-[28px] font-semibold tracking-[-0.045em] sm:text-[38px]">{ui("noReviews", locale)}</h1>
          <p className="mt-3 max-w-xl text-[14px] leading-6 text-neutral-500">{ui("noReviewsBody", locale)}</p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Surface className="p-5">
            <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-md bg-violet-50 text-violet-700"><FolderGit2 className="size-3.5" /></span><h2 className="text-[13px] font-semibold">{ui("agentBridge", locale)}</h2></div>
            <p className="mt-3 text-[12px] leading-5 text-neutral-500">{ui("agentBridgeBody", locale)}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">{["Linear", "Jira", "Asana", "GitHub"].map((provider) => <span key={provider} className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10px] text-neutral-600">{provider}</span>)}</div>
          </Surface>
          <Surface className="p-5">
            <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-md bg-neutral-900 text-white"><TerminalSquare className="size-3.5" /></span><h2 className="text-[13px] font-semibold">{ui("startCommand", locale)}</h2></div>
            <p className="mt-3 text-[12px] leading-5 text-neutral-500">{ui("startCommandBody", locale)}</p>
            <pre className="mt-4 overflow-x-auto rounded-md border border-neutral-200 bg-neutral-950 p-3 font-mono text-[10px] leading-5 text-neutral-200"><code>reqlens start --project . --ticket ticket.json</code></pre>
          </Surface>
        </div>
        <Button variant="outline" className="mt-6" onClick={onRefresh}><RefreshCw className="size-3.5" />{ui("refreshEvidence", locale)}</Button>
      </main>
    </div>
  );
}

function Notice({ response, locale, onClose }: { response: ActionResponse; locale: Locale; onClose: () => void }) {
  const accepted = response.state === "accepted";
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-2.5 rounded-lg border border-neutral-200 bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,0.09)]">
      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${accepted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{accepted ? <Check className="size-3" /> : <CircleAlert className="size-3" />}</span>
      <div><p className="text-[11px] font-semibold text-neutral-800">{accepted ? ui("updated", locale) : ui("needsEvidence", locale)}</p><p className="mt-0.5 text-[10px] leading-4 text-neutral-500">{localize(response.message, locale)}</p></div>
      <button aria-label="Close" className="ml-2 text-neutral-300 hover:text-neutral-600" onClick={onClose}><X className="size-3" /></button>
    </div>
  );
}

function formatUpdated(value: string, locale: Locale) {
  const formatted = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  return `${ui("updated", locale)} ${formatted}`;
}

function LoadingState({ locale }: { locale: Locale }) {
  return <div className="grid min-h-screen place-items-center bg-[#f7f7f5]"><div className="flex items-center gap-2 text-[12px] text-neutral-500"><span className="size-2 animate-pulse rounded-full bg-neutral-900" />{ui("loading", locale)}</div></div>;
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
