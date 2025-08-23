# Product Brief

⚠️ IMPORTANT  
This document defines the **product’s purpose, users, and goals**.  
The infrastructure plan (`INFRASTRUCTURE_PLAN.md`) must always be aligned with this brief.

---

## 1. Product Name
 RefactorIQ™
---

## 2. Product Purpose
AI Code Review & Refactoring Autopilot


⚡ Why it wins

Meta‑leverage: Every suggestion improves many future diffs.

Context‑aware: Understands intent, patterns, and project standards (not just lint rules).

Safe by design: Confidence‑scored fixes, tests-first patches, and gated rollouts.

Seamless fit: PR comments, status checks, and one‑click apply via bot or IDE.

🎬 Demo Flow (90 seconds)

Push a branch ➜ GitHub webhook triggers /analyses job.

Streaming WebSocket shows progress (parsing → embeddings → LLM eval → proposals).

PR gets a findings summary comment + inline suggestions.

Click “Create Fix PR” to open bot PR with atomic commits + tests.

Merge ➜ dashboards update Code Health, MTTR, and Hotspots metrics.

🧠 Core Capabilities

Intelligent Code Analysis (Python, JS/TS, Go, Java, more): smells, bugs, dead code, complexity, duplication, API misuse.

Security & Secrets: OWASP/ASVS, SAST patterns, SSRF/SQLi/XSS hints, dependency advisories, secret detection.

Performance: N+1, hot loops, allocations, blocking I/O; proposes algorithmic or structural optimizations.

Architectural Integrity: layering, boundaries, cyclic deps, cohesion/coupling maps.

Auto‑Refactors: extract method, inline var, simplify conditionals, async/await conversions, module split/merge—with confidence score and test diffs.

Knowledge‑aware: learns your conventions, style, and past PR outcomes.

CI/PR Integrations: status checks, required gates, A/B compare vs baseline.

IDE Assist: VS Code/JetBrains extensions for inline previews & Apply.

🧩 Architecture (spec‑true)

Frontend: Next.js 14 (App Router), React 18, TS, Tailwind, Radix, Zustand + TanStack Query, Framer Motion.

Backend: FastAPI (async), SQLAlchemy 2.0 (async), Alembic, JWT w/ refresh rotation, Redis rate‑limiting and cache, WebSockets, Arq workers for background analyses.

Data: PostgreSQL 15 + pgvector (1536d) for embeddings; S3‑compatible storage via presigned URLs; soft deletes + updated_at triggers.

AI & Orchestration: LangChain with GPT‑4 (general, refactor planning) + Claude 3 (long‑context reasoning, standards alignment). OpenAI embeddings for semantic search.

Events & Repos: GitHub/GitLab webhooks (HMAC verified), Bitbucket optional.

Deploy: Docker images, health checks, Vercel (FE), Render (BE), auto migrations, JSON logging, uptime/metrics endpoints.



🗄️ Data Model (high level)

users (id UUID, email unique, org_id, role, soft_delete)

repos (id, provider, external_id, default_branch, settings_json)

analyses (id, repo_id, pr_number/null, status, language_set, started_at/finished_at)

files (id, repo_id, path, hash, content_ref)

chunks (id, file_id, span, embedding vector(1536))

findings (id, analysis_id, file_id, severity, rule_id, message, span, confidence)

proposals (id, finding_id, patch_diff, test_patch_diff, confidence, category)

events (id, analysis_id, type, payload_json, created_at)

tokens (access/refresh tracking for rotation + revoke)

audit_logs (who did what, when, where)

Indexes on user_id, analysis_id, (repo_id, pr_number), and embedding.

🔌 API Surface (REST)

POST /v1/auth/login → JWT (15m) & refresh (7d)

POST /v1/repos → connect repo (GitHub app handshake)

POST /v1/analyses → start analysis {repo_id, ref|pr}

GET /v1/analyses/{id} → status + aggregates (paginated findings)

GET /v1/findings?analysis_id=…&page=1&size=50 (max 100)

POST /v1/proposals/{id}/apply → enqueue bot PR or patch

WS /v1/analyses/{id}/stream → phases: queued→parsing→embedding→llm_eval→proposing→done

Patterns: consistent errors, cursor/pagination, rate‑limits: global 100/min, login 5/min, analysis 10/hour.



🔐 Security & Compliance

Pydantic v2 validation, SQLAlchemy async to prevent injection.

CORS allow‑list; webhook signature verification.

Secrets redaction at ingest; AES‑256 at rest; TLS in transit.

JWT access (15m) + rotated refresh; device/session revoke.

Principle of least privilege (scoped repo tokens).

GDPR data retention & right‑to‑erasure; soft delete + purge tasks.

📈 SLOs & Performance Targets

API p95 < 200 ms • DB complex query < 50 ms

WS First finding < 5 s on medium PRs (~1k LOC changed)

Worker throughput: 100 concurrent analyses / node (autoscale)

Uptime 99.9%, health/readiness probes, circuit breakers

