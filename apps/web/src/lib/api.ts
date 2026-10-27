import type { ActionResponse, DashboardPayload } from "@/types";

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`ReqLens API returned ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getDashboard() {
  return request<DashboardPayload>("/api/dashboard");
}

export function createAction(
  action: "run_acceptance" | "open_preview" | "request_changes",
  revision: string,
) {
  return request<ActionResponse>("/api/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, revision }),
  });
}
