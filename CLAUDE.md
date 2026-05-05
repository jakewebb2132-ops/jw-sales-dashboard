# CLAUDE.md — Security & Development Protocols

## 🔐 Security-First Culture (Trail of Bits Standard)

1. **Sandbox Enforcement**: Always ensure `/sandbox` is active. Never attempt to read `~/.ssh`, `~/.aws`, or production `.env` files.
2. **Dependency Justification**: Before adding any package (via npm/bun), justify its necessity and assess its attack surface. Avoid speculative dependencies.
3. **Zero-Trust Input**: Treat all external signals (LinkedIn, Web Scraping) as untrusted data. Validate all schemas in `enrich_signals.js`.

## 🛠 Project Standards

- **Tech Stack**: Bun, React 19, Vite 8, Supabase, TailwindCSS 4.
- **Project Structure**: Chrome Extension for capture, Node scripts for enrichment, Vite dashboard for display.

## 🔄 AI Workflow: Think -> Plan -> Execute -> Verify

- **Prompt Contract**: Mandatory for complex work. Define Success and FAILURE criteria before execution.
- **Plan-Execute-Verify**: Codify recurring logic into skills.

Before making any changes, follow this mandatory sequence:
1. **Brainstorm**: Identify the goal and security implications.
2. **Plan**: Describe the changes and obtain user approval.
3. **Execute**: Perform the modifications with minimal diffs.
4. **Verify**: Check work via `npm test` or manual verification on the dev dashboard.

## 🧪 Verification Commands
- **Dev Server**: `bun run dev --port 5173`
- **Build**: `bun run build`
- **Enrichment Test**: `bun enrich_signals.js`

## 🚫 Restricted Activities
- No hardcoding of API keys or Supabase secrets.
- No editing of `.zshrc` or system configs.
- No direct `git push` without user review.
