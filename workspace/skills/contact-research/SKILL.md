# Contact Research Skill

Live AI-powered identity resolution for unknown organizations. Uses Claude with web search to find the highest-value decision-maker at any org — the person most likely to be the LinkedIn signal source.

## Pillar Alignment
- **Pillar 1** (Identity Resolution): Resolves anonymous org signals to a named person.
- **Pillar 3** (Data Flywheel): Discovered contacts are written back to Supabase, enriching the memory registry permanently.

## Usage

### Standalone (CLI)
```bash
node workspace/skills/contact-research/run.js "Southridge School"
node workspace/skills/contact-research/run.js "Maildoso" "viewed LinkedIn profile"
```

### As a Module (imported by other skills)
```js
import { researchContact } from './workspace/skills/contact-research/run.js';

const contact = await researchContact('Southridge School');
// Returns: { person_name, person_title, person_company, linkedin_url, confidence, source }
// Returns: null if no confident match found
```

## Output Schema
| Field | Description |
|---|---|
| `person_name` | Full name of resolved contact |
| `person_title` | Job title |
| `person_company` | Organization name (normalized) |
| `linkedin_url` | LinkedIn profile URL |
| `confidence` | `high` / `medium` / `low` |
| `source` | Search query used to find the contact |

## Target Persona Logic
Claude is instructed to prioritize decision-makers in this order:
1. CMO / VP Marketing / Head of Communications
2. CTO / VP Engineering / Head of Data & AI
3. CEO / Executive Director (for smaller orgs)

## Required ENV
- `ANTHROPIC_API_KEY` — Claude API key with web search access
