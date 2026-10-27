# Product feature map

This document defines the proposed ReqLens product areas, what each feature covers, and what remains outside its boundary. Feature IDs are stable discussion references, not implementation tickets.

## MVP vertical slice

The first releasable experience is:

```text
Install in repository
  -> start local ReqLens service
  -> select feature, work item, and Git worktree
  -> work with Codex
  -> inspect changed code and captured decisions
  -> run configured tests
  -> review requirement coverage and evidence
  -> accept or request changes
```

The MVP should prove this single flow before adding more agents, issue trackers, or organization-level features.

## P0 — First usable product

### RL-F01 — Repository installation and local runtime

**Purpose:** Make ReqLens an installable development tool that runs alongside an existing application repository.

**Covers:**

- Install ReqLens as a project development dependency or run it through a package runner.
- Initialize a small `.reqlens/` configuration inside the target repository.
- Start a local CLI service and browser dashboard from the repository root.
- Bind to `127.0.0.1` by default so the dashboard is not exposed to the network.
- Use a configurable preferred port and automatically select another available port when it is occupied.
- Print and optionally open the final local URL.
- Detect the repository root, current branch, commit, and available Git worktrees.
- Store generated runtime data outside source control by default.

**Does not cover:**

- Copying the ReqLens source code into every application.
- Hosting a public ReqLens server.
- Team accounts, authentication, or remote access in the MVP.
- Claiming that a particular port will always be available.

**MVP outcome:** A developer can enter an existing repository, run one command, and open ReqLens locally without changing the application code.

### RL-F02 — Product model, labels, and traceable requirements

**Purpose:** Give product intent a stable structure that can be connected to implementation evidence.

**Covers:**

- Define product features, requirements, acceptance criteria, and work items.
- Import the initial structure from repository-local Markdown.
- Assign stable IDs that survive wording and file-location changes.
- Apply user-defined labels to features and work items.
- Represent relationships such as dependency, blocker, parent, and related work.
- Define required verification for an acceptance criterion.
- Preserve the original source text and location.
- Mark ambiguous, conflicting, or untestable requirements for review.
- Evaluate whether a ticket preserves the intent of its source requirement before implementation starts.
- Detect missing acceptance criteria, undefined outcomes, and criteria that have no viable verification method.
- Expose a ticket-readiness state without silently rewriting or approving the product definition.

**Does not cover:**

- Replacing a full product-management or issue-tracking system.
- Treating generated requirements as approved without human review.
- Automatically turning every PRD sentence into a ticket.

**MVP outcome:** ReqLens can show a navigable product tree, explain where a ticket came from, assess whether it is ready to implement, and identify exactly which acceptance criteria are in scope.

### RL-F03 — Work item and Git worktree context

**Purpose:** Make every implementation session explicit about what is being built and where it is being built.

**Covers:**

- Discover Git worktrees, branches, and their current revisions.
- Associate one active work item with a worktree and implementation session.
- Record the base revision from which the work started.
- Show the active feature, requirement, ticket, branch, and worktree together.
- Keep concurrent worktrees and their evidence separate.
- Allow a developer to pause, resume, or close the work context.
- Detect commits or file changes that occurred outside the declared work context.
- Attribute commits to their Git authors without assuming that the author was an AI agent.

**Does not cover:**

- Creating or deleting worktrees automatically in the first version.
- Assuming that a branch name reliably identifies a requirement.
- Taking control of the user's Git workflow.

**MVP outcome:** ReqLens can answer, “What ticket is this worktree implementing, and what changed since that work began?”

### RL-F04 — Codex bridge and execution capture

**Purpose:** Connect the user's existing local coding agent to ReqLens without turning ReqLens into another general-purpose coding agent.

**Covers:**

- Provide a ReqLens skill, adapter, or local tool protocol that Codex can use.
- Use the user's existing local Codex configuration and permissions rather than storing copied credentials.
- Register the work item and acceptance criteria given to the agent.
- Capture observable events such as file access, edits, commands, test executions, failures, and explicit decision notes when available.
- Normalize captured events into an agent-independent format.
- Record which agent and model produced a result when that information is available.
- Support an explicit agent-produced implementation summary at handoff.
- Treat agent capture as additional provenance, not as a prerequisite for reviewing a Git change.
- Provide separate, versioned build and review workflows instead of asking one ongoing agent conversation to implement and approve its own work.

**Does not cover:**

