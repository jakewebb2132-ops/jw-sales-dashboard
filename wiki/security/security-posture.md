# Security Posture & Protocols

Security is integrated into the agent's core loop. We follow a zero-trust model for external signals.

## Data Handling
1. **Zero-Trust Input**: All LinkedIn/Web signals are treated as untrusted. Validate schemas before ingestion.
2. **Credential Hygiene**: Never hardcode API keys. Use `.env` with specific provider prefixes (e.g., `ANTHROPIC_API_KEY`).
3. **Sandbox Enforcement**: All skill execution must happen within the LangSmith/Daytona sandbox.

## Access Control
- The Supabase Service Role key is restricted to the Enrichment Worker.
- Frontend access is limited to the Anon/Public key with RLS (Row Level Security) enforced.
