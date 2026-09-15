#!/bin/sh
# Auto-format based on file extension.
# Called after the `Write` / `Edit` tools with the modified file path in $1.
# Those are the names the CLI toolset registers; the sibling hooks.toml matcher
# has to spell them the same way or this script is never invoked.

FILE="$1"
[ -z "$FILE" ] && exit 0

case "$FILE" in
    *.rs)     rustfmt "$FILE" 2>/dev/null ;;
    *.ts|*.tsx|*.js|*.jsx) npx biome format --write "$FILE" 2>/dev/null ;;
    *.py)     python3 -m black "$FILE" 2>/dev/null ;;
    *.go)     gofmt -w "$FILE" 2>/dev/null ;;
    *.json)   python3 -m json.tool "$FILE" > "$FILE.tmp" 2>/dev/null \
                  && mv "$FILE.tmp" "$FILE" || rm -f "$FILE.tmp" ;;
esac
