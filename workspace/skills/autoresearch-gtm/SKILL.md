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
