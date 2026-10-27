export type Locale = "en" | "es";

export interface LocalizedText {
  en: string;
  es: string;
}

export type EvidenceState = "verified" | "needs_evidence" | "in_review" | "pending" | "failed";

export interface ProjectContext {
  repository: string;
  branch: string;
  worktree: string;
  base_revision: string;
  head_revision: string;
  pull_request: number;
}

export interface ProductNode {
  kind: "feature" | "requirement" | "ticket" | "revision";
  eyebrow: LocalizedText;
  title: LocalizedText;
  reference: string;
  state: EvidenceState;
}

export interface AcceptanceCriterion {
  id: string;
  title: LocalizedText;
  detail: LocalizedText;
  state: EvidenceState;
  implementation: string[];
  test_count: number;
  evidence_label: LocalizedText;
}

export interface ChangeSummary {
  path: string;
  additions: number;
  deletions: number;
  category: "implementation" | "test" | "migration" | "configuration";
  requirements: string[];
  summary: LocalizedText;
  rationale: LocalizedText;
}

export interface TestResult {
  id: string;
  name: LocalizedText;
  command: string;
  kind: "unit" | "integration" | "api" | "database" | "e2e";
  state: EvidenceState;
  duration_ms: number | null;
  assertions: number;
  requirement_ids: string[];
  detail: LocalizedText;
}

export interface ReplayStep {
  id: string;
  order: number;
  title: LocalizedText;
  expectation: LocalizedText;
  state: EvidenceState;
  timestamp_seconds: number;
  requirement_ids: string[];
}

export interface Finding {
  id: string;
  severity: "required" | "recommended" | "optional";
  category: "coverage" | "scope" | "correctness" | "verification" | "maintainability";
  title: LocalizedText;
  detail: LocalizedText;
  requirement_ids: string[];
  evidence: string[];
  action: LocalizedText;
}

export interface ActivityEvent {
  id: string;
  time: string;
  actor: LocalizedText;
  title: LocalizedText;
  detail: LocalizedText;
  kind: "product" | "agent" | "git" | "test" | "review";
}

export interface DashboardSummary {
  acceptance_verified: number;
  acceptance_total: number;
  checks_passed: number;
  checks_total: number;
  additions: number;
  deletions: number;
  findings_open: number;
  replay_state: EvidenceState;
}

export interface DashboardPayload {
  project: ProjectContext;
  title: LocalizedText;
  description: LocalizedText;
  status: EvidenceState;
  chain: ProductNode[];
  criteria: AcceptanceCriterion[];
  changes: ChangeSummary[];
  tests: TestResult[];
  replay_steps: ReplayStep[];
  findings: Finding[];
  activity: ActivityEvent[];
  summary: DashboardSummary;
}

export interface ActionResponse {
  action_id: string;
  state: "accepted";
  message: LocalizedText;
}

export type ViewId = "overview" | "changes" | "tests" | "replay" | "activity";
