import {
  Activity,
  Boxes,
  ChevronDown,
  FileCode2,
  FlaskConical,
  GitBranch,
  PlaySquare,
} from "lucide-react";

import { ui, viewLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { DashboardPayload, Locale, ReviewListItem, ViewId } from "@/types";

const navigation: Array<{ id: ViewId; icon: typeof Boxes }> = [
  { id: "overview", icon: Boxes },
  { id: "changes", icon: FileCode2 },
  { id: "tests", icon: FlaskConical },
  { id: "replay", icon: PlaySquare },
  { id: "activity", icon: Activity },
];

export function Sidebar({ activeView, locale, onViewChange, reviews, activeReviewId, onReviewChange, data }: {
  activeView: ViewId;
  locale: Locale;
  onViewChange: (view: ViewId) => void;
  reviews: ReviewListItem[];
  activeReviewId: string;
  onReviewChange: (reviewId: string) => void;
  data: DashboardPayload;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[228px] shrink-0 self-start flex-col border-r border-neutral-200/80 bg-[#f7f7f5] md:flex">
      <div className="flex h-13 items-center gap-2.5 px-3.5">
        <div className="grid size-6 place-items-center rounded-md bg-neutral-950 text-[12px] font-semibold text-white">R</div>
        <span className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-950">ReqLens</span>
      </div>

      <div className="px-2.5 pt-2">
        <div className="relative flex h-8 w-full items-center rounded-md border border-neutral-200 bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03)] transition-colors hover:border-neutral-300">
          <div className="pointer-events-none ml-2 grid size-4 place-items-center rounded bg-violet-100 text-[9px] font-bold uppercase text-violet-700">{data.project.repository.split("/").pop()?.slice(0, 1) ?? "R"}</div>
          <select
            value={activeReviewId}
            onChange={(event) => onReviewChange(event.target.value)}
            className="h-full min-w-0 flex-1 appearance-none bg-transparent pr-6 pl-2 text-[11px] text-neutral-700 outline-none"
            aria-label={ui("selectReview", locale)}
          >
            {reviews.map((review) => <option key={review.id} value={review.id}>{review.repository} · {review.ticket_reference}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 size-3 text-neutral-400" />
        </div>
      </div>

      <div className="mt-4 px-2.5">
        <p className="px-2 text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">{ui("currentReview", locale)}</p>
        <nav className="mt-1.5 space-y-0.5">
          {navigation.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={cn(
                "flex h-8 w-full items-center gap-2 rounded-md px-2 text-[12px] font-medium transition-colors",
                activeView === id ? "bg-neutral-200/65 text-neutral-950" : "text-neutral-500 hover:bg-neutral-200/45 hover:text-neutral-900",
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.8} />
              {ui(viewLabel[id], locale)}
              {id === "tests" ? <span className="ml-auto text-[10px] tabular-nums text-neutral-400">{data.summary.checks_passed}/{data.summary.checks_total}</span> : null}
              {id === "replay" && data.replay_steps.length > 0 && data.summary.replay_state !== "verified" ? <span className="ml-auto size-1.5 rounded-full bg-amber-400" /> : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-neutral-200/80 p-2.5">
        <div className="rounded-md px-2 py-2 text-[11px] text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
            <span className="font-medium text-neutral-700">{ui("localOnly", locale)}</span>
          </div>
          <p className="mt-1.5 pl-3.5 text-[10px] leading-4 text-neutral-400">{ui("evidenceStaysLocal", locale)}</p>
        </div>
      </div>
    </aside>
  );
}

export function Topbar({ data, locale, reviews, activeReviewId, onReviewChange, onLocaleChange }: {
  data: DashboardPayload;
  locale: Locale;
  reviews: ReviewListItem[];
  activeReviewId: string;
  onReviewChange: (reviewId: string) => void;
  onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <header className="flex h-13 items-center border-b border-neutral-200/80 bg-white px-4 sm:px-5">
      <div className="mr-3 grid size-6 place-items-center rounded-md bg-neutral-950 text-[11px] font-semibold text-white md:hidden">R</div>
      <select value={activeReviewId} onChange={(event) => onReviewChange(event.target.value)} aria-label={ui("selectReview", locale)} className="min-w-0 max-w-[190px] bg-transparent text-[11px] font-medium text-neutral-800 outline-none md:hidden">
        {reviews.map((review) => <option key={review.id} value={review.id}>{review.ticket_reference} · {review.title}</option>)}
      </select>
      <div className="hidden min-w-0 items-center gap-2 text-[11px] text-neutral-500 md:flex">
        <span className="hidden sm:inline">{data.project.repository}</span>
        <span className="hidden text-neutral-300 sm:inline">/</span>
        {data.project.ticket_url ? <a href={data.project.ticket_url} target="_blank" rel="noreferrer" className="truncate font-medium text-neutral-800 hover:underline">{data.project.ticket_reference}</a> : <span className="truncate font-medium text-neutral-800">{data.project.ticket_reference}</span>}
        <span className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[9px] uppercase text-neutral-500">{data.project.ticket_source}</span>
        {data.project.pull_request ? <span className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[9px] text-neutral-500">PR #{data.project.pull_request}</span> : null}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="ml-1 flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5" role="group" aria-label={ui("language", locale)}>
          {(["en", "es"] as const).map((language) => (
            <button
              key={language}
              onClick={() => onLocaleChange(language)}
              className={cn(
                "h-5 rounded px-1.5 text-[9px] font-semibold uppercase transition-colors",
                locale === language ? "bg-white text-neutral-900 shadow-[0_1px_1px_rgba(0,0,0,0.08)]" : "text-neutral-400 hover:text-neutral-700",
              )}
            >
              {language}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export function RevisionStrip({ data, locale }: { data: DashboardPayload; locale: Locale }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-neutral-200/80 bg-[#fbfbfa] px-4 py-2 text-[10px] text-neutral-500 sm:px-5">
      <span className="flex items-center gap-1.5"><GitBranch className="size-3" />{data.project.branch}</span>
      <span className="font-mono">{data.project.base_revision} → {data.project.head_revision}</span>
      <span className={`ml-auto hidden items-center gap-1.5 sm:flex ${data.project.dirty ? "text-amber-600" : "text-neutral-400"}`}><span className={`size-1.5 rounded-full ${data.project.dirty ? "bg-amber-400" : "bg-emerald-500"}`} />{data.project.dirty ? ui("dirty", locale) : ui("clean", locale)}</span>
    </div>
  );
}
