# Installation and first run

ReqLens currently ships as a source installation. The installer builds Studio and installs the Python CLI as an editable `uv` tool, so code and CLI remain on the same version.

## Requirements

- Git
- Node.js 22 or later
- npm
- uv

The installer checks all four commands before changing the installation.

## Install

```bash
git clone https://github.com/haykbit/reqlens.git
cd reqlens
./scripts/install.sh
```

The installer performs four steps:

1. installs the locked frontend dependencies with `npm ci`;
2. synchronizes the Python environment with `uv sync`;
3. creates the production Studio build;
4. installs the `reqlens` CLI with `uv tool install --editable`.

Validate the result:

```bash
reqlens doctor
```

`ready: true` means Git is available, the Studio build exists, and the data location is accessible.

## Start and stop

```bash
reqlens serve --open
```

ReqLens binds to `127.0.0.1` and prefers port `7331`. If that port is occupied it checks the next nineteen ports and prints the selected URL. Omit `--open` when an agent or another process will open the URL.

The server runs in the foreground. Stop it with `Ctrl-C`.

Advanced options:

```bash
reqlens serve --host 127.0.0.1 --port 7400
```

Binding to a non-loopback host can expose source-code evidence to the network and is not recommended.

## Upgrade

```bash
cd reqlens
git pull --ff-only
./scripts/install.sh
```

The local review database is not stored in the Git checkout for new installations and is not replaced by an upgrade.

## Data locations

ReqLens uses these defaults:

- macOS: `~/Library/Application Support/ReqLens`
- Linux: `$XDG_DATA_HOME/reqlens` or `~/.local/share/reqlens`
- Windows: `%LOCALAPPDATA%\ReqLens`

Set `REQLENS_DATA_DIR` to override the location. Development checkouts created before `0.3.0` continue using `.reqlens/data` when that database already exists.

## Development mode

```bash
npm ci
uv sync --directory apps/api
npm run dev
```

Development mode uses Vite on port `7331` and FastAPI on port `7332`. Installed mode serves both Studio and agent endpoints from the port selected by `reqlens serve`.

## Troubleshooting

### `reqlens: command not found`

Run `./scripts/install.sh` again and ensure the uv tool bin directory is on `PATH`. `uv tool dir --bin` prints that directory.

### Studio build not found

Run `npm run build` in the ReqLens checkout or rerun the installer.

### The preferred port is occupied

Use the URL printed by `reqlens serve`. The server automatically selects a nearby free port.

### The CLI cannot find the service

Run `reqlens health`. By default the CLI tries `127.0.0.1:7331` and the development API at `127.0.0.1:7332`. For another port:

```bash
export REQLENS_API_URL=http://127.0.0.1:7400
reqlens health
```

### A tracked repository moved or was deleted

ReqLens keeps the review record but cannot refresh Git evidence until the repository exists at its recorded path. Starting the ticket again from its new repository path creates a separate review identity.
