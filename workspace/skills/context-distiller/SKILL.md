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