Caching: sessions (7d TTL), hot analysis aggregates (1h TTL), embeddings index cached map, rate limiting with Redis sliding window.


📊 Analytics & KPIs

Code Health Score (complexity, duplication, churn)

MTTR for code issues; % auto‑fix merged; regression rate

PR cycle time reduction; reviewer load saved; hotspot map

Finding acceptance rate by category; false‑positive trend



🎛️ Developer Experience

.refactoriq.yml: org rules, severity map, dis/allow refactors, directory ownership.

CLI: riq scan, riq diff, riq apply --proposal <id>

IDE: inline hovers, quick‑fixes, confidence badges, test preview.

Bot: labels PRs, posts threaded comments, opens Fix PRs.



🎨 Brand & UI Kit (spec‑aligned)

Colors

--primary-50:#eff6ff;--primary-100:#dbeafe;--primary-500:#3b82f6;--primary-600:#2563eb;--primary-700:#1d4ed8;--primary-900:#1e3a8a;
--success-50:#f0fdf4;--success-500:#22c55e;--success-600:#16a34a;
--warning-50:#fffbeb;--warning-500:#f59e0b;--warning-600:#d97706;
--error-50:#fef2f2;--error-500:#ef4444;--error-600:#dc2626;
--info-50:#eff6ff;--info-500:#3b82f6;--info-600:#2563eb;

Type: UI — Inter; Code — JetBrains Mono.

Layouts

const dashboardLayout={header:"h-16 border-b bg-background/95 backdrop-blur",sidebar:"w-64 border-r bg-muted/40 min-h-screen",main:"flex-1 overflow-auto",content:"container mx-auto p-6 space-y-6"}
const analysisLayout={upload:"border-2 border-dashed rounded-lg p-8 text-center",progress:"w-full bg-muted rounded-full h-2",results:"space-y-4 max-h-96 overflow-y-auto"}

Badges (severity)

critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800",medium:"bg-yellow-100 text-yellow-800",low:"bg-blue-100 text-blue-800",info:"bg-gray-100 text-gray-800"

Accessibility: WCAG 2.1 AA, focus rings, keyboardable, screen‑reader labels.



🤝 Integrations

SCM: GitHub App, GitLab, Bitbucket

CI/CD: GitHub Actions, GitLab CI, CircleCI

Comms: Slack/Teams for digests & alerts

Issue tracking: Jira/Linear → create tickets from findings

Artifacts: S3/GCS for patches & reports


🧪 Testing & Quality Gates

Unit + property tests for transforms; golden tests for patches.

E2E PR sandbox (sample repos) per language.

Safety gate: confidence < threshold ⇒ suggest‑only; ≥ threshold ⇒ auto‑fix behind approval.

Canary rollout: subset of repos/teams; shadow mode first.

🔭 Roadmap (next 2 quarters)

Q1: Go & Java full parity; secret scanning v2; VS Code GA

Q2: Architectural fitness functions; ML‑driven hotspot prediction; JetBrains plugin; custom rule DSL



🧩 Claude‑Optimized Prompts (drop‑in)

PROMPT 1 — Project Setup & Arch
“Create the complete project structure… Next.js 14 TS + Tailwind; FastAPI async with SQLAlchemy 2.0; Postgres + pgvector (1536d); Redis; WebSockets; Arq workers; Docker; env config; Vercel/Render deploy.”

PROMPT 2 — Core Backend
“Implement JWT w/ refresh rotation; Pydantic v2 schemas; REST endpoints for repos/analyses/findings/proposals; GitHub/GitLab webhook handlers (HMAC); Redis rate limits (100/min global, 5/min login, 10/hour analysis); streaming WS; structured JSON logging; Alembic migrations.”

PROMPT 3 — Frontend UI
“Build dashboard, PR view, findings table (filters, severity badges), diff viewer with inline apply; upload area; progress stream; settings; accessibility (WCAG AA), dark mode; Zustand + TanStack Query.”

PROMPT 4 — AI Integration
“Wire LangChain with GPT‑4 (plan/patch) + Claude 3 (reasoning & standards); embedding generation; confidence scoring; auto‑fix categories; multilingual support; proposal patches + unit‑test stubs.”

PROMPT 5 — Deployment & Ops
“Dockerfiles, health checks, OpenAPI docs, monitoring endpoints; autoscaling workers; retention policies; backups; SLO dashboards; incident playbooks.”




📣 Positioning & Taglines

“RefactorIQ: Make every PR your best PR.”

“From code smell to ship‑ready in minutes.”

“Safer auto‑fixes. Happier reviewers. Faster merges.”

✅ Success Criteria (spec‑aligned)

10k+ concurrent users supported; p95 API < 200 ms; WS streaming live.

95+ Lighthouse (FE); 99.9% uptime; >90% test coverage; OpenAPI complete.

Measurable PR cycle time ↓ 30%, defects post‑merge ↓ 40%, reviewer time saved ↑ 50%.