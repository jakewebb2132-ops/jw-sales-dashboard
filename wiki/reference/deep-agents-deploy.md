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
