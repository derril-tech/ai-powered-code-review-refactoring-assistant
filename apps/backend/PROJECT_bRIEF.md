# THE PROJECT BRIEF #

# Project Name #
Code Review and Refactoring Assistant

# Product Description / Presentation #

### **Product Description**

The **AI Powered Code Review and Refactoring Assistant** is an intelligent, automated tool designed to revolutionize the software development lifecycle. By leveraging the power of advanced AI and machine learning, it provides developers with instant, actionable feedback on their code, significantly accelerating the code review process and enhancing overall code quality.

This assistant goes beyond traditional linters and static analysis tools. It understands code context, intent, and best practices to identify a wide range of issues, from subtle bugs and security vulnerabilities to performance bottlenecks and architectural inefficiencies. It not only points out problems but also suggests intelligent, context-aware refactoring solutions and can even apply them automatically.

---

### **Key Features**

* **Intelligent Code Analysis**: Uses AI to analyze code in real-time, detecting code smells, anti-patterns, and potential bugs. It provides insights into code complexity and maintainability.
* **Automated Refactoring**: Suggests and applies automated refactoring for common patterns, such as extracting functions, simplifying conditional logic, and optimizing loops, ensuring code is cleaner and more efficient.
* **Security Vulnerability Detection**: Scans for security weaknesses and insecure coding practices, helping to proactively prevent vulnerabilities before they are deployed.
* **Performance Optimization**: Identifies performance issues and recommends code changes to improve execution speed and resource usage.
* **Seamless Integration**: Integrates directly with popular Integrated Development Environments (IDEs), version control systems (like GitHub and GitLab), and continuous integration/continuous deployment (CI/CD) pipelines.
* **Customizable Rules**: Allows development teams to enforce their own coding standards and style guides, ensuring consistency across a project or organization.

---

### **User Flow & Mission**

The primary mission is to empower developers to write high-quality, secure, and maintainable code with greater speed and confidence. The user flow is designed to be frictionless, providing assistance as an embedded part of the developer's existing workflow.

1.  **Code Creation**: As the developer writes code, the assistant provides real-time, inline suggestions and refactoring prompts.
2.  **Pull Request (PR) Creation**: When a PR is opened, the assistant automatically reviews the changes, generates a concise summary of the diff, and adds detailed comments with suggestions for improvements.
3.  **Review and Refine**: The human reviewer can quickly see the AI's findings, reducing the time spent on mundane checks and allowing them to focus on high-level architectural and business logic reviews.
4.  **Continuous Improvement**: Over time, the assistant learns from a team's feedback and accepted changes, making its suggestions more personalized and relevant to the codebase.




FOLLOW THIS 8 STEP PLAN TO PREPARE THE INFRASTRUCTURE
-----------------------------------------------------

# 🚀 Claude Fullstack Repo Prep – Optimized 8 Step Plan

  
The goal: build an extensive frontend + backend scaffold so Claude Code only has to finish ~20% of the work.  
Each step must be **completed ** before advancing  (this is important).
IMPORTANT: YOU ARE BUILDING ONLY THE INFRASTRUCTURE OF THE APPLICATION NOT THE APPLICATION ITSELF !!!. FOLLOW THE STEPS IN NUMERICAL ORDER !!! starting from step 1.
You are doing the groundwork for the application, including setting up the folder structure, configuration files, and any necessary boilerplate code.
IMPORTANT: the checklist in each step has to be checked off 100% before moving to the next step. And always provide comments to your code blocks so that even a non-tech person can understand what you have done.

---

## STEP 1 — Build the Rich Infrastructure
Create a **deep scaffold** for both frontend and backend so Claude code can recognize the architecture immediately.

- Build a **frontend app shell** with routing, placeholder pages, components, and styling setup.  
- Build a **backend app shell** with API structure, health endpoint, and config in place.  
- Include `REPO_MAP.md`, `API_SPEC.md`, and a draft `CLAUDE.md` in the `docs/` folder.  (create the docs folder if it does not  already exist)
- Add **TODO markers and folder-level `_INSTRUCTIONS.md`** files so Claude knows exactly where to add logic.

