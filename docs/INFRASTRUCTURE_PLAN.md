# THE INFRASTRUCTURE  PLAN #

#FOLLOW THIS Claude Fullstack Repo Infrastructure 8 STEP PLAN TO PREPARE or CHECK THE INFRASTRUCTURE
-----------------------------------------------------


⚠️ **IMPORTANT** ⚠️  
This file defines the **mandatory 8-step process** to prepare the repo infrastructure.  

- Every coding assistant must follow these steps **in order**.  
- Do **not** build product features until this setup is 100% complete.  
- Human + AI contributors should mark checklists as progress is made.  
- Refer also to `BASELINE.md` (at repo root) for the minimum hygiene checklist.  
- Ensure this plan is aligned with /docs/PRODUCT_BRIEF.md.

---

# 🚀 Claude Fullstack Repo Prep – Optimized 8 Step Plan

The goal: build an extensive frontend + backend scaffold so Claude Code only has to finish ~20% of the work.  
Each step must be **completed** before advancing (this is important).  
You are building only the **infrastructure of the application**, not the application itself.  

---

## STEP 1 — Build the Rich Infrastructure

Create a **deep scaffold** for both frontend and backend so Claude can recognize the architecture immediately.

**Tasks**
- Build a **frontend app shell** with routing, placeholder pages, components, and styling setup.  
- Build a **backend app shell** with API structure, health endpoint, and config in place.  
- Include `REPO_MAP.md`, `API_SPEC.md`, and a draft `CLAUDE.md` in the `docs/` folder.  
- Add **TODO markers and folder-level `_INSTRUCTIONS.md`** files so Claude knows where to add logic.  
- Add **root workspace** files: `pnpm-workspace.yaml` (or npm workspaces).  
- Add **containers/dev env**: `Dockerfile` (FE+BE), `docker-compose.yml`, `.devcontainer/devcontainer.json`.  
- Add **editor baseline configs**: `.editorconfig`, `.gitattributes`, `.nvmrc`.  
- Add **`BASELINE.md`** at the repo root (Claude-ready hygiene checklist).  

**Deliverables**
- Frontend + backend app shells in place  
- Draft docs created in `docs/`  
- `_INSTRUCTIONS.md` stubs added  
- Workspace + Docker + devcontainer set up  
- Editor configs committed  
- `BASELINE.md` added at root  

**Checklist**
- [ ] Frontend scaffold built  
- [ ] Backend scaffold built  
- [ ] Docs folder created with drafts  
- [ ] TODO markers and `_INSTRUCTIONS.md` stubs in place  
- [ ] Workspaces configured at root  
- [ ] Devcontainer runs `pnpm i && pnpm dev`  
- [ ] Docker compose brings up `web`, `api`, `db`  
- [ ] `BASELINE.md` present at root  

---

## STEP 2 — Enrich the Scaffold

If the repo looks shallow, enrich it so Claude needs fewer leaps of imagination.  

**Tasks**
- Add sample frontend routes/components: `/`, `/about`, `/dashboard`  
- Add domain model stubs and types/interfaces  
- Add mock data + fixtures for UI flows  
- Add `README_FRONTEND.md` and `README_BACKEND.md` with run instructions  
- Add `_INSTRUCTIONS.md` files with `CLAUDE_TASK:` markers  
- Add shared **types/contracts** in `packages/types`  
- Add backend API schema (`openapi.yaml`) + mock server script  
- Add DB seed + fixture data  

**Checklist**
- [ ] At least 2–3 sample routes/pages exist  
- [ ] Domain types/interfaces stubbed out  
- [ ] Mock data + fixtures included  
- [ ] README_FRONTEND.md and README_BACKEND.md added  
- [ ] Each folder has `_INSTRUCTIONS.md`  
- [ ] Shared `packages/types` added  
- [ ] API schema produced and mock server runs  

---

## STEP 3 — Audit for Alignment

Check that the scaffold matches the **product brief, tech specs, and UX goals**.  

**Tasks**
- Ensure navigation/pages reflect product flows  
- Ensure API endpoints match UI needs  
- Ensure tech stack is consistent (no unused libs)  
- Ensure UX direction reflected (design tokens, layout, component stubs)  
- Create **screen ↔ endpoint ↔ DTO matrix**  
- Add central **design tokens** (`packages/ui/tokens.ts`)  

**Checklist**
- [ ] Navigation matches product journeys  
- [ ] Components/pages map to required features  
- [ ] API endpoints cover MVP needs  
- [ ] No contradictory/unused technologies  
- [ ] Screen–Endpoint–DTO matrix complete  
- [ ] Components use tokens (no hard-coded hex)  

---

## STEP 4 — Document the Architecture

Make the repo docs **Claude-ready**.  

