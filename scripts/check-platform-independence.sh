#!/usr/bin/env bash
# Fails if the repo references Lovable or Replit (tooling, hosting, icons, env vars).
# Allowed: docs that document the removal (see ALLOW below).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
PATTERN='lovable|replit|gpt-?engineer|repl\.co|repl\.it'
ALLOW=(
  ':!scripts/check-platform-independence.sh'
  ':!.github/workflows/platform-independence.yml'
  ':!docs/INDEPENDENT-HOSTING.md'
  ':!docs/archive/**'
)
hits=$(git grep -n -i -I -E "$PATTERN" -- . "${ALLOW[@]}" || true)
# Lovable template icon (heart favicon) and template placeholder
bad_files=""
while IFS= read -r f; do
  [ -f "$f" ] || continue
  sum=$(sha256sum "$f" | cut -c1-64)
  case "$f" in
    */favicon.ico) [ "$(md5sum "$f" | cut -c1-8)" = "9f504444" ] && bad_files+="$f (Lovable template favicon)"$'\n' ;;
    */placeholder.svg) [ "$(md5sum "$f" | cut -c1-8)" = "35707bd9" ] && bad_files+="$f (Lovable template placeholder)"$'\n' ;;
  esac
done < <(git ls-files | grep -E '(favicon\.ico|placeholder\.svg)$' || true)
for f in .replit replit.md .lovable; do git ls-files --error-unmatch "$f" >/dev/null 2>&1 && bad_files+="$f (platform file)"$'\n'; done
if [ -n "$hits$bad_files" ]; then
  echo "Platform independence check failed:" >&2
  [ -n "$hits" ] && echo "$hits" >&2
  [ -n "$bad_files" ] && printf '%s' "$bad_files" >&2
  exit 1
fi
echo "Platform independence check passed."
