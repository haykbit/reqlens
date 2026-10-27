# Pull-request previews

ReqLens PR Preview creates an isolated, interactive environment for a pull-request revision and opens it from ReqLens Studio. Its baseline mode runs entirely on the developer's computer and requires no ReqLens hosting account.

## Product promise

> Open the exact application revision under review without changing the developer's current checkout or deploying it to production.

The local preview is free in the sense that ReqLens does not require paid hosting. It still consumes the user's own compute, storage, network, external services, and any provider resources configured by the application.

## Relationship to Acceptance Replay

A PR Preview is an interactive running environment. An Acceptance Replay is recorded evidence produced by executing an approved scenario against that environment.

```text
Pull request
  -> isolated PR Preview
    -> manual product exploration
    -> configured tests
    -> visual Acceptance Replay
    -> ticket acceptance evidence
```

The preview can be useful on its own, but it becomes more valuable when its activity and results are connected to the ticket and acceptance criteria.

## Local preview flow

1. The user selects or enters a pull-request number or URL.
2. ReqLens resolves the exact source revision without changing the current worktree.
3. ReqLens creates a dedicated, disposable Git worktree.
4. It loads the repository's approved preview profile.
5. It restores or installs dependencies using safe, content-addressed caches where possible.
6. It starts the required application services.
7. It waits for configured readiness checks.
8. It assigns available loopback ports and displays the final URLs.
9. ReqLens Studio offers actions to open, test, record, restart, inspect logs, or stop the preview.
10. When stopped, runtime processes are terminated and the disposable worktree can be removed according to retention policy.

## Preview profile

A repository owns its preview definition. The profile can describe:

- application start command;
- working directory;
- dependency preparation command;
- readiness URL or command;
- preferred and internal ports;
- public browser entry point;
- optional supporting services;
- environment-variable references;
- test-data seed and cleanup commands;
- timeouts and resource limits;
- permitted network destinations;
- artifact and log retention.

Secrets are supplied by the environment or credential provider. They are referenced by name and are not copied into ReqLens configuration or evidence.

## Studio experience

The PR page in ReqLens Studio shows:

- PR, branch, source commit, and base commit;
- linked feature, requirement, ticket, and acceptance criteria;
- preview lifecycle state;
- allocated local URLs;
- service health and resource usage;
- build and application logs;
- changed files and detected migrations;
- available test and visual-acceptance actions;
- last successful preview revision;
- cleanup and retention state.

Preview lifecycle states include:

- queued;
- fetching revision;
- creating worktree;
- preparing dependencies;
- starting services;
- waiting for readiness;
- ready;
- degraded;
- failed;
- stopping;
- stopped.

## Multiple previews

ReqLens may run several previews when the host has enough resources. Each preview receives:

- a unique worktree;
- an isolated runtime identity;
- non-conflicting host ports;
- separate logs and artifacts;
- its own test-data namespace when supported.

Resource limits and a maximum number of concurrent previews protect the developer's machine.

## Trust and security boundary

Opening a preview executes code from the pull request. Build scripts, dependency installers, application startup, migrations, and tests can all perform harmful actions.

The safe default is:

- do not automatically execute code from forked or untrusted pull requests;
- require explicit approval before the first run of a revision;
- provide no production credentials;
- bind application ports to the loopback interface;
- use a restricted environment and network policy where the host supports it;
- show every command from the approved profile before execution;
- require confirmation for migrations, destructive seeds, or external paid services;
- invalidate approval when the source commit changes;
- keep secrets out of logs, recordings, and exported evidence.

A future sandbox can strengthen these boundaries, but ReqLens must never describe local execution of arbitrary PR code as risk-free.

## Three delivery modes

### 1. Local interactive preview

- Runs on the developer's machine.
- Requires no ReqLens cloud service.
- Is available only on the local computer by default.
- Is the first implementation target.

### 2. CI evidence run

- Runs configured tests and Acceptance Replays in CI.
- Produces logs, screenshots, video, and an evidence report.
- Does not necessarily keep an interactive application URL alive after the job completes.
- Uses the repository owner's CI allowance or self-hosted runner.

### 3. Shareable provider preview

- Delegates deployment to an optional hosting adapter.
- Returns a URL that authorized reviewers can open remotely.
- Uses the user's provider account, access policy, quotas, and billing.
- Must show whether the URL is public and provide an explicit cleanup action.

ReqLens should not market the third mode as universally free. Provider plans, application architecture, data services, and build volume determine its cost.

## Product boundaries

PR Preview does not:

- provide permanent application hosting;
- guarantee that an arbitrary project can run without configuration;
- expose a local port publicly by default;
- supply databases or third-party APIs for free;
- bypass the application's own authentication;
- execute untrusted fork code automatically;
- prove that preview behavior is identical to production.

## First vertical slice

The first version supports:

- a trusted PR from the same repository;
- one web application;
- one approved preview profile;
- one disposable Git worktree;
- automatic local-port allocation;
- readiness detection;
- live build and application logs;
- open, restart, stop, and clean-up actions;
- launching an Acceptance Replay against the ready preview.

Databases, multi-service applications, containers, mobile simulators, CI execution, tunnels, and hosting providers follow after this local flow is reliable.

