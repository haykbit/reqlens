# Build and review protocol

ReqLens is not valuable because an AI can produce more suggestions. Its value is the traceable relationship between product intent, the ticket derived from it, implementation, verification, and a human acceptance decision.

The ticket is the primary unit of acceptance. Code review is a supporting capability used to determine whether the ticket fulfilled the product requirement it came from.

This protocol separates the implementation loop from the review loop so that a builder is not simply asked to praise or criticize its own output in the same context.

## Product surface: ReqLens Studio

The browser dashboard is provisionally called **ReqLens Studio**. It behaves like other repository-local development services:

1. The developer starts ReqLens from the application repository.
2. A local service binds to the loopback interface.
3. It selects the configured preferred port or another available port.
4. The CLI prints and optionally opens the Studio URL.
5. Studio remains connected to the repository, Git worktrees, evidence store, test runner, and agent bridge.

The name distinguishes the visual application from the ReqLens CLI and agent integration without creating a separate product.

## Roles

### Builder

The builder may be a person, Codex, another coding agent, or a combination of them. Its responsibility is to implement the scoped work item and produce a handoff.

The builder should:

- work against an explicit feature, work item, and set of acceptance criteria;
- record material decisions while they are being made;
- avoid changes that do not support the declared scope;
- run the required fast checks;
- remove obvious dead code, duplication, temporary scaffolding, and accidental complexity before handoff;
- state what changed, what remains uncertain, and which checks were run.

### Reviewer

The reviewer is a separate, read-only review run with a fresh task context. It may use the same underlying model as the builder, but it must not reuse the builder conversation as its reasoning context.

The reviewer receives:

- approved requirements and acceptance criteria;
- the worktree base revision and current diff;
- applicable repository and architecture rules;
- captured decisions, labeled by provenance;
- deterministic test evidence;
- the builder handoff summary.

The reviewer does not modify code. It creates structured findings that a human can accept, dismiss, or return to the builder.

### Human owner

The human owner defines scope, approves sensitive test execution, resolves product or engineering trade-offs, and makes the final acceptance decision.

## Why the reviewer does not immediately fix everything

Some findings should be fixed before the reviewer ever sees them. Formatting, lint failures, obvious duplication introduced by the change, dead code, and clearly missing required tests belong in the builder's completion loop.

Other findings require a decision:

- the requirement is ambiguous;
- a simpler implementation has meaningful trade-offs;
- the proposed refactor expands beyond the ticket;
- a test requires infrastructure or data access;
- the change technically works but conflicts with an architectural rule;
- a recommendation improves elegance without improving the product outcome.

ReqLens should not allow an agent to expand scope indefinitely in the name of improvement. The reviewer proposes and supports findings; the human decides which changes are worth making.

## Review workflow

### 1. Scope lock

Before implementation starts, ReqLens records:

- feature;
- work item or external ticket;
- acceptance criteria;
- worktree, branch, and base revision;
- required test plans;
- applicable review policies.

Requirements can still change, but changes must create a visible revision rather than silently altering the contract.

### 2. Implementation

The builder edits the application. ReqLens records available observable events and Git changes. A human implementation remains fully reviewable even when no agent events exist.

### 3. Builder completion loop

Before handoff, the builder executes the configured completion checks:

- format and lint;
- compile or type-check;
- required fast tests;
- changed-code cleanup;
- implementation-to-requirement self-mapping;
- explicit disclosure of unverified assumptions.

If a clear in-scope improvement is found here, the builder should make it immediately and rerun the affected checks.

### 4. Evidence snapshot

ReqLens creates a revision-bound snapshot containing:

- source and target Git revisions;
- changed files, hunks, and supported symbols;
- requirement and acceptance-criterion mappings;
- captured decisions;
- test commands, results, logs, and artifacts;
- unresolved assumptions and known failures.

### 5. Independent review

The reviewer analyzes the evidence snapshot in a separate, preferably read-only agent run. It reviews only material dimensions:

1. **Requirement coverage** — was every acceptance criterion addressed?
2. **Scope control** — was unrelated or speculative code added?
3. **Correctness** — are there logical errors, missed states, or contradicted behavior?
4. **Verification quality** — do the tests exercise the behavior they claim to prove?
5. **Maintainability** — did the change introduce material complexity, duplication, or coupling?
6. **Architecture fit** — does it violate an applicable repository decision or convention?
7. **Risk** — are security, privacy, reliability, data, or performance concerns relevant to this change?

The reviewer should not produce generic style advice or an exhaustive list of hypothetical improvements.

### 6. Finding resolution

Each finding has one resolution:

- send to builder;
- accept recommendation and defer;
- dismiss with rationale;
- revise requirement;
- request human investigation;
- mark resolved by a later revision and verification run.

ReqLens keeps the finding history so the final state shows what changed and why, not only the last diff.

### 7. Human acceptance

The human reviews unresolved findings and evidence, then accepts the work item, rejects it, or requests changes. Acceptance is attached to the exact reviewed revision.

## Finding contract

Every reviewer finding must contain:

- category;
- severity;
- concise claim;
- affected requirement or review rule;
- code location when applicable;
- supporting evidence;
- confidence;
- proposed next action;
- provenance and reviewer version.

A finding without evidence is an opinion and should not block acceptance.

### Severity

- `required` — a requirement is missing, evidence fails, behavior is incorrect, or a material risk must be resolved.
- `recommended` — a substantiated maintainability or design issue is worth addressing but does not contradict acceptance.
- `optional` — an alternative worth recording but hidden from the default blocking-review view.

## Agent integration shape

The initial Codex integration should use two narrow, versioned workflows rather than one large prompt:

### `reqlens-build`

- loads the active work context;
- keeps implementation constrained to the selected acceptance criteria;
- records material decisions and test evidence;
- runs the builder completion loop;
- submits a structured handoff.

### `reqlens-review`

- opens an immutable evidence snapshot;
- runs in read-only mode where supported;
- evaluates the defined review dimensions;
- emits findings using the finding contract;
- never modifies the implementation directly.

The workflows can be packaged as agent skills. A local ReqLens tool server supplies controlled access to live project data and actions such as:

- `get_work_context`
- `get_evidence_snapshot`
- `record_decision`
- `link_evidence`
- `request_test_run`
- `submit_handoff`
- `submit_finding`
- `resolve_finding`

The skill defines how the agent performs the workflow. The local tool server remains responsible for data access, validation, permissions, execution, and persistence.

## Analysis provenance

ReqLens displays three different kinds of explanation:

- **Captured rationale** — explicitly recorded while the implementation decision was made.
- **Builder explanation** — supplied during handoff by the author of the change.
- **Reviewer inference** — reconstructed later from requirements, code, and evidence.

These labels must remain visible. ReqLens must never turn a plausible reviewer inference into a claim about what a human or agent originally thought.