**Deliverables**
- Frontend app shell with routing, placeholder pages, components, and styling setup  
- Backend app shell with API structure, health endpoint, and config  
- `docs/REPO_MAP.md`, `docs/API_SPEC.md` (stub), and draft `docs/CLAUDE.md`  
- TODO markers + folder-level `_INSTRUCTIONS.md` files  

**Checklist**
- [ ] Frontend scaffold built  
- [ ] Backend scaffold built 
- [ ] Docs folder created with drafts (`REPO_MAP.md`, `API_SPEC.md`, `CLAUDE.md`)  
- [ ] TODO markers and `_INSTRUCTIONS.md` stubs in place  

---

## STEP 2 — Enrich the Scaffold
If the repo looks shallow, enrich it so Claude needs fewer leaps of imagination.  

Add:
- Sample frontend routes and components (`/`, `/about`, `/dashboard`)  
- Domain model stubs and types/interfaces  
- Mock data + fixtures for UI flows  
- README files with quick run instructions for both frontend and backend  
- Instructions embedded in folders (e.g. `CLAUDE_TASK: …`)

**Deliverables**
- Sample routes and pages (`/`, `/about`, `/dashboard`)  
- Domain model stubs and type definitions  
- Mock data and fixtures for UI flows  
- README files for frontend and backend with run instructions  
- Folder-level instructions (`_INSTRUCTIONS.md`)  

**Checklist**
- [ ] At least 2–3 sample routes/pages exist  
- [ ] Domain types/interfaces stubbed out  
- [ ] Mock data + fixtures included  
- [ ] README_FRONTEND.md and README_BACKEND.md added  
- [ ] Each folder has `_INSTRUCTIONS.md` where relevant 

---

## STEP 3 — Audit for Alignment
Check that the scaffold actually matches the product brief, tech specs, and UX /UI goals.
Add additional UI/UX elements (if needed) to make the application visually appealing (and update the design requirements after that)

- Do navigation and pages reflect the product’s main flows?  
- Do API endpoints match the UI needs?  
- Is the chosen tech stack consistent (no unused or conflicting libraries)?  
- Is the UX direction reflected (design tokens, layout, component stubs)?

**Deliverables**
- Alignment review across Product ↔ UI/UX ↔ Tech  
- Identify any missing flows, mismatched libraries, or conflicting instructions  

**Checklist**
- [ ] Navigation structure matches product journeys  
- [ ] Components/pages map to required features  
- [ ] API endpoints cover MVP needs  
- [ ] No contradictory or unused technologies  

---

## STEP 4 — Document the Architecture
Now make the docs **Claude-ready**:

- **REPO_MAP.md**: Full repo breakdown with roles of each folder  
- **API_SPEC.md**: Endpoints, payloads, error handling  
- **CLAUDE.md**: Editing rules, coding conventions, AI collaboration guidelines  

These three files are the **context backbone** Claude will use to understand the repo.

**Deliverables**
- `REPO_MAP.md`: full repo breakdown with folder purposes  
- `API_SPEC.md`: endpoints, models, error conventions  
- `CLAUDE.md`: collaboration rules, editing boundaries  

**Checklist**
- [ ] REPO_MAP.md fully describes structure  
- [ ] API_SPEC.md covers all MVP endpoints and schemas  
- [ ] CLAUDE.md includes project overview, editing rules, examples  

---

## STEP 5 — Improve the Prompt
Enhance the prompt (in `docs/PROMPT_DECLARATION.md`) with details Claude needs:

- FE/BE boundaries and data contracts  
- UX guidelines (states, accessibility, interaction patterns)  
- Performance budgets (bundle size, API latency)  
- Security constraints (auth, rate limits, PII handling)  
- Testing expectations (unit, integration, end-to-end)

**Deliverables**
- FE/BE boundaries and contracts  
- UX guidelines (states, accessibility, patterns)  
- Performance budgets (bundle size, latency targets)  
- Security constraints (auth, PII, rate limits)  
- Testing expectations  

