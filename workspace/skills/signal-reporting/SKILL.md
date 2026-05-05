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
