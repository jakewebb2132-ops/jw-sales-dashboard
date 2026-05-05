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