**Checklist**
- [ ] Prompt includes FE/BE division of responsibility  
- [ ] UX principles and design tokens specified  
- [ ] Performance/security/testing requirements added  
- [ ] Prompt is concrete and actionable for Claude  

---

## STEP 6 — Expert Audit of the Prompt
Now do a **meticulous audit** of the one-page prompt declaration.

- Add Frontend Architecture, Backend Architecture, Design requirements, Core Integrations, Success Criteria, Implementation Guidelines and Security & Compliance categories from this Project Brief to the prompt declaration.
- Remove inconsistencies, duplicates, or unused technologies  
- Ensure Tech Stack → Product → Scaffold alignment (no mismatches)  
- Add UI/UX details that make the product visually appealing and usable  
- Double-check frontend and backend folders are ready  
- Confirm editing boundaries are clear (what Claude can/can’t touch)  
- Make the declaration **battle-tested and handoff-ready**

**Deliverables**
- Remove inconsistencies/duplicates  
- Ensure stack ↔ product ↔ scaffold alignment  
- Add UI/UX and accessibility details  
- Clarify file boundaries (editable vs do-not-touch)  
- Confirm prompt uses Claude-friendly syntax  

**Checklist**
- [ ] No unused or contradictory tech remains  
- [ ] UI/UX directives are product-specific and sufficient  
- [ ] Editing boundaries explicitly defined  
- [ ] Prompt syntax uses clear, imperative instructions  

---

## STEP 7 — Bird’s-Eye Repo Review
Do a quick top-level scan for missing pieces:

- All folders contain either code or `_INSTRUCTIONS.md`  
- `.env.example` files exist for both frontend and backend  
- CI/CD config is present and not trivially broken  
- Run scripts (`npm run dev`, `uvicorn …`) work end-to-end  
- No orphan TODOs without clear ownership

**Deliverables**
- Verify all core files exist  
- Confirm environment, CI, and scripts work end-to-end  

**Checklist**
- [ ] Every folder has code or `_INSTRUCTIONS.md`  
- [ ] `.env.example` present for both frontend and backend  
- [ ] CI pipeline triggers and passes basic checks  
- [ ] Dev script (`scripts/dev.sh`) runs both FE and BE  

---

## STEP 8 — Finalize CLAUDE.md
This is where Claude gets its **onboarding pack**. Make sure `CLAUDE.md` includes:

- **Project Overview**: one-paragraph purpose, stack, goals, target users  
- **Folder & File Structure**: what’s editable vs do-not-touch  
- **Coding Conventions**: style guides, naming rules, commenting expectations  
- **AI Collaboration Rules**: response format, edit rules, ambiguity handling  
- **Editing Rules**: full-file vs patches, locked files  
- **Dependencies & Setup**: frameworks, services, env vars  
- **Workflow & Tools**: how to run locally, FE/BE boundary, deployment notes  
- **Contextual Knowledge**: product quirks, domain rules, business logic caveats  
- **Examples**: good vs bad AI answer

**Deliverables**
- Project overview (purpose, stack, goals, users)  
- Folder & file structure with editable vs do-not-touch  
- Coding conventions (style, naming, commenting)  
- AI collaboration rules (response style, edit rules, ambiguity handling)  
- Dependencies and setup instructions  
- Workflow, deployment notes, contextual knowledge  
- Good vs bad answer examples  
- Fill out all the missing information in the CLAUDE.md file

**Checklist**
- [ ] Project overview section filled in  
- [ ] File boundaries clearly defined  
- [ ] Coding/style conventions included  
- [ ] AI collaboration & editing rules written  
- [ ] Dependencies & env notes covered  
- [ ] Workflow & deployment info added  
- [ ] Contextual knowledge documented  
- [ ] Good vs bad examples included  
- [ ] CLAUDE.md file does not miss any important information

---

# ✅ Outcome
When this 8-step plan is followed:
- The repo is a **rich, opinionated scaffold** (80% done).  
- Docs give Claude **clear boundaries + context**.  
- The one-page prompt is **battle-tested** and aligned.  
- Claude Code can safely and efficiently generate the missing 20%.  












