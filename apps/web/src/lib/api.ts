import type { ActionResponse, DashboardPayload, ReviewAction, WorkspacePayload } from "@/types";

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? `ReqLens API returned ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getWorkspace() {
  return request<WorkspacePayload>("/api/workspace");
}

export function getReview(reviewId: string) {
  return request<DashboardPayload>(`/api/reviews/${reviewId}`);
}

export function createAction(reviewId: string, action: ReviewAction, note?: string) {
  return request<ActionResponse>(`/api/reviews/${reviewId}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, note }),
  });
}
