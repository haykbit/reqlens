import argparse
import json
import os
from pathlib import Path
import shutil
import socket
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import webbrowser

import uvicorn

from . import __version__
from .runtime import create_app, default_data_dir, default_web_dir


def _json_input(path: str) -> dict[str, Any]:
    content = sys.stdin.read() if path == "-" else Path(path).read_text(encoding="utf-8")
    value = json.loads(content)
    if not isinstance(value, dict):
        raise ValueError("Input JSON must be an object")
    return value


def _base_urls() -> list[str]:
    configured = os.environ.get("REQLENS_API_URL")
    if configured:
        return [configured.rstrip("/")]
    return ["http://127.0.0.1:7331", "http://127.0.0.1:7332"]


def _service_url() -> str:
    configured = os.environ.get("REQLENS_API_URL")
    if configured:
        return configured.rstrip("/")
    last_error: Exception | None = None
    for base_url in _base_urls():
        try:
            with urlopen(f"{base_url}/api/health", timeout=2) as response:
                payload = json.loads(response.read())
                if isinstance(payload, dict) and payload.get("status") == "ok":
                    return base_url
        except (HTTPError, URLError, json.JSONDecodeError) as error:
            last_error = error
    urls = ", ".join(_base_urls())
    reason = getattr(last_error, "reason", last_error or "unknown error")
    raise RuntimeError(f"ReqLens is unavailable at {urls}: {reason}")


def _request(method: str, endpoint: str, payload: dict[str, Any] | None = None) -> Any:
    data = json.dumps(payload).encode() if payload is not None else None
    request = Request(
        f"{_service_url()}{endpoint}",
        data=data,
        method=method,
        headers={"Content-Type": "application/json"} if data else {},
    )
    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read())
    except HTTPError as error:
        body = error.read().decode(errors="replace")
        raise RuntimeError(f"ReqLens returned {error.code}: {body}") from error
    except URLError as error:
        raise RuntimeError(f"ReqLens is unavailable: {error.reason}") from error


def _available_port(host: str, preferred: int) -> int:
    for port in range(preferred, preferred + 20):
        with socket.socket() as candidate:
            try:
                candidate.bind((host, port))
            except OSError:
                continue
            return port
    raise RuntimeError(f"No available port found between {preferred} and {preferred + 19}")


def _serve(host: str, preferred_port: int, open_browser: bool) -> None:
    studio = default_web_dir()
    if not (studio / "index.html").is_file():
        raise RuntimeError("Studio build not found. Run `npm run build` in the ReqLens checkout.")
    port = _available_port(host, preferred_port)
    url = f"http://{host}:{port}"
    print(f"ReqLens Studio: {url}")
    print(f"Data: {default_data_dir()}")
    if open_browser:
        webbrowser.open(url)
    uvicorn.run(create_app(web_dir=studio), host=host, port=port, log_level="info")


def _doctor() -> dict[str, Any]:
    studio = default_web_dir()
    data_dir = default_data_dir()
    writable_parent = data_dir
    while not writable_parent.exists() and writable_parent != writable_parent.parent:
        writable_parent = writable_parent.parent
    checks = {
        "git": shutil.which("git") is not None,
        "studio_build": (studio / "index.html").is_file(),
        "data_location_writable": os.access(writable_parent, os.W_OK),
    }
    return {
        "version": __version__,
        "ready": all(checks.values()),
        "checks": checks,
        "studio": str(studio),
        "data": str(data_dir),
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="reqlens",
        description="Connect product requirements to real repository evidence",
    )
    parser.add_argument("--version", action="version", version=f"ReqLens {__version__}")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("doctor", help="Check the local installation")
    commands.add_parser("health", help="Check the running ReqLens service")
    commands.add_parser("list", help="List tracked reviews")

    serve = commands.add_parser("serve", help="Start ReqLens Studio")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=7331)
    serve.add_argument("--open", action="store_true", dest="open_browser")

    start = commands.add_parser("start", help="Start or refresh a review from a normalized ticket")
    start.add_argument("--project", required=True, help="Path inside the target Git repository")
    start.add_argument("--ticket", required=True, help="Ticket JSON file, or - for stdin")
    start.add_argument("--base-revision", help="Git base revision; defaults to the current HEAD")

    sync = commands.add_parser("sync", help="Sync Git and optional agent evidence")
    sync.add_argument("review_id")
    sync.add_argument("--evidence", help="Evidence JSON file, or - for stdin")

    show = commands.add_parser("show", help="Return a complete review dashboard as JSON")
    show.add_argument("review_id")
    return parser


def _summary(command: str, result: Any) -> Any:
    if not isinstance(result, dict):
        return result
    if command == "start" and isinstance(result.get("dashboard"), dict):
        dashboard = result["dashboard"]
        return {
            "review_id": result.get("review_id"),
            "created": result.get("created"),
            "status": dashboard.get("status"),
            "project": dashboard.get("project"),
        }
    if command == "sync":
        project = result.get("project")
        return {
            "review_id": project.get("review_id") if isinstance(project, dict) else None,
            "status": result.get("status"),
            "project": project,
            "summary": result.get("summary"),
        }
    return result


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    try:
        if args.command == "serve":
            _serve(args.host, args.port, args.open_browser)
            return
        if args.command == "doctor":
            result = _doctor()
        elif args.command == "health":
            result = _request("GET", "/api/health")
        elif args.command == "list":
            result = _request("GET", "/api/workspace")
        elif args.command == "show":
            result = _request("GET", f"/api/reviews/{args.review_id}")
        elif args.command == "start":
            payload: dict[str, Any] = {
                "project_path": str(Path(args.project).expanduser().resolve()),
                "ticket": _json_input(args.ticket),
            }
            if args.base_revision:
                payload["base_revision"] = args.base_revision
            result = _request("POST", "/api/reviews/start", payload)
        else:
            payload = _json_input(args.evidence) if args.evidence else {}
            result = _request("POST", f"/api/reviews/{args.review_id}/sync", payload)
        print(json.dumps(_summary(args.command, result), ensure_ascii=False, indent=2))
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        parser.exit(1, f"reqlens: {error}\n")


if __name__ == "__main__":
    main()