**Tasks**
- `REPO_MAP.md`: full repo breakdown + ownership + safe-to-edit vs locked  
- `API_SPEC.md`: endpoints, models, error taxonomy, pagination, versioning  
- `CLAUDE.md`: coding conventions, AI collaboration rules, guardrails  

**Checklist**
- [ ] REPO_MAP.md describes structure + ownership  
- [ ] API_SPEC.md covers MVP endpoints + schemas + errors  
- [ ] CLAUDE.md includes project overview, editing rules, guardrails  
- [ ] Do-not-touch files explicitly listed  

---

## STEP 5 — Improve the Prompt

Enhance `docs/PROMPT_DECLARATION.md` with details Claude needs.  

**Tasks**
- Define FE/BE boundaries + data contracts  
- Add UX guidelines (states, accessibility, interactions)  
- Add performance budgets (bundle size, API latency)  
- Add security constraints (auth, rate limits, PII)  
- Add testing expectations (unit, integration, E2E)  
- Add **response schema**: diff/patch only, no prose  
- Add **example prompt + example ideal Claude response**  
- Tie budgets to CI scripts  

**Checklist**
- [ ] Prompt includes FE/BE boundaries  
- [ ] UX principles + tokens specified  
- [ ] Performance/security/testing added  
- [ ] Prompt concrete and actionable  
- [ ] Example response provided (diff format)  

---

## STEP 6 — Expert Audit of the Prompt

Audit the one-page prompt for alignment + clarity.  

**Tasks**
- Add architecture, design, integrations, success criteria, compliance  
- Remove inconsistencies, duplicates, unused tech  
- Ensure stack ↔ product ↔ scaffold alignment  
- Add UI/UX accessibility details  
- Confirm editing boundaries are clear  
- Add **red-team pass** (resolve ambiguous terms)  
- Add **security/compliance table** (auth, secrets, PII handling)  

**Checklist**
- [ ] No unused/contradictory tech  
- [ ] UI/UX directives sufficient  
- [ ] Editing boundaries explicit  
- [ ] Prompt syntax clear + imperative  
- [ ] Ambiguities resolved  
- [ ] Security table covers authZ, secrets, logging  

---

## STEP 7 — Bird’s-Eye Repo Review

Do a top-level scan for missing pieces.  

**Tasks**
- Ensure all folders contain code or `_INSTRUCTIONS.md`  
- Ensure `.env.example` exists for FE and BE  
- Ensure CI/CD config works end-to-end  
- Ensure run scripts (`pnpm dev`, `scripts/dev.sh`) work  
- Ensure no orphan TODOs  
- Add **automation gates**: lint, test, typecheck, pre-commit, budgets, env checks  
- Verify **`BASELINE.md`** is up to date with repo state  

**Checklist**
- [ ] Every folder has code or `_INSTRUCTIONS.md`  
- [ ] `.env.example` present for FE & BE  
- [ ] CI pipeline passes (lint, test, typecheck, build)  
- [ ] Dev script runs FE & BE  
- [ ] Pre-commit prevents drift  
- [ ] Bundlesize/env checks enforced  
- [ ] `BASELINE.md` updated  

---

## STEP 8 — Finalize CLAUDE.md

Give Claude its **onboarding pack**.  

**Tasks**
- Add project overview (purpose, stack, goals, users)  
- Add folder/file structure (editable vs do-not-touch)  
- Add coding conventions (style, naming, commenting)  
- Add AI collaboration rules (response style, ambiguity handling)  
- Add editing rules (patches vs full-file)  
- Add dependencies + setup notes  
- Add workflow + deployment notes  
- Add contextual knowledge (business logic quirks)  
- Add good vs bad answer examples  
- Add **patch protocol** (diff blocks + commit msg)  
- Add **failure-mode playbook** (schema mismatch, failing tests, missing envs)  
- Add **START/END guardrails** inside editable files  

**Checklist**
- [ ] Project overview written  
- [ ] File boundaries defined  
- [ ] Coding/style conventions included  
- [ ] AI collaboration & editing rules written  
- [ ] Dependencies + env notes covered  
- [ ] Workflow & deployment info added  
- [ ] Contextual knowledge documented  
- [ ] Good vs bad examples included  
- [ ] Patch protocol documented  
- [ ] Failure-mode playbook documented  

---

# ✅ Outcome

When this plan is followed:  
- The repo is a **rich, opinionated scaffold** (80% complete).  
- Docs give Claude **clear boundaries + context**.  
- The prompt is **battle-tested** and aligned.  
- Claude can safely and efficiently generate the missing 20%.  
- Repo hygiene (`BASELINE.md`), CI gates, containers, devcontainers, contracts, and guardrails ensure Claude edits are **safe, surgical, and production-grade**.  
