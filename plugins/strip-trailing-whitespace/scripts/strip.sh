#!/bin/sh
# Strip trailing whitespace from the modified file. Path in $1.
# Skips binary / lock files; no-op when the file is gone.

FILE="$1"
[ -z "$FILE" ] && exit 0
[ -f "$FILE" ] || exit 0

case "$FILE" in
    *.lock|*.png|*.jpg|*.jpeg|*.gif|*.webp|*.wasm|*.bin|*.pdf) exit 0 ;;
esac

tmp="$FILE.stws.tmp"
if sed 's/[[:space:]]*$//' "$FILE" > "$tmp" 2>/dev/null; then
    mv "$tmp" "$FILE"
else
    rm -f "$tmp"
fi
