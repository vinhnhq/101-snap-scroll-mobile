@AGENTS.md

# Behavioral Guidelines

## 1. Think Before Coding

Before implementing, state assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If a simpler approach exists, say so. Push back when warranted. If something is unclear, stop and ask.

## 2. Simplicity First

Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No error handling for impossible scenarios. If you write 200 lines and it could be 50, rewrite it.

## 3. Surgical Changes

Touch only what you must. Don't improve adjacent code, comments, or formatting. Match existing style. If your changes create orphans (unused imports, variables, functions), remove them — but don't touch pre-existing dead code unless asked.

## 4. Goal-Driven Execution

Transform tasks into verifiable goals. For multi-step tasks, state a brief plan with a verify step for each. Define success criteria before starting — weak criteria require constant clarification.
