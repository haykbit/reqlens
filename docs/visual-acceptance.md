# Visual acceptance runs

Visual acceptance turns an implemented ticket into a recorded, inspectable product journey. It is designed to help product, engineering, and QA review what a pull request actually does without requiring every reviewer to configure and run the branch locally.

The output is provisionally called an **Acceptance Replay**.

## Product promise

> Run the implemented feature against its acceptance criteria, record the real interface, and connect each visible step to executable evidence.

ReqLens does not generate a synthetic video that merely looks like the feature works. It records an actual execution of the application at a specific Git revision.

## Trigger

A visual acceptance run can eventually be started in two ways:

- manually from ReqLens Studio for the current worktree;
- automatically for an eligible pull request through a configured CI workflow.

Automatic execution is opt-in. A repository defines which pull requests, labels, branches, or commands can trigger it.

## Required inputs

Before a run can start, ReqLens needs:

- the exact commit or pull-request revision;
- an approved acceptance scenario linked to one or more acceptance criteria;
- a configured application start or preview command;
- a readiness check or target URL;
- a browser or simulator profile;
- an isolated test-data and credential profile;
- explicit permission for any external API or database access.

The agent may propose a scenario from the ticket, but generated scenarios remain drafts until approved or matched to an existing trusted test.

## Execution flow

```text
Pull request revision
  -> prepare isolated environment
  -> start application
  -> open browser or mobile simulator
  -> execute approved acceptance scenario
  -> capture video, steps, assertions, logs, and screenshots
  -> link time ranges to acceptance criteria
  -> publish an Acceptance Replay artifact
```

## Acceptance scenario

An acceptance scenario is a structured product journey, not a free-form prompt. Each step contains:

- action;
- expected visible result;
- optional deterministic assertion;
- related acceptance criterion;
- capture policy;
- test-data requirements.

Example:

```text
Scenario: lock an account after five invalid sign-in attempts

1. Open the sign-in screen.
2. Submit an invalid password five times.
3. Assert that the account-locked message is visible.
4. Submit the valid password.
5. Assert that access is still rejected during the lock period.
```

## Recorded evidence

An Acceptance Replay contains more than a video:

- commit SHA and pull-request reference;
- scenario and scenario version;
- related requirements and acceptance criteria;
- environment, browser, viewport, device, or simulator profile;
- step-by-step timeline;
- video and selected screenshots;
- deterministic assertions and their results;
- relevant browser console, application, network, and test-run logs;
- duration, timestamps, and final status;
- redaction report;
- agent-generated summary clearly labeled as an interpretation.

Every visible step can be linked to a timestamp in the video. Every pass or fail claim must point to an assertion or an explicit human observation.

## Role of the agent

The agent can:

- propose acceptance scenarios from approved criteria;
- identify which existing tests can drive a visual run;
- operate the configured browser or simulator;
- annotate the timeline;
- summarize what happened;
- identify visible differences between expected and actual behavior;
- suggest additional cases when evidence is incomplete.

The agent cannot turn appearance alone into proof of backend behavior. For example, a success message does not prove that a database record was written unless an approved assertion verifies it.

## Background execution

Visual runs execute as background jobs with observable states:

- queued;
- preparing environment;
- starting application;
- running scenario;
- collecting evidence;
- redacting artifacts;
- completed;
- failed;
- awaiting approval.

ReqLens Studio shows live progress and makes partial logs available when a run fails.

## Privacy and safety

- Use isolated local, test, or preview environments by default.
- Never connect to production unless a future policy explicitly supports and authorizes it.
- Store credential references, not secret values.
- Redact tokens, personal data, and configured screen regions before an artifact is shared.
- Keep raw artifacts local unless the user explicitly publishes them.
- Make retention configurable because videos and logs can be large or sensitive.
- Require confirmation before executing scenarios that mutate shared data or call paid external services.

## Product boundaries

Visual acceptance does not:

- replace deterministic tests;
- prove invisible backend state from pixels alone;
- generate marketing demos;
- publish videos automatically without repository policy;
- invent a successful run when the application or environment fails;
- make a ticket acceptable when required non-visual evidence is missing.

## First vertical slice

The first version should remain intentionally narrow:

- local web applications only;
- one configured application start command;
- one browser profile;
- one approved acceptance scenario;
- one recorded video with step timestamps;
- deterministic UI assertions;
- local artifact storage;
- review inside ReqLens Studio.

Mobile simulators, CI-triggered pull-request runs, narration, cloud artifact storage, and publication back to GitHub should follow after the local web flow is reliable.

