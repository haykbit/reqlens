import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "@/App";
import type { DashboardPayload, WorkspacePayload } from "@/types";

const reviewId = "review-1";

const workspace: WorkspacePayload = {
  reviews: [
    {
      id: reviewId,
      project_id: "project-1",
      repository: "github.com/example/sample",
      repository_path: "/tmp/sample",
      ticket_reference: "SAMPLE-1",
      ticket_source: "manual",
      title: "Add a health endpoint",
      branch: "main",
      status: "needs_evidence",
      decision: "in_review",
      updated_at: "2026-10-28T09:00:00Z",
    },
  ],
  selected_review_id: reviewId,
};

const dashboard: DashboardPayload = {
  project: {
    project_id: "project-1",
    review_id: reviewId,
    repository_path: "/tmp/sample",
    repository: "github.com/example/sample",
    branch: "main",
    worktree: "/tmp/sample",
    base_revision: "abc123",
    head_revision: "def456",
    pull_request: null,
    ticket_reference: "SAMPLE-1",
    ticket_source: "manual",
    ticket_url: null,
    preview_url: null,
    decision: "in_review",
    decision_note: null,
    accepted_revision: null,
    dirty: true,
    updated_at: "2026-10-28T09:00:00Z",
  },
  title: { en: "Add a health endpoint", es: "Add a health endpoint" },
  description: { en: "Expose a deterministic health signal.", es: "Expose a deterministic health signal." },
  status: "needs_evidence",
  chain: [],
  criteria: [],
  changes: [],
  tests: [],
  replay_steps: [],
  findings: [],
  activity: [],
  summary: {
    acceptance_verified: 0,
    acceptance_total: 1,
    checks_passed: 0,
    checks_total: 0,
    additions: 0,
    deletions: 0,
    findings_open: 0,
    replay_state: "pending",
  },
};

function jsonResponse(value: unknown) {
  return Promise.resolve(new Response(JSON.stringify(value), { status: 200, headers: { "Content-Type": "application/json" } }));
}

afterEach(() => vi.unstubAllGlobals());

describe("review workspace", () => {
  it("keeps unavailable actions disabled and records a reason for requested changes", async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      requests.push({ url, init });
      if (url === "/api/workspace") return jsonResponse(workspace);
      if (url.endsWith("/actions")) {
        return jsonResponse({ action_id: "action-1", state: "accepted", message: { en: "Recorded", es: "Registrado" }, target_url: null });
      }
      return jsonResponse(dashboard);
    }));

    render(<App />);
    await screen.findByRole("heading", { name: "Add a health endpoint" });

    expect(screen.getByRole("banner").parentElement?.className).toContain("sticky");
    expect(screen.getByRole("complementary").className).toContain("sticky");
    expect((screen.getByRole("button", { name: "Open preview" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Accept review" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Request changes" }));

    const note = screen.getByPlaceholderText("What must change before this ticket can be accepted?");
    fireEvent.change(note, { target: { value: "Add database evidence." } });
    fireEvent.click(screen.getByRole("button", { name: "Send request" }));

    await waitFor(() => {
      const action = requests.find((request) => request.url.endsWith("/actions"));
      expect(action).toBeDefined();
      expect(JSON.parse(String(action?.init?.body))).toEqual({ action: "request_changes", note: "Add database evidence." });
    });
  });
});
