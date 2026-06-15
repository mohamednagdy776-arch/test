#!/usr/bin/env bash
# Runs Claude Code headless against the auto-fix prompt. Invoked by the
# auto-fix workflow as an UNPRIVILEGED user (Claude Code refuses
# --dangerously-skip-permissions when running as root).
set -uo pipefail
export HOME="${HOME:-/tmp}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
claude --dangerously-skip-permissions --output-format text -p "$(cat "$DIR/auto-fix-prompt.md")"
