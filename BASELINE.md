# BASELINE REPO CHECKLIST (Claude-Ready, Production Hygiene)

> This file lives in the **repo root** (not inside `docs/`).  
> Purpose: enforce a minimum professional baseline for any app so that developers and Claude Code can collaborate safely.  
> Complete all sections before feature work.  

---

## 1) Structure & Workspaces
- [ ] Monorepo layout: `apps/frontend`, `apps/backend`, optional `packages/*`
- [ ] `package.json` (root) with workspaces or `pnpm-workspace.yaml`
- [ ] `docs/` created (`REPO_MAP.md`, `API_SPEC.md`, `CLAUDE.md`, `PROMPT_DECLARATION.md`)
- [ ] Folder-level `_INSTRUCTIONS.md` + TODO markers for Claude edit surfaces

**Reference tree**
.
├─ apps/{frontend,backend}/
├─ packages/{types,ui}?/
├─ docs/
├─ scripts/
└─ .github/workflows/ci.yml


---

## 2) Dev Environment (Reproducible)
- [ ] `.editorconfig`, `.gitattributes`, `.gitignore`
- [ ] Node version pinned (`.nvmrc` or `.tool-versions`)
- [ ] `.devcontainer/devcontainer.json` boots & runs dev script
- [ ] Containers: `Dockerfile`(s) + `docker-compose.yml` (web, api, db)

---

## 3) Docs & Onboarding
- [ ] `README.md` (project intro, quick start, common commands)
- [ ] `apps/frontend/README_FRONTEND.md` with run/test/build instructions
- [ ] `apps/backend/README_BACKEND.md` with run/test/build instructions
- [ ] `docs/REPO_MAP.md` explains folder roles + ownership (CODEOWNERS-like)

---

## 4) Contracts & Types
- [ ] `packages/types/` hosts shared DTOs & schemas (e.g., Zod/JSON Schema)
- [ ] `apps/backend/openapi.yaml` (or auto-generated) checked into VCS
- [ ] Mock API or fixtures available (`pnpm mock:api`)

---

## 5) Security, Secrets, Compliance
- [ ] `.env.example` (root + per app) — no secrets in VCS
- [ ] `scripts/check-env.ts` fails fast when vars are missing
- [ ] Basic threat model & PII handling table in `CLAUDE.md` (logging redaction)
- [ ] AuthN/AuthZ model documented in `API_SPEC.md`

---

## 6) Testing & Quality Gates
- [ ] Unit tests (Vitest/Jest) for FE & BE: `pnpm test` green
- [ ] Optional E2E (Playwright) happy path(s)
- [ ] TypeScript strict mode enabled; `pnpm typecheck` green
- [ ] Linting & formatting configured (ESLint + Prettier or Biome)
- [ ] Pre-commit hooks: Husky + lint-staged

---

## 7) CI/CD (Fail-Fast)
- [ ] `.github/workflows/ci.yml` runs: install → typecheck → lint → test → build
- [ ] Performance budgets enforced (bundlesize or Lighthouse CI) with thresholds
- [ ] Artifact/build caching enabled (e.g., `actions/setup-node` + pnpm cache)
- [ ] CI fails on missing env, schema drift, or contract violations

---

## 8) Design System & UX Baseline
- [ ] Design tokens centralised (colors, spacing, radii, typography)
- [ ] Tokens imported (no hard-coded hex/px in components)
- [ ] Accessibility: focus states, aria labels, color contrast noted in docs

---

## 9) Scripts (DX)
- [ ] `scripts/dev.sh` runs FE + BE together (single command)
- [ ] `pnpm` scripts: `dev`, `build`, `test`, `lint`, `typecheck`, `mock:api`
- [ ] Optional: `verify-budgets.ts` for bundle/API p95 checks

---

## 10) Claude Ergonomics (Critical)
- [ ] `docs/CLAUDE.md` includes:
  - [ ] **Edit boundaries**: editable vs do-not-touch paths
  - [ ] **Patch protocol**: reply with `diff --git` blocks + brief commit msg
  - [ ] **START/END guardrails** inside editable files
  - [ ] **Failure-mode playbook** (schema mismatch, failing tests, missing envs)
- [ ] `docs/PROMPT_DECLARATION.md`:
  - [ ] FE/BE boundaries & data contracts
  - [ ] UX guidance (states, accessibility, interactions)
  - [ ] Security & performance budgets (measurable)
  - [ ] Response schema example (diff-only, no prose) + ideal sample

---

## 11) Alignment Sanity Check
- [ ] Screen ↔ Endpoint ↔ DTO matrix complete
- [ ] No unused/conflicting libs; lockfile committed
- [ ] Navigation/pages reflect product flows; MVP endpoints cover needs

---

### ✅ Ready Gate
All boxes above are checked, CI is green, `docker compose up` + `pnpm dev` run the stack end-to-end, and Claude has clear, surgical edit surfaces.
