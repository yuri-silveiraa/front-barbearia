---
name: project-memory
description: Use when working in the `front-barbearia` repository to persist decisions, bugs and validations into the frontend engineering memory file so other agents can continue the UI work without reproving problems.
---

# Project Memory (frontend)

## Canonical file

Update `ENGINEERING_MEMORY.md` at the root of this repository.

## When to use

Use this skill whenever work touches:

- bug fixes or recurring UI errors
- layout or responsiveness adjustments
- contract changes with the backend (payloads, headers, CSRF, auth flows)
- important validation results (build, lint, e2e mocks)
- hypotheses that deserve documentation for future agents

## Entry format

Always append using:

```md
## YYYY-MM-DD - Short title

- Repo: `front-barbearia`
- Contexto:
- Arquivos:
- Problema:
- Causa raiz:
- Solução:
- Validação:
- Pendências:
```

## Writing rules

- Keep entries concise and concrete.
- Prefer file references over verbatim code dumps.
- Log observed error messages and root causes (or state when unknown).
- If multiple attempts occurred, document the failing path only when it saves future time.
- Update the file in the same turn as the change whenever possible.

## Scope

This memory is operational, not a changelog. Record only the knowledge future agents would reuse.
