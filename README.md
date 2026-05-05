# ⚡️ Sales Command Center

An open-source, model-agnostic agent harness for high-intensity LinkedIn signal intelligence and AI-first GTM operations.

## 🚀 Deep Agents Deploy
This project is configured as a **Deep Agent**, an open alternative to Claude Managed Agents. It uses the `deepagents` harness to own its memory and orchestration logic.

### Core Components
- **`deepagents.toml`**: Agent configuration (Identity & Sandbox).
- **`AGENTS.md`**: Core memory and instruction set (The "AI-Pilled" GTM Thesis).
- **`skills/`**: Encapsulated agent skills for Identity Resolution and Signal Reporting.
- **`mcp.json`**: Model Context Protocol configuration for tool access.

## 🧠 AI-First GTM Thesis
The Sales Command Center follows the "AI-Pilled" playbook:
1. **Pillar 1: WebSearch Enrichment**: Resolve anonymous signals into high-intent profiles.
2. **Pillar 2: Signal Intelligence**: Real-time monitoring of interaction intent.
3. **Pillar 3: Data Flywheel**: Continuous enrichment of the Supabase memory palace.

## 🛠 Tech Stack
- **Frontend**: React 19, Vite 8, TailwindCSS 4, Framer Motion.
- **Backend**: Supabase (PostgreSQL + Realtime).
- **Agent Harness**: [Deep Agents](https://deepagents.com) (TypeScript).
- **Deployment**: LangSmith Deployment.

## 🔄 Development Workflow
Follow the **Plan-Execute-Verify** protocol:
- **Think**: Outline strategic alignment.
- **Plan**: Codify logic into `skills/`.
- **Execute**: Use `deepagents deploy` to push updates.
- **Verify**: Monitor signal quality on the dashboard.

---
Built for the open world. Own your memory. No vendor lock-in.
