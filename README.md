# ReqLens

**See how requirements become code.**

ReqLens is a local-first traceability and evaluation layer for AI-assisted software delivery. It connects product requirements to human or agent-authored implementation changes, tests, captured decisions, and review evidence so teams can understand what was built, what is known about why it was built, and whether it satisfies the original intent.

> ReqLens is at the product-definition stage. This repository currently describes the problem, the planned MVP, and the core domain model. It does not yet contain a working implementation.

## The problem

AI coding agents can move from a ticket to working code in minutes. Reviewing the resulting diff still leaves important questions unanswered:

- Which requirement does this change satisfy?
- Where is each acceptance criterion implemented?
- What evidence shows that the implementation works?
- Why did the agent choose this approach?
- Did the implementation drift beyond the requested scope?
- Which conclusions come from deterministic checks, and which come from another model?

Code review tools inspect code. Agent observability tools inspect execution. ReqLens focuses on the missing connection between **product intent, implementation, and evidence**.

## The core idea

ReqLens builds an evidence trail across the delivery workflow:

```text
PRD
 └─ Requirement
     └─ Acceptance criterion
         └─ Work item
             └─ Agent run
                 ├─ Decision
                 ├─ Code change
                 ├─ Test
                 └─ Verification result
```

This should make it possible to start from either side:

- Select a requirement and inspect the code, tests, and evidence that support it.
- Select a function or changed line and understand which requirement led to it.

## Planned MVP

The first useful version will cover one complete workflow:

1. Import a Markdown PRD containing requirements and acceptance criteria.
2. Turn those requirements into stable, traceable entities.
3. Capture one coding-agent run locally.
4. Link changed files, decisions, commands, and tests to the active requirement.
5. Run deterministic verification such as tests, linting, and type checks.
6. Show the result in a local dashboard.

The dashboard will initially provide three views:

- **Requirement coverage** — what is covered, partial, missing, or unverified.
- **Execution timeline** — what the agent read, decided, changed, and validated.
- **Evidence-aware diff** — why a change exists and what supports it.

See [the product feature map](docs/features.md) for the planned capabilities, [the product definition](docs/product.md) for the initial scope, and [the domain model](docs/domain-model.md) for the proposed concepts.

## Product principles

### Evidence over assertions

ReqLens should not report that a requirement is complete merely because a model says so. Every conclusion must point to inspectable evidence.

### Capture provenance during execution

Rationale reconstructed after implementation can be plausible but false. ReqLens should capture context, decisions, and actions while the work is happening.

### Deterministic checks first

Tests, type checking, linting, and other reproducible signals should remain clearly separated from semantic model-based evaluation.

### Local-first by default

Source code, prompts, and execution traces can be sensitive. The first version should store and process them locally unless the user explicitly enables an external provider.

### Agent-agnostic architecture

ReqLens is not another coding agent. It should integrate with existing agents through adapters and a small common event model.

### Humans remain accountable

Automated evaluation provides evidence and recommendations. A human decides whether the requirement is accepted.

## What ReqLens is not

- A replacement for GitHub, Linear, or another issue tracker.
- A new general-purpose coding agent.
- A substitute for CI, automated tests, or human review.
- A promise that model-generated explanations are ground truth.

## Example output

| Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- |
| `AUTH-01` Users can sign in with email | `src/auth/login.ts` | 4 passing tests | Covered |
| `AUTH-02` Lock after five failed attempts | `src/auth/rate-limit.ts` | No boundary test | Partial |
| `AUTH-03` Record successful and failed attempts | No linked change | No evidence | Missing |

## Current status

ReqLens is being developed in public. The immediate goal is to validate the requirement-to-evidence workflow with one real feature before expanding integrations or building a broader platform.

## Contributing

The project is still defining its first vertical slice. Ideas, use cases, and examples of difficult AI-generated pull requests are welcome through GitHub Issues.

