# Product definition

## Product statement

ReqLens helps developers and technical product teams verify human- and agent-authored software changes by connecting every requirement to code, tests, captured decisions, and execution evidence.

## Initial user

The first user is an individual product engineer or technically minded product owner who:

- starts work from a written requirement or PRD;
- delegates implementation to a coding agent;
- can read a diff but cannot confidently reconstruct the whole agent run;
- wants to review requirement coverage, not only code style;
- needs a local workflow that can be used on private repositories.

The initial product is not designed for enterprise governance, multi-team reporting, or compliance certification.

## Job to be done

> When an AI agent finishes implementing a feature, help me determine whether it built what I requested and show me the evidence, so I can review the result without replaying the entire coding session manually.

## Product surface

ReqLens is installed in an existing application repository and runs as a local service with a browser dashboard. It uses a preferred configurable port, falls back to an available port when necessary, and binds to the loopback interface by default.

The product combines four contexts that are normally fragmented across different tools:

- **Product context** — feature, requirement, acceptance criterion, label, and work item.
- **Delivery context** — repository, worktree, branch, base revision, commit, and diff.
- **Agent context** — observable actions, declared decisions, changes, failures, and handoff.
- **Verification context** — required tests, executions, results, artifacts, findings, and human decisions.

The complete capability breakdown lives in [the product feature map](features.md).

Agent context enriches the evidence but is optional. ReqLens can review any Git change. When it did not observe the implementation, it must label explanations about intent or rationale as retrospective inferences.

The local dashboard is provisionally named **ReqLens Studio**. The AI workflow separates a builder completion loop from a fresh, read-only reviewer run. This prevents the product from becoming an endless stream of generic self-critique and keeps review focused on requirement coverage, evidence, scope, and material risk. See [the build and review protocol](review-protocol.md).

## First end-to-end workflow

1. A user installs and starts ReqLens inside an existing repository.
2. ReqLens discovers the repository and its Git worktrees.
3. The user imports a PRD and selects a feature, acceptance criteria, work item, and worktree.
4. The user starts Codex with the ReqLens context and local bridge enabled.
5. ReqLens records observable events and calculates changes from the worktree's base revision.
6. Code changes and verification results are linked to the relevant criteria.
7. The user requests or runs approved unit, integration, API, or database checks.
8. ReqLens computes an evidence-based coverage state without merging deterministic and model-generated judgments.
9. The user reviews functions, diffs, tests, findings, and provenance in the local dashboard.
10. The user accepts the result or requests follow-up changes.

## MVP capabilities

### Requirement ingestion

- Read one documented Markdown format.
- Preserve the original source text.
- Assign or validate stable requirement and acceptance-criterion IDs.
- Report ambiguous or untestable criteria instead of silently rewriting them.

### Agent-run capture

- Support one coding-agent adapter initially.
- Store a normalized, append-only sequence of relevant execution events.
- Capture file reads, changes, commands, tests, declared decisions, and failures when available.
- Redact secrets and avoid collecting unrelated environment data.

### Evidence linking

- Link requirements to work items and agent runs.
- Link code changes and test results to acceptance criteria.
- Distinguish directly captured links from model-inferred links.
- Let the user confirm, reject, or edit inferred relationships.

### Evaluation

- Record deterministic verification results.
- Allow semantic evaluation against an acceptance criterion.
- Show the evaluator, model, prompt or rubric version, and supporting evidence.
- Never merge deterministic and model-based results into an unexplained score.

### Local dashboard

- Requirement coverage matrix.
- Agent execution timeline.
- Diff and file view with linked intent and evidence.
- Findings requiring human review.
- Final accept, reject, or needs-changes decision.

### Repository and worktree awareness

- Run as a repository-local development tool.
- Detect branches, commits, and Git worktrees.
- Associate an active work item and base revision with each recorded session.
- Keep evidence from concurrent worktrees separate.

### Controlled test execution

- Define named unit, integration, API, database, and end-to-end test profiles.
- Stream approved test execution into the dashboard.
- Record the exact revision, command, exit state, relevant output, and artifacts.
- Keep secret values out of ReqLens storage.

## Explicit non-goals for the MVP

- Generating production code itself.
- Replacing an issue tracker.
- Supporting every coding agent.
- Automatically proving functional correctness.
- Organization accounts, permissions, billing, or hosted collaboration.
- Comparing agent productivity across employees.
- Building a generic LLM observability platform.

## Core product distinction

ReqLens should be evaluated by the quality of the connection it creates:

```text
product intent <-> implementation <-> verification evidence
```

Agent traces are an input, not the final product. Code review findings are an output, not the whole product.

## Early success signals

For the first working prototype:

- A new user can load the included example without configuration.
- Every coverage claim can be opened to inspect its evidence.
- The user can identify at least one missing, partial, or out-of-scope implementation from the dashboard.
- The system never presents an inferred relationship as directly observed.
- The complete demo runs locally against a small repository.

## Open product questions

- Which coding agent should the first adapter support?
- Should requirement IDs be authored by the user or generated by ReqLens?
- What is the smallest event format that preserves useful provenance?
- At what granularity should code be linked: commit, file, symbol, hunk, or line?
- How should ReqLens represent evidence that supports several requirements?
- Which semantic evaluations are useful enough to justify model cost and uncertainty?
- What information must be captured during a run because it cannot be reconstructed reliably afterward?