- Accessing or displaying private hidden chain-of-thought.
- Presenting retrospective explanations as the agent's original reasoning.
- Capturing unrelated activity elsewhere on the computer.
- Supporting every coding agent in the first release.

**MVP outcome:** One Codex implementation session produces a local, ordered, inspectable evidence trail linked to its work item.

### RL-F05 — Code-change and intent traceability

**Purpose:** Explain how implementation changes relate to product requirements.

**Covers:**

- Calculate changes from the recorded base revision.
- Analyze changes produced by humans, agents, or a mixture of both.
- Index changed files, hunks, and supported language symbols such as functions or classes.
- Link changes to requirements, acceptance criteria, agent events, and tests.
- Distinguish relationships that were observed, declared, inferred, or human-confirmed.
- Detect changed code with no declared requirement relationship.
- Detect acceptance criteria with no linked implementation evidence.
- Navigate in both directions: requirement to code and code to requirement.
- Preserve links against a specific Git revision so that evidence cannot silently move.

**Does not cover:**

- Claiming that every individual line has one definitive reason.
- Treating an AI-generated explanation as historical fact.
- Performing complete semantic analysis for every programming language in the MVP.

**MVP outcome:** Selecting a changed function shows what requirement it supports, how that relationship was established, and which evidence is available.

### RL-F06 — Test plans and controlled verification

**Purpose:** Turn testing requirements into executable, inspectable evidence.

**Covers:**

- Attach required checks to an acceptance criterion.
- Support named test profiles such as unit, integration, API, database, and end-to-end.
- Configure commands, working directories, timeouts, and permitted environment references.
- Let the user or agent propose an additional test for review.
- Execute approved test commands locally and stream their progress to the dashboard.
- Record the exact Git revision, command, timestamps, exit status, relevant output, and produced artifacts.
- Re-run a test and compare results.
- Link each test result to the requirement it verifies.
- Allow real API or database tests through an explicitly configured environment profile.
- Redact secrets and store references to credentials rather than credential values.

**Does not cover:**

- Running arbitrary model-generated shell commands without the user's configured permissions.
- Treating a passing test as proof that the entire product requirement is correct.
- Connecting to production databases by default.
- Replacing the project's existing test runner or CI system.

**MVP outcome:** A reviewer can request an approved integration test, watch it execute, and inspect reproducible evidence tied to the relevant acceptance criterion.

### RL-F07 — Agent-assisted implementation analysis

**Purpose:** Help a reviewer understand implementation choices and find requirement gaps without obscuring uncertainty.

**Covers:**

- Ask the configured local agent to analyze a diff, function, or selected line range.
- Analyze human-authored changes even when no agent execution trace exists.
- Explain what behavior changed and which acceptance criterion it appears to support.
- Compare the implementation with the active requirement and required tests.
- Identify potential missing cases, scope drift, risks, and alternative approaches.
- Generate findings with severity, evidence links, and a proposed next action.
- Show the model, analysis version, input scope, and time of evaluation.
- Keep agent conclusions separate from deterministic verification results.
- Prefer function- and hunk-level analysis, with line-level analysis available on demand.
- Run review in a fresh, read-only task context and return structured findings rather than modifying code immediately.
- Suppress generic refactoring suggestions unless they are tied to a requirement, repository rule, or material engineering risk.

**Does not cover:**

- Automatically analysing and narrating every line when that adds noise but no review value.
- Guaranteeing correctness, security, performance, or requirement completeness.
- Hiding the fact that a conclusion was model-generated.
- Describing a retrospective inference as the original human author's rationale.

**MVP outcome:** A user can select one changed function and receive an evidence-linked analysis that can be confirmed, rejected, or turned into follow-up work.

The detailed behavior is defined in [the build and review protocol](review-protocol.md).

### RL-F08 — Local review dashboard

**Purpose:** Provide one visual surface for product intent, implementation, tests, and review decisions.

**Covers:**

- A current-work view showing repository, worktree, branch, ticket, base revision, and agent status.
- A feature and work-item view showing requirements, acceptance criteria, coverage state, and findings.
- An acceptance-chain view connecting feature, source requirement, ticket, implementation, verification, and final decision.
- A change explorer showing the diff, changed symbols, linked requirements, and evidence provenance.
- A live verification view showing running and completed tests with logs and artifacts.
- An agent timeline showing observable actions, failures, decisions, and handoff information.
- Filters for missing evidence, unverified changes, failed tests, and inferred links.
- Deep links between every coverage claim and its supporting evidence.

