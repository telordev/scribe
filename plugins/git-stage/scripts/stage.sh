#!/bin/sh
# Stage the modified file so the change is ready to commit. Path in $1.
# No-op outside a git work tree or when the file is gone.

FILE="$1"
[ -z "$FILE" ] && exit 0
[ -e "$FILE" ] || exit 0

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
git add -- "$FILE" >/dev/null 2>&1 || true
