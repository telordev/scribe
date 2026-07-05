---
name: explain
description: Explain how a piece of code, a file, or a symbol works
---

# Explain

Explain the code referenced by $ARGUMENTS (a file path, a symbol, or a pasted
snippet). If it names a file or symbol, read it first.

Structure the explanation:

## What it does
One or two sentences — the purpose, in plain language.

## How it works
Walk the control/data flow step by step. Name the key types, functions, and
invariants. Call out anything non-obvious (concurrency, error handling, edge
cases, performance-sensitive paths).

## Inputs & outputs
What it consumes, what it produces, and what it assumes about callers.

## Gotchas
Surprising behaviour, footguns, or constraints a caller must respect.

Keep it grounded in the actual code — quote real identifiers, don't speculate
about code you haven't read.
