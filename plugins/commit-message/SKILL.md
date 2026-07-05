---
name: commit-message
description: Draft a Conventional Commits message for the current staged changes
---

# Commit Message

Write a commit message for the changes described by $ARGUMENTS (or the staged
diff if no arguments are given).

Follow the Conventional Commits format:

```
<type>(<optional scope>): <subject>

<body>
```

Rules:
- **type** is one of: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`,
  `build`, `ci`, `chore`.
- **subject** is imperative mood, lower-case, no trailing period, ≤ 72 chars.
- Add a **body** only when the *why* is non-obvious; wrap at 72 columns and
  explain the motivation, not the mechanics.
- Note breaking changes with a `!` after the type/scope and a
  `BREAKING CHANGE:` footer.
- Do not invent changes — describe only what the diff actually does.

Output only the commit message, ready to paste.