**Does not cover:**

- A general IDE or code editor.
- A replacement for GitHub pull-request review.
- Remote collaboration in the first version.

**MVP outcome:** The complete product-to-implementation story for one ticket can be evaluated without switching between the PRD, ticket, terminal history, agent conversation, diff, and test logs.

### RL-F09 — Human review, decisions, and handoff

**Purpose:** Keep accountability with the reviewer and turn findings into an explicit product decision.

**Covers:**

- Confirm or reject inferred requirement-to-code links.
- Annotate a function, diff hunk, test result, or acceptance criterion.
- Mark an acceptance criterion as accepted, rejected, or requiring changes.
- Create a follow-up item from a finding or uncovered requirement.
- Record who made the decision and against which revision.
- Generate a local Markdown or JSON evidence report for the completed work item.

**Does not cover:**

- Automatically approving or merging code.
- Replacing organizational approval policies.
- Treating lack of findings as proof of correctness.

**MVP outcome:** The work item ends with a human-owned decision and a portable summary of the evidence behind it.

## P1 — Useful integrations after the vertical slice

### RL-F10 — GitHub and Linear synchronization

- Import issues and acceptance criteria without making the external tracker the internal source of truth.
- Link commits and pull requests to ReqLens work items.
- Publish a concise evidence summary back to an issue or pull request only when the user requests it.
- Preserve local operation when integrations are disconnected.

### RL-F11 — CI evidence ingestion

- Import test, build, lint, coverage, and security results from CI.
- Match CI results to the exact commit and acceptance criteria.
- Compare local verification with remote CI evidence.
- Detect stale evidence after the implementation changes.

### RL-F12 — Additional coding-agent adapters

- Add adapters for agents such as Claude Code and Cursor.
- Reuse the same normalized event and evidence model.
- Make capture capability differences visible rather than pretending that every adapter provides identical data.

### RL-F16 — Visual acceptance runs

**Purpose:** Record the implemented product behavior at a specific pull-request revision and make it reviewable as requirement-linked evidence.

**Covers:**

- Define an approved user journey from acceptance criteria.
- Start the application in an isolated local or preview environment.
- Let an agent or deterministic test driver operate a browser and, later, a mobile simulator.
- Record the real interface while the scenario executes.
- Capture step timestamps, screenshots, assertions, logs, and environment metadata alongside the video.
- Link video segments and results to acceptance criteria.
- Run manually from ReqLens Studio and, later, as a background pull-request job.
- Keep artifacts local until the user explicitly publishes them.

**Does not cover:**

- Generating a synthetic video that only appears to demonstrate success.
- Treating pixels as proof of invisible backend behavior.
- Replacing automated tests or human acceptance.
- Running against production or publishing sensitive recordings by default.

**First outcome:** A reviewer can open one ticket, watch a real browser journey from the reviewed commit, jump to the step for each acceptance criterion, and inspect the assertions and logs behind the result.

See [visual acceptance runs](visual-acceptance.md) for the complete workflow and safety boundaries.

## P2 — Team and governance capabilities

### RL-F13 — Shared evidence bundles

- Export a redacted, content-addressed evidence bundle.
- Let another reviewer reproduce or inspect a completed run.
- Verify that evidence has not changed since export.

### RL-F14 — Regression and evaluation suites

- Save requirement-level evaluation scenarios.
- Re-run them after later code or model changes.
- Compare evidence quality, failures, cost, and duration over time.

### RL-F15 — Team policies and portfolio reporting

- Define shared evidence requirements and review policies.
- Report coverage and review status across repositories.
- Add accounts, permissions, and retention controls only when a real multi-user need has been validated.

## Product boundary

ReqLens covers:

- structuring product intent inside a repository;
- declaring the active feature and work item for a Git worktree;
- capturing observable coding-agent activity;
- analyzing Git changes even when no agent activity was captured;
- tracing implementation changes back to requirements;
- defining and executing controlled verification;
- displaying evidence and uncertainty visually;
- recording a human review decision.

ReqLens does not cover:

- writing the application as a replacement for Codex or another coding agent;
- replacing Git, an IDE, CI, GitHub, Linear, or the project's test framework;
- exposing private model reasoning;
- certifying that software is correct or safe;
- silently executing destructive tests or using production credentials;
- making product or merge decisions without a human owner.

