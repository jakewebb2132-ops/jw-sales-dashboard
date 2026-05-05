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
