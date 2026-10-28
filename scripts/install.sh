#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_dir=$(dirname "$script_dir")
cd "$project_dir"

for command in node npm uv git; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'ReqLens requires %s, but it was not found.\n' "$command" >&2
    exit 1
  fi
done

npm ci
uv sync --directory apps/api
npm run build
uv tool install --editable apps/api --force

bin_dir=$(uv tool dir --bin)
"$bin_dir/reqlens" doctor

printf '\nReqLens is ready.\n'
printf 'Run: %s/reqlens serve --open\n' "$bin_dir"
if ! command -v reqlens >/dev/null 2>&1; then
  printf 'Add %s to PATH to use the shorter reqlens command.\n' "$bin_dir"
fi
