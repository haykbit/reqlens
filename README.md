# ReqLens

**See how requirements become code.**

ReqLens is a local-first, evidence-based acceptance layer between product and engineering. It connects product requirements and tickets to human or agent-authored implementation changes, tests, captured decisions, and review evidence so teams can determine whether the requested product outcome was actually delivered.

> ReqLens now includes a working local alpha: a typed acceptance-review API and a bilingual Studio that demonstrates the complete requirement-to-evidence workflow.

## Run the alpha

ReqLens uses React 19, TypeScript, Tailwind CSS, and shadcn-style primitives in the frontend, with a fully typed FastAPI/Pydantic API behind it.

Prerequisites: Node.js 22+ and [uv](https://docs.astral.sh/uv/).

```bash
npm install
uv sync --directory apps/api
npm run dev
```

Open [http://127.0.0.1:7331](http://127.0.0.1:7331). The web app proxies its typed API calls to FastAPI on port `7332`.

The current vertical slice is intentionally seeded with one realistic acceptance case (`ENG-284`). It lets you:

- trace a feature through its requirement, ticket, pull request, and revision;
- inspect acceptance criteria and their linked implementation evidence;
- review changed files with product rationale and requirement coverage;
- separate deterministic test results from missing evidence;
- replay a recorded product journey step by step;
- switch every primary product surface between English and Spanish.

Actions such as running acceptance or preparing a preview currently exercise the real typed API and UI state, but do not execute arbitrary repository commands yet. That execution boundary is the next implementation milestone.

## The problem

AI coding agents can move from a ticket to working code in minutes. Reviewing the resulting diff still leaves important questions unanswered:

- Which requirement does this change satisfy?
- Where is each acceptance criterion implemented?
- What evidence shows that the implementation works?
- Why did the agent choose this approach?
- Did the implementation drift beyond the requested scope?
- Which conclusions come from deterministic checks, and which come from another model?

Code review tools inspect code. Agent observability tools inspect execution. ReqLens focuses on the missing connection between **product intent, implementation, and evidence**.

The primary ReqLens question is not “Is this code elegant?” It is:

> Did this ticket correctly implement the product requirement it came from, and what evidence supports that conclusion?

Technical analysis is part of the answer when correctness, risk, maintainability, or architecture affects acceptance. It is not the product's final purpose.

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

ReqLens also evaluates the chain before implementation begins. If a ticket is ambiguous, contradicts its source requirement, lacks acceptance criteria, or cannot be verified, that gap should be visible before an agent or developer writes code.

## MVP direction

The first useful version will cover one complete workflow:

1. Import a Markdown PRD containing requirements and acceptance criteria.
2. Turn those requirements into stable, traceable entities.
3. Capture one coding-agent run locally.
4. Link changed files, decisions, commands, and tests to the active requirement.
5. Run deterministic verification such as tests, linting, and type checks.
6. Show the result in a local dashboard.

The current Studio provides five views:

- **Overview** — the acceptance chain, criteria, findings, and evidence status.
- **Changes** — an evidence-aware diff showing why each change exists.
- **Tests** — deterministic results, commands, assertions, and blocked profiles.
- **Replay** — a recorded product journey tied to the reviewed revision.
- **Activity** — product, agent, Git, test, and review events in one timeline.

See [the product feature map](docs/features.md) for the planned capabilities, [the build and review protocol](docs/review-protocol.md) for the builder/reviewer workflow, [pull-request previews](docs/pr-preview.md) for isolated local application environments, [visual acceptance runs](docs/visual-acceptance.md) for recorded product evidence, [the product definition](docs/product.md) for the initial scope, and [the domain model](docs/domain-model.md) for the proposed concepts.

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

ReqLens is being developed in public. Version `0.1.0` validates the requirement-to-evidence workflow with a realistic local demo. The next goal is to replace fixture evidence with repository ingestion, Git diff collection, safe command profiles, and captured browser runs.

## Contributing

The project is still defining its first vertical slice. Ideas, use cases, and examples of difficult AI-generated pull requests are welcome through GitHub Issues.

