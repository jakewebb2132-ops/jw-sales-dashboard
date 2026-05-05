# Autoresearch — Knowledge Distillation
**Source**: https://github.com/karpathy/autoresearch  
**Author**: Andrej Karpathy, March 2026  
**Purpose**: Reference for applying autonomous self-improvement loops to GTM agent infrastructure.

---

## Core Concept

Give an AI agent a fixed target metric and a single editable file. Let it experiment autonomously — modify, test, keep if better, revert if not, repeat forever. You wake up to a log of experiments and a better system.

**The three-file architecture:**
- `prepare.py` — fixed constants, evaluation harness. **Never modified.**
- `train.py` — the one file the agent edits. Everything is fair game.
- `program.md` — instructions for the agent. The human edits this over time.

**The metric**: `val_bpb` (validation bits per byte). Lower = better. Fixed 5-minute training budget per experiment.

---

## Experiment Loop (verbatim from program.md)

```
LOOP FOREVER:
1. Look at git state: current branch/commit
2. Modify train.py with an experimental idea
3. git commit
4. Run experiment, redirect output: uv run train.py > run.log 2>&1
5. Read results: grep "^val_bpb:\|^peak_vram_mb:" run.log
6. If grep empty → crashed. Read tail -n 50 run.log, attempt fix or skip.
7. Log to results.tsv (untracked by git)
8. If val_bpb improved → advance branch (keep commit)
9. If equal or worse → git reset back to start
```

**NEVER STOP**: Once running, do not pause to ask the human. Run until manually interrupted.

---

## Results Logging (results.tsv)

Tab-separated (NOT comma-separated):
```
commit  val_bpb  memory_gb  status  description
a1b2c3d 0.997900 44.0       keep    baseline
b2c3d4e 0.993200 44.2       keep    increase LR to 0.04
c3d4e5f 1.005000 44.0       discard switch to GeLU activation
d4e5f6g 0.000000 0.0        crash   double model width (OOM)
```

Fields: git commit (7 chars), metric value, memory GB, status (`keep`/`discard`/`crash`), description.

---

## Design Principles (applicable to GTM)

1. **Single file to modify.** Agent only touches one thing. Keeps scope manageable and diffs reviewable.
2. **Fixed time/cost budget.** Experiments are directly comparable regardless of what changes.
3. **Simplicity criterion.** A small improvement that adds ugly complexity is not worth it. Removing code and getting equal results is a win.
4. **Metric is king.** Everything is evaluated against one number. No subjective judgment.
5. **Branch-per-run.** `autoresearch/<tag>`. Results.tsv is untracked — it's ephemeral state, not history.
6. **Timeout rule.** If a run exceeds 2x the time budget, kill it and treat as failure.
7. **Crash handling.** Easy fixes (typo, missing import) → fix and retry. Fundamentally broken → log crash, move on.

---

## GTM Adaptation Map

| autoresearch concept | GTM Sales Command equivalent |
|---|---|
| `train.py` | `workspace/skills/contact-research/run.js` (the prompt/strategy) |
| `val_bpb` (lower=better) | `resolution_rate` (higher=better) |
| 5-minute time budget | Fixed signal batch size (e.g. 20 signals per experiment) |
| `results.tsv` | `workspace/skills/autoresearch-gtm/results.tsv` |
| `program.md` | `workspace/skills/autoresearch-gtm/SKILL.md` |
| GPU memory constraint | Supabase API rate limits |
| "baseline run" | Current resolution rate before any prompt changes |
| Revert on regression | `git reset --hard HEAD~1` on contact-research |

---

## Key Quotes for Agent Context

> "The idea: give an AI agent a small but real LLM training setup and let it experiment autonomously overnight."

> "You are programming the `program.md` Markdown files that provide context to the AI agents and set up your autonomous research org."

> "NEVER STOP: Once the experiment loop has begun, do NOT pause to ask the human if you should continue."

> "Simplicity criterion: All else being equal, simpler is better. A 0.001 improvement that adds 20 lines of hacky code? Probably not worth it."

---

## Setup Checklist (original repo)

Requirements: Single NVIDIA GPU, Python 3.10+, uv.
```bash
uv sync
uv run prepare.py   # one-time: downloads data, trains tokenizer
uv run train.py     # single experiment (~5 min)
```
To run agent: open Claude Code in repo, disable all permissions, prompt: "have a look at program.md and let's kick off a new experiment."
