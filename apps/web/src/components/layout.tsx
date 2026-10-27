import {
  Activity,
  Boxes,
  ChevronDown,
  CircleDotDashed,
  Command,
  FileCode2,
  FlaskConical,
  GitBranch,
  PlaySquare,
  Search,
  Settings,
} from "lucide-react";

import { ui, viewLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { DashboardPayload, Locale, ViewId } from "@/types";

const navigation: Array<{ id: ViewId; icon: typeof Boxes }> = [
  { id: "overview", icon: Boxes },
  { id: "changes", icon: FileCode2 },
  { id: "tests", icon: FlaskConical },
  { id: "replay", icon: PlaySquare },
  { id: "activity", icon: Activity },
];

export function Sidebar({ activeView, locale, onViewChange }: { activeView: ViewId; locale: Locale; onViewChange: (view: ViewId) => void }) {
  return (
    <aside className="hidden h-screen w-[228px] shrink-0 flex-col border-r border-neutral-200/80 bg-[#f7f7f5] md:flex">
      <div className="flex h-13 items-center gap-2.5 px-3.5">
        <div className="grid size-6 place-items-center rounded-md bg-neutral-950 text-[12px] font-semibold text-white">R</div>
        <span className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-950">ReqLens</span>
        <span className="ml-auto rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-neutral-500">alpha</span>
      </div>

      <div className="px-2.5 pt-2">
        <button className="group flex h-8 w-full items-center gap-2 rounded-md border border-neutral-200 bg-white px-2 text-left text-[12px] text-neutral-700 shadow-[0_1px_1px_rgba(0,0,0,0.03)] transition-colors hover:border-neutral-300">
          <div className="grid size-4 place-items-center rounded bg-violet-100 text-[9px] font-bold text-violet-700">N</div>
          <span className="truncate">northstar/auth-service</span>
          <ChevronDown className="ml-auto size-3 text-neutral-400" />
        </button>
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
              {id === "tests" ? <span className="ml-auto text-[10px] tabular-nums text-neutral-400">7/8</span> : null}
              {id === "replay" ? <span className="ml-auto size-1.5 rounded-full bg-amber-400" /> : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-5 px-2.5">
        <p className="px-2 text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">{ui("workspace", locale)}</p>
        <div className="mt-1.5 space-y-0.5">
          <button className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-[12px] font-medium text-neutral-500 transition-colors hover:bg-neutral-200/45 hover:text-neutral-900">
            <CircleDotDashed className="size-3.5" strokeWidth={1.8} />
            {ui("projects", locale)}
          </button>
          <button className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-[12px] font-medium text-neutral-500 transition-colors hover:bg-neutral-200/45 hover:text-neutral-900">
            <Settings className="size-3.5" strokeWidth={1.8} />
            {ui("settings", locale)}
          </button>
        </div>
      </div>

      <div className="mt-auto border-t border-neutral-200/80 p-2.5">
        <div className="rounded-md px-2 py-2 text-[11px] text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
            <span className="font-medium text-neutral-700">{ui("localOnly", locale)}</span>
            <span className="ml-auto font-mono text-[10px]">:7331</span>
          </div>
          <p className="mt-1.5 pl-3.5 text-[10px] leading-4 text-neutral-400">{ui("evidenceStaysLocal", locale)}</p>
        </div>
      </div>
    </aside>
  );
}

export function Topbar({ data, locale, onLocaleChange }: { data: DashboardPayload; locale: Locale; onLocaleChange: (locale: Locale) => void }) {
  return (
    <header className="flex h-13 items-center border-b border-neutral-200/80 bg-white px-4 sm:px-5">
      <div className="mr-3 grid size-6 place-items-center rounded-md bg-neutral-950 text-[11px] font-semibold text-white md:hidden">R</div>
      <div className="flex min-w-0 items-center gap-2 text-[11px] text-neutral-500">
        <span className="hidden sm:inline">{data.project.repository}</span>
        <span className="hidden text-neutral-300 sm:inline">/</span>
        <span className="truncate font-medium text-neutral-800">ENG-284</span>
        <span className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[9px] text-neutral-500">PR #{data.project.pull_request}</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button className="hidden h-7 items-center gap-2 rounded-md border border-neutral-200 bg-white px-2 text-[11px] text-neutral-500 transition-colors hover:bg-neutral-50 sm:flex">
          <Search className="size-3" />
          <span>{ui("search", locale)}</span>
          <span className="ml-3 flex items-center gap-0.5 rounded border border-neutral-200 bg-neutral-50 px-1 text-[9px] text-neutral-400">
            <Command className="size-2.5" />K
          </span>
        </button>
        <div className="ml-1 flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5" aria-label="Language">
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
        <button className="ml-1 grid size-7 place-items-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">HP</button>
      </div>
    </header>
  );
}

export function RevisionStrip({ data, locale }: { data: DashboardPayload; locale: Locale }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-neutral-200/80 bg-[#fbfbfa] px-4 py-2 text-[10px] text-neutral-500 sm:px-5">
      <span className="flex items-center gap-1.5"><GitBranch className="size-3" />{data.project.branch}</span>
      <span className="font-mono">{data.project.base_revision} → {data.project.head_revision}</span>
      <span className="ml-auto hidden items-center gap-1.5 text-neutral-400 sm:flex"><span className="size-1.5 rounded-full bg-emerald-500" />{ui("snapshotSynced", locale)}</span>
    </div>
  );
}
