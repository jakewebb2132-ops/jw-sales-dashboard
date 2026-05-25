# Project Context Snapshot: Sales Command Center
Generated: 2026-05-25T09:45:49.469Z

## 🎯 Core Objectives

# Sales Commander Agent

You are the Sales Commander, an AI agent designed to operationalize high-intensity signal intelligence for AI-first Go-To-Market (GTM) strategies.

## 🎯 Objective
Your mission is to monitor LinkedIn signals, resolve anonymous visitor identities, and generate actionable daily reports. You own the memory and orchestration logic, prioritizing local registry over remote access.

## 🧠 Strategic Foundation
Refer to the local wiki for core logic:
- **GTM Thesis**: See [wiki/strategy/ai-gtm.md](file:///Users/jake/.gemini/antigravity/scratch/jw-sales-command/wiki/strategy/ai-gtm.md)
- **Security Posture**: See [wiki/security/security-posture.md](file:///Users/jake/.gemini/antigravity/scratch/jw-sales-command/wiki/security/security-posture.md)

## 🔄 AI Workflow Protocols
1. **Plan-Execute-Verify**: Codify recurring tasks into skills.
2. **Prompt Contracts**: Define **GOAL**, **CONSTRAINTS**, and **FAILURE CONDITIONS** before starting complex tasks.
3. **Manager-Worker Handoff**: The primary agent acts as Manager (Planning/Reasoning) and delegates implementation to Workers (Skills/Tools).
4. **Local Memory First**: Prioritize snapshots in `memory/` for interaction history.
5. **Security-First**: Never expose credentials. Follow wiki protocols.

## 📂 Memory Structure
- **signals**: Real-time interaction data from LinkedIn.
- **leads**: Resolved identities with contact info and firmographic data.
- **interactions**: History of GTM actions taken by the agent.

## 🛠 Skills
You have access to specialized skills in [**`workspace/skills/`**](file:///Users/jake/.gemini/antigravity/scratch/jw-sales-command/workspace/skills/):
- **Identity Resolution**: Pillar 1 enrichment logic.
- **Daily Signal Reporting**: Summary generation of interaction data.
- **Memory Sync**: Pulling remote signals into the local registry.
- **Supabase Core**: Comprehensive Supabase product knowledge (Auth, DB, Functions).
- **Postgres Best Practices**: Schema design, performance, and query optimization.


## 🧠 Strategic Wiki (Local Intelligence)

### File: wiki/reference/deep-agents-deploy.md

# Deep Agents Deploy: An Open Alternative to Claude Managed Agents

*Note: This is a reference article outlining the philosophy and standards for open-source agent harnesses.*

## Core Philosophy: The Open World
Deep Agents Deploy is built for an open world, as an alternative to walled gardens like Claude Managed Agents. The key mission is to allow developers to **own their memory** and orchestration logic, avoiding proprietary lock-in to any single model or platform.

### Harness Engineering -> Production
Harness engineering is the discipline of building orchestration logic, tools, and skills that turn LLMs into agents. To go to production:
1. Deploy orchestration logic and memory in a scalable way.
2. Set up sandboxes per agent session.
3. Stand up endpoints (MCP, A2A, Agent Protocol).

## What are you deploying?
- **model**: Model-agnostic support (OpenAI, Anthropic, Google, Bedrock, Azure, etc.).
- **AGENTS.md**: Open standard for instruction memory.
- **skills**: Open standard for specialized knowledge/actions via scripts.
- **mcp.json**: Tools using the HTTPS/SSE MCP protocol.
- **sandbox**: Isolated execution environments (Daytona, Runloop, Modal, LangSmith).

## Memory: The Value of Openness
An agent harness is intimately tied to memory (context). If memory is bundled behind closed APIs, it creates immense lock-in. 
- **Internal Agents**: Accumulate learning over time.
- **External Agents**: Build customer-specific data flywheels.
In an open ecosystem (Standard formats like AGENTS.md), memory remains yours and can be moved between models and self-hosted deployments.

## Project Layout Constants
- `.env`: API keys/secrets.
- `AGENTS.md`: Instructions (Required).
- `skills/`: Agent skills directory.
- `mcp.json`: MCP server config.
- `deepagents.toml`: Agent config (Name, Model, Sandbox).

## Supported Runtimes & Endpoints
- **MCP**: Call agents as tools.
- **A2A**: Multi-agent orchestration.
- **Agent Protocol**: Standard API for UIs.
- **Human-in-the-loop**: Approval gates.
- **Memory APIs**: Access short/long term memory.


### File: wiki/security/security-posture.md

# Security Posture & Protocols

Security is integrated into the agent's core loop. We follow a zero-trust model for external signals.

## Data Handling
1. **Zero-Trust Input**: All LinkedIn/Web signals are treated as untrusted. Validate schemas before ingestion.
2. **Credential Hygiene**: Never hardcode API keys. Use `.env` with specific provider prefixes (e.g., `ANTHROPIC_API_KEY`).
3. **Sandbox Enforcement**: All skill execution must happen within the LangSmith/Daytona sandbox.

## Access Control
- The Supabase Service Role key is restricted to the Enrichment Worker.
- Frontend access is limited to the Anon/Public key with RLS (Row Level Security) enforced.


### File: wiki/strategy/ai-gtm.md

# AI-Pilled GTM Strategy

The "AI-Pilled" playbook is our core Go-To-Market thesis. It centers on high-intensity signal intelligence and automated identity resolution.

## Core Pillars
1. **WebSearch Enrichment (Pillar 1)**: 
   - Never settle for "Anonymous Visitor".
   - Use firmographic signals to resolve identities.
   - Target: Resolve 100% of organic LinkedIn interactions to a person/title.

2. **Signal Intelligence (Pillar 2)**: 
   - Interactions > Outreach.
   - Monitor likes, profile views, and comments in real-time.
   - Categorize intent vs. noise.

3. **Data Flywheel (Pillar 3)**: 
   - Every resolved identity is a permanent asset in the Memory Palace.
   - Use interactions to refine target personas automatically.

## AI Workflow
- **Plan-Execute-Verify**: All tactical tasks must be codified into skills.
- **Strategy-Alignment**: Every action must be traceable to one of the GTM pillars.


## 🛠 Operational Skills (Code Capabilities)

### Skill: autoresearch-gtm

# Autoresearch GTM — Autonomous Self-Improvement Loop

Adapted from [karpathy/autoresearch](https://github.com/karpathy/autoresearch). Instead of optimizing a neural network, this loop optimizes the GTM signal pipeline — specifically the contact-research prompt strategy.

## Metric
**`resolution_rate`** = (resolved / total_tested) × 100. Higher is better.

## What Gets Modified
`workspace/skills/contact-research/run.js` — specifically `PROMPT_TEMPLATE`. The rest of the pipeline is read-only.

## The Loop (mirrors autoresearch program.md)

```
LOOP FOREVER:
1. Fetch a fixed batch of unresolved signals (Pending Enrichment) from Supabase
2. Run contact-research on the batch with the current prompt → measure baseline resolution_rate
3. Use Claude to propose a PROMPT_TEMPLATE improvement
4. Apply the change to contact-research/run.js
5. git commit
6. Re-run contact-research on the same batch → measure new resolution_rate
7. Log to results.tsv
8. If resolution_rate improved → keep commit (advance)
9. If equal or worse → git reset --hard HEAD~1 (revert)
10. Repeat
```

## Usage

```bash
# Run from project root
node workspace/skills/autoresearch-gtm/run.js

# Run with a custom batch size (default: 10)
node workspace/skills/autoresearch-gtm/run.js --batch 20

# Run N experiments then stop (default: loop forever)
node workspace/skills/autoresearch-gtm/run.js --max-experiments 5
```

## Results Log (results.tsv)
Tab-separated, untracked by git:
```
commit  resolution_rate  status  description
```

## Required ENV
- `SUPABASE_URL` / `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` / `VITE_SUPABASE_ANON_KEY`
- Claude CLI (`claude`) must be on PATH (uses Pro plan)


### Skill: contact-research

# Contact Research Skill

Live AI-powered identity resolution for unknown organizations. Uses Claude with web search to find the highest-value decision-maker at any org — the person most likely to be the LinkedIn signal source.

## Pillar Alignment
- **Pillar 1** (Identity Resolution): Resolves anonymous org signals to a named person.
- **Pillar 3** (Data Flywheel): Discovered contacts are written back to Supabase, enriching the memory registry permanently.

## Usage

### Standalone (CLI)
```bash
node workspace/skills/contact-research/run.js "Southridge School"
node workspace/skills/contact-research/run.js "Maildoso" "viewed LinkedIn profile"
```

### As a Module (imported by other skills)
```js
import { researchContact } from './workspace/skills/contact-research/run.js';

const contact = await researchContact('Southridge School');
// Returns: { person_name, person_title, person_company, linkedin_url, confidence, source }
// Returns: null if no confident match found
```

## Output Schema
| Field | Description |
|---|---|
| `person_name` | Full name of resolved contact |
| `person_title` | Job title |
| `person_company` | Organization name (normalized) |
| `linkedin_url` | LinkedIn profile URL |
| `confidence` | `high` / `medium` / `low` |
| `source` | Search query used to find the contact |

## Target Persona Logic
Claude is instructed to prioritize decision-makers in this order:
1. CMO / VP Marketing / Head of Communications
2. CTO / VP Engineering / Head of Data & AI
3. CEO / Executive Director (for smaller orgs)

## Required ENV
- `ANTHROPIC_API_KEY` — Claude API key with web search access


### Skill: context-distiller

# Context Distiller Skill

This skill compiles the repository state, strategic wiki, and operational scripts into a compressed "Knowledge Artifact" optimized for NotebookLM.

## 📋 Usage
Run this skill to generate a `context_distillation.md` file. 
- **Goal**: Offload token usage by providing a high-density summary for RAG (Retrieval Augmented Generation) tools like NotebookLM.
- **Output**: `knowledge/context_distillation.md`

## 🛠 Action
Run `node run.js` to execute the distillation.

## 🧠 Context
This skill reads the entire `workspace/skills/` and `wiki/` directories to synthesize the current project "Learnable Surface". It captures the "how" and "why" behind the code, not just the "what".


### Skill: identity-resolution

# Identity Resolution Skill (Pillar 1)

This skill operationalizes "Pillar 1" of the GTM thesis: resolving "Anonymous Visitor" signals into specific target individuals.

## 📋 Usage
Run this skill when anonymous signals are detected. It will:
1. Extract organization names from interaction text.
2. Resolve identities using firmographic resolution logic.
3. Update the `signals` table in Supabase with the resolved profile data.

## 🛠 Action
Run `node run.js` to execute the resolution worker.

## 🧠 Context
This is a core component of the "Knowledge Infrastructure". It ensures the data flywheel remains enriched with actionable person-level data instead of company-level noise.


### Skill: memory-sync

# Memory Sync Skill

This skill allows the agent to pull signals from Supabase into a local JSON snapshot, fulfilling the "Local Memory" requirement.

## 📋 Usage
Run this skill to synchronize remote interactions with the local filesystem.
- Target: `memory/signals_snapshot.json`
- Source: Supabase `signals` table

## 🛠 Action
Run `node run.js` to execute the sync.

## 🧠 Context
This skill ensures that the agent's memory registry is accessible locally for analysis, training, or offline workflows without constant API overhead.


### Skill: notebooklm

---
name: notebooklm
description: Use this skill to query your Google NotebookLM notebooks directly from Claude Code for source-grounded, citation-backed answers from Gemini. Browser automation, library management, persistent auth. Drastically reduced hallucinations through document-only responses.
---

# NotebookLM Research Assistant Skill

Interact with Google NotebookLM to query documentation with Gemini's source-grounded answers. Each question opens a fresh browser session, retrieves the answer exclusively from your uploaded documents, and closes.

## When to Use This Skill

Trigger when user:
- Mentions NotebookLM explicitly
- Shares NotebookLM URL (`https://notebooklm.google.com/notebook/...`)
- Asks to query their notebooks/documentation
- Wants to add documentation to NotebookLM library
- Uses phrases like "ask my NotebookLM", "check my docs", "query my notebook"

## ⚠️ CRITICAL: Add Command - Smart Discovery

When user wants to add a notebook without providing details:

**SMART ADD (Recommended)**: Query the notebook first to discover its content:
```bash
# Step 1: Query the notebook about its content
python scripts/run.py ask_question.py --question "What is the content of this notebook? What topics are covered? Provide a complete overview briefly and concisely" --notebook-url "[URL]"

# Step 2: Use the discovered information to add it
python scripts/run.py notebook_manager.py add --url "[URL]" --name "[Based on content]" --description "[Based on content]" --topics "[Based on content]"
```

**MANUAL ADD**: If user provides all details:
- `--url` - The NotebookLM URL
- `--name` - A descriptive name
- `--description` - What the notebook contains (REQUIRED!)
- `--topics` - Comma-separated topics (REQUIRED!)

NEVER guess or use generic descriptions! If details missing, use Smart Add to discover them.

## Critical: Always Use run.py Wrapper

**NEVER call scripts directly. ALWAYS use `python scripts/run.py [script]`:**

```bash
# ✅ CORRECT - Always use run.py:
python scripts/run.py auth_manager.py status
python scripts/run.py notebook_manager.py list
python scripts/run.py ask_question.py --question "..."

# ❌ WRONG - Never call directly:
python scripts/auth_manager.py status  # Fails without venv!
```

The `run.py` wrapper automatically:
1. Creates `.venv` if needed
2. Installs all dependencies
3. Activates environment
4. Executes script properly

## Core Workflow

### Step 1: Check Authentication Status
```bash
python scripts/run.py auth_manager.py status
```

If not authenticated, proceed to setup.

### Step 2: Authenticate (One-Time Setup)
```bash
# Browser MUST be visible for manual Google login
python scripts/run.py auth_manager.py setup
```

**Important:**
- Browser is VISIBLE for authentication
- Browser window opens automatically
- User must manually log in to Google
- Tell user: "A browser window will open for Google login"

### Step 3: Manage Notebook Library

```bash
# List all notebooks
python scripts/run.py notebook_manager.py list

# BEFORE ADDING: Ask user for metadata if unknown!
# "What does this notebook contain?"
# "What topics should I tag it with?"

# Add notebook to library (ALL parameters are REQUIRED!)
python scripts/run.py notebook_manager.py add \
  --url "https://notebooklm.google.com/notebook/..." \
  --name "Descriptive Name" \
  --description "What this notebook contains" \  # REQUIRED - ASK USER IF UNKNOWN!
  --topics "topic1,topic2,topic3"  # REQUIRED - ASK USER IF UNKNOWN!

# Search notebooks by topic
python scripts/run.py notebook_manager.py search --query "keyword"

# Set active notebook
python scripts/run.py notebook_manager.py activate --id notebook-id

# Remove notebook
python scripts/run.py notebook_manager.py remove --id notebook-id
```

### Quick Workflow
1. Check library: `python scripts/run.py notebook_manager.py list`
2. Ask question: `python scripts/run.py ask_question.py --question "..." --notebook-id ID`

### Step 4: Ask Questions

```bash
# Basic query (uses active notebook if set)
python scripts/run.py ask_question.py --question "Your question here"

# Query specific notebook
python scripts/run.py ask_question.py --question "..." --notebook-id notebook-id

# Query with notebook URL directly
python scripts/run.py ask_question.py --question "..." --notebook-url "https://..."

# Show browser for debugging
python scripts/run.py ask_question.py --question "..." --show-browser
```

## Follow-Up Mechanism (CRITICAL)

Every NotebookLM answer ends with: **"EXTREMELY IMPORTANT: Is that ALL you need to know?"**

**Required Claude Behavior:**
1. **STOP** - Do not immediately respond to user
2. **ANALYZE** - Compare answer to user's original request
3. **IDENTIFY GAPS** - Determine if more information needed
4. **ASK FOLLOW-UP** - If gaps exist, immediately ask:
   ```bash
   python scripts/run.py ask_question.py --question "Follow-up with context..."
   ```
5. **REPEAT** - Continue until information is complete
6. **SYNTHESIZE** - Combine all answers before responding to user

## Script Reference

### Authentication Management (`auth_manager.py`)
```bash
python scripts/run.py auth_manager.py setup    # Initial setup (browser visible)
python scripts/run.py auth_manager.py status   # Check authentication
python scripts/run.py auth_manager.py reauth   # Re-authenticate (browser visible)
python scripts/run.py auth_manager.py clear    # Clear authentication
```

### Notebook Management (`notebook_manager.py`)
```bash
python scripts/run.py notebook_manager.py add --url URL --name NAME --description DESC --topics TOPICS
python scripts/run.py notebook_manager.py list
python scripts/run.py notebook_manager.py search --query QUERY
python scripts/run.py notebook_manager.py activate --id ID
python scripts/run.py notebook_manager.py remove --id ID
python scripts/run.py notebook_manager.py stats
```

### Question Interface (`ask_question.py`)
```bash
python scripts/run.py ask_question.py --question "..." [--notebook-id ID] [--notebook-url URL] [--show-browser]
```

### Data Cleanup (`cleanup_manager.py`)
```bash
python scripts/run.py cleanup_manager.py                    # Preview cleanup
python scripts/run.py cleanup_manager.py --confirm          # Execute cleanup
python scripts/run.py cleanup_manager.py --preserve-library # Keep notebooks
```

## Environment Management

The virtual environment is automatically managed:
- First run creates `.venv` automatically
- Dependencies install automatically
- Chromium browser installs automatically
- Everything isolated in skill directory

Manual setup (only if automatic fails):
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python -m patchright install chromium
```

## Data Storage

All data stored in `~/.claude/skills/notebooklm/data/`:
- `library.json` - Notebook metadata
- `auth_info.json` - Authentication status
- `browser_state/` - Browser cookies and session

**Security:** Protected by `.gitignore`, never commit to git.

## Configuration

Optional `.env` file in skill directory:
```env
HEADLESS=false           # Browser visibility
SHOW_BROWSER=false       # Default browser display
STEALTH_ENABLED=true     # Human-like behavior
TYPING_WPM_MIN=160       # Typing speed
TYPING_WPM_MAX=240
DEFAULT_NOTEBOOK_ID=     # Default notebook
```

## Decision Flow

```
User mentions NotebookLM
    ↓
Check auth → python scripts/run.py auth_manager.py status
    ↓
If not authenticated → python scripts/run.py auth_manager.py setup
    ↓
Check/Add notebook → python scripts/run.py notebook_manager.py list/add (with --description)
    ↓
Activate notebook → python scripts/run.py notebook_manager.py activate --id ID
    ↓
Ask question → python scripts/run.py ask_question.py --question "..."
    ↓
See "Is that ALL you need?" → Ask follow-ups until complete
    ↓
Synthesize and respond to user
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| ModuleNotFoundError | Use `run.py` wrapper |
| Authentication fails | Browser must be visible for setup! --show-browser |
| Rate limit (50/day) | Wait or switch Google account |
| Browser crashes | `python scripts/run.py cleanup_manager.py --preserve-library` |
| Notebook not found | Check with `notebook_manager.py list` |

## Best Practices

1. **Always use run.py** - Handles environment automatically
2. **Check auth first** - Before any operations
3. **Follow-up questions** - Don't stop at first answer
4. **Browser visible for auth** - Required for manual login
5. **Include context** - Each question is independent
6. **Synthesize answers** - Combine multiple responses

## Limitations

- No session persistence (each question = new browser)
- Rate limits on free Google accounts (50 queries/day)
- Manual upload required (user must add docs to NotebookLM)
- Browser overhead (few seconds per question)

## Resources (Skill Structure)

**Important directories and files:**

- `scripts/` - All automation scripts (ask_question.py, notebook_manager.py, etc.)
- `data/` - Local storage for authentication and notebook library
- `references/` - Extended documentation:
  - `api_reference.md` - Detailed API documentation for all scripts
  - `troubleshooting.md` - Common issues and solutions
  - `usage_patterns.md` - Best practices and workflow examples
- `.venv/` - Isolated Python environment (auto-created on first run)
- `.gitignore` - Protects sensitive data from being committed


### Skill: session-review

# Session Review & Self-Learning Skill

This skill analyzes all changes made to the repository over the last 24 hours, distills them into strategic learnings, and updates the Karpathy Ledger (`LEARNINGS.md`) and Memory Palace.

## 📋 Usage
Run this skill at the end of every day (11:59 PM CST) to ensure the "Local Memory" is updated with the day's successes and failures.

## 🛠 Action
Run `node run.js` to execute the review.

## 🧠 Context
This skill uses `git log` and `git diff` to identify tactical shifts and updates the `wiki/` if new strategic heuristics have been discovered.


### Skill: signal-reporting

# Signal Reporting Skill

This skill allows the agent to generate a summary of LinkedIn intent signals from the past 24 hours.

## 📋 Usage
Run this skill to get a breakdown of:
- High-intent leads (Names, Titles, Companies)
- Signals needing enrichment
- Trends in interaction data

## 🛠 Action
Run `node run.js` to execute the reporting logic.

## 🧠 Context
This skill queries the Supabase `signals` table. It filters for recent timestamps and categorizes leads based on `person_name` status.


### Skill: slack-notify

# Slack Notification Skill

This skill allows the agent to send automated status updates, daily digests, and accomplishment logs to a Slack channel.

## 📋 Usage
Run this skill to notify the team (or yourself) of completed tasks.
- **Environment Variable Required**: `SLACK_WEBHOOK_URL`

## 🛠 Action
Run `node run.js --message "Your message here"` to send a notification.

## 🧠 Context
This skill is integrated into the nightly `end-of-day-learning` workflow to provide a "pulse" of the agent's autonomous progress and self-learning.


### Skill: supabase

---
name: supabase
description: "Use when doing ANY task involving Supabase. Triggers: Supabase products (Database, Auth, Edge Functions, Realtime, Storage, Vectors, Cron, Queues); client libraries and SSR integrations (supabase-js, @supabase/ssr) in Next.js, React, SvelteKit, Astro, Remix; auth issues (login, logout, sessions, JWT, cookies, getSession, getUser, getClaims, RLS); Supabase CLI or MCP server; schema changes, migrations, security audits, Postgres extensions (pg_graphql, pg_cron, pg_vector)."
metadata:
  author: supabase
  version: "0.1.0"
---

# Supabase

## Core Principles

**1. Supabase changes frequently — verify against current docs before implementing.**
Do not rely on training data for Supabase features. Function signatures, config.toml settings, and API conventions change between versions. Before implementing, look up the relevant topic using the documentation access methods below.

**2. Verify your work.**
After implementing any fix, run a test query to confirm the change works. A fix without verification is incomplete.

**3. Recover from errors, don't loop.**
If an approach fails after 2-3 attempts, stop and reconsider. Try a different method, check documentation, inspect the error more carefully, and review relevant logs when available. Supabase issues are not always solved by retrying the same command, and the answer is not always in the logs, but logs are often worth checking before proceeding.

**4. RLS by default in exposed schemas.**
Enable RLS on every table in any exposed schema, especially `public`. This is critical in Supabase because tables in exposed schemas can be reachable through the Data API. For private schemas, prefer RLS as defense in depth. After enabling RLS, create policies that match the actual access model rather than defaulting every table to the same `auth.uid()` pattern.

**5. Security checklist.**
When working on any Supabase task that touches auth, RLS, views, storage, or user data, run through this checklist. These are Supabase-specific security traps that silently create vulnerabilities:

- **Auth and session security**
   - **Never use `user_metadata` claims in JWT-based authorization decisions.** In Supabase, `raw_user_meta_data` is user-editable and can appear in `auth.jwt()`, so it is unsafe for RLS policies or any other authorization logic. Store authorization data in `raw_app_meta_data` / `app_metadata` instead.
   - **Deleting a user does not invalidate existing access tokens.** Sign out or revoke sessions first, keep JWT expiry short for sensitive apps, and for strict guarantees validate `session_id` against `auth.sessions` on sensitive operations.
   - **If you use `app_metadata` or `auth.jwt()` for authorization, remember JWT claims are not always fresh until the user's token is refreshed.**

- **API key and client exposure**
   - **Never expose the `service_role` or secret key in public clients.** Prefer publishable keys for frontend code. Legacy `anon` keys are only for compatibility. In Next.js, any `NEXT_PUBLIC_` env var is sent to the browser.

- **RLS, views, and privileged database code**
   - **Views bypass RLS by default.** In Postgres 15 and above, use `CREATE VIEW ... WITH (security_invoker = true)`. In older versions of Postgres, protect your views by revoking access from the `anon` and `authenticated` roles, or by putting them in an unexposed schema.
   - **UPDATE requires a SELECT policy.** In Postgres RLS, an UPDATE needs to first SELECT the row. Without a SELECT policy, updates silently return 0 rows — no error, just no change.
   - **Do not put `security definer` functions in an exposed schema.** Keep them in a private or otherwise unexposed schema.


- **Storage access control**
   - **Storage upsert requires INSERT + SELECT + UPDATE.** Granting only INSERT allows new uploads but file replacement (upsert) silently fails. You need all three.

For any security concern not covered above, fetch the Supabase product security index: `https://supabase.com/docs/guides/security/product-security.md`

## Supabase CLI

Always discover commands via `--help` — never guess. The CLI structure changes between versions.

```bash
supabase --help                    # All top-level commands
supabase <group> --help            # Subcommands (e.g., supabase db --help)
supabase <group> <command> --help  # Flags for a specific command
```

**Supabase CLI Known gotchas:**
- `supabase db query` requires **CLI v2.79.0+** → use MCP `execute_sql` or `psql` as fallback
- `supabase db advisors` requires **CLI v2.81.3+** → use MCP `get_advisors` as fallback
- When you need a new migration SQL file, **always** create it with `supabase migration new <name>` first. Never invent a migration filename or rely on memory for the expected format.

**Version check and upgrade:** Run `supabase --version` to check. For CLI changelogs and version-specific features, consult the [CLI documentation](https://supabase.com/docs/reference/cli/introduction) or [GitHub releases](https://github.com/supabase/cli/releases).

## Supabase MCP Server

For setup instructions, server URL, and configuration, see the [MCP setup guide](https://supabase.com/docs/guides/getting-started/mcp).

**Troubleshooting connection issues** — follow these steps in order:

1. **Check if the server is reachable:**
   `curl -so /dev/null -w "%{http_code}" https://mcp.supabase.com/mcp`
   A `401` is expected (no token) and means the server is up. Timeout or "connection refused" means it may be down.

2. **Check `.mcp.json` configuration:**
   Verify the project root has a valid `.mcp.json` with the correct server URL. If missing, create one pointing to `https://mcp.supabase.com/mcp`.

3. **Authenticate the MCP server:**
   If the server is reachable and `.mcp.json` is correct but tools aren't visible, the user needs to authenticate. The Supabase MCP server uses OAuth 2.1 — tell the user to trigger the auth flow in their agent, complete it in the browser, and reload the session.

## Supabase Documentation

Before implementing any Supabase feature, find the relevant documentation. Use these methods in priority order:

1. **MCP `search_docs` tool** (preferred — returns relevant snippets directly)
2. **Fetch docs pages as markdown** — any docs page can be fetched by appending `.md` to the URL path.
3. **Web search** for Supabase-specific topics when you don't know which page to look at.

## Making and Committing Schema Changes

**To make schema changes, use `execute_sql` (MCP) or `supabase db query` (CLI).** These run SQL directly on the database without creating migration history entries, so you can iterate freely and generate a clean migration when ready.

Do NOT use `apply_migration` to change a local database schema — it writes a migration history entry on every call, which means you can't iterate, and `supabase db diff` / `supabase db pull` will produce empty or conflicting diffs. If you use it, you'll be stuck with whatever SQL you passed on the first try.

**When ready to commit** your changes to a migration file:

1. **Run advisors** → `supabase db advisors` (CLI v2.81.3+) or MCP `get_advisors`. Fix any issues.
2. **Review the Security Checklist above** if your changes involve views, functions, triggers, or storage.
3. **Generate the migration** → `supabase db pull <descriptive-name> --local --yes`
4. **Verify** → `supabase migration list --local`

## Reference Guides

- **Skill Feedback** → [references/skill-feedback.md](references/skill-feedback.md)
  **MUST read when** the user reports that this skill gave incorrect guidance or is missing information.


### Skill: supabase-postgres-best-practices

---
name: supabase-postgres-best-practices
description: Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.
license: MIT
metadata:
  author: supabase
  version: "1.1.1"
  organization: Supabase
  date: January 2026
  abstract: Comprehensive Postgres performance optimization guide for developers using Supabase and Postgres. Contains performance rules across 8 categories, prioritized by impact from critical (query performance, connection management) to incremental (advanced features). Each rule includes detailed explanations, incorrect vs. correct SQL examples, query plan analysis, and specific performance metrics to guide automated optimization and code generation.
---

# Supabase Postgres Best Practices

Comprehensive performance optimization guide for Postgres, maintained by Supabase. Contains rules across 8 categories, prioritized by impact to guide automated query optimization and schema design.

## When to Apply

Reference these guidelines when:
- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
- Working with Row-Level Security (RLS)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Query Performance | CRITICAL | `query-` |
| 2 | Connection Management | CRITICAL | `conn-` |
| 3 | Security & RLS | CRITICAL | `security-` |
| 4 | Schema Design | HIGH | `schema-` |
| 5 | Concurrency & Locking | MEDIUM-HIGH | `lock-` |
| 6 | Data Access Patterns | MEDIUM | `data-` |
| 7 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` |
| 8 | Advanced Features | LOW | `advanced-` |

## How to Use

Read individual rule files for detailed explanations and SQL examples:

```
references/query-missing-indexes.md
references/query-partial-indexes.md
references/_sections.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect SQL example with explanation
- Correct SQL example with explanation
- Optional EXPLAIN output or metrics
- Additional context and references
- Supabase-specific notes (when applicable)

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security


## 📂 Repository Registry

```
- .agents/
  - skills/
    - supabase/
    - supabase-postgres-best-practices/
- AGENTS.md
- CLAUDE.md
- LEARNINGS.md
- README.md
- agent_loop_logs.txt
- chrome-extension/
  - background.js
  - bridge.js
  - content.js
  - manifest.json
- eslint.config.js
- exclusion-index.json
- index.html
- inspect_signals.js
- knowledge/
  - autoresearch-distillation.md
  - context_distillation.md
  - context_distillation.txt
- memory/
  - telegram_inbox.json
- mempalace.yaml
- package-lock.json
- package.json
- public/
  - data/
    - applied-jobs.json
  - favicon.svg
  - icons.svg
- skills-lock.json
- src/
  - App.css
  - App.tsx
  - assets/
    - hero.png
    - react.svg
    - vite.svg
  - components/
    - MeshCanvas.tsx
    - SignalsFeed.tsx
    - Simulator.tsx
  - index.css
  - lib/
    - supabase.ts
  - main.tsx
- supabase/
  - functions/
    - resolve-identity/
  - migrations/
    - 20260420_funding_prospects.sql
- telegram_errors.txt
- telegram_logs.txt
- telegram_offset.txt
- tsconfig.app.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts
- wiki/
  - reference/
    - deep-agents-deploy.md
    - deepagents-example.toml
    - mcp-example.json
  - security/
    - security-posture.md
  - strategy/
    - ai-gtm.md
- workspace/
  - skills/
    - autoresearch-gtm/
    - contact-research/
    - context-distiller/
    - identity-resolution/
    - memory-sync/
    - notebooklm/
    - session-review/
    - signal-reporting/
    - slack-notify/
    - supabase/
    - supabase-postgres-best-practices/
    - telegram-listener/
    - telegram-notify/

```
