import { execSync } from 'child_process';
import 'dotenv/config';

const PROMPT_TEMPLATE = (orgName, context) => `
You are an elite B2B sales intelligence agent. Search the web and find the single highest-value decision-maker at "${orgName}" who is most likely responsible for AI, data, or marketing technology decisions.
${context ? `Signal context: "${context}"` : ''}

Prioritize in this order:
1. CMO / VP Marketing / Chief Communications Officer
2. CTO / VP Engineering / Head of Data & AI
3. CEO / Executive Director / Founder (for smaller orgs)

CRITICAL RULES:
- You MUST use web search to find real information
- Return ONLY a raw JSON object — no prose, no markdown, no explanation
- If you cannot find a confident match, return only the word: null

Required JSON structure:
{"person_name":"Full Name","person_title":"Job Title","person_company":"${orgName}","linkedin_url":"https://www.linkedin.com/in/username/","confidence":"high|medium|low","source":"how you found this"}
`.trim();

/**
 * Pillar 1: Live contact research using the Claude CLI (Pro plan, no API credits needed).
 *
 * @param {string} orgName - Organization to research
 * @param {string} [context] - Optional signal context
 * @returns {Promise<object|null>} Resolved contact or null
 */
export async function researchContact(orgName, context = '') {
  const prompt = PROMPT_TEMPLATE(orgName, context);

  console.log(`   🌐 Searching web for: ${orgName}...`);

  try {
    const output = execSync(
      `claude -p ${JSON.stringify(prompt)} --allowedTools WebSearch --output-format json`,
      { encoding: 'utf8', timeout: 60000 }
    );

    const parsed = JSON.parse(output);
    const result = parsed.result?.trim();

    if (!result || result === 'null') return null;

    // Strip markdown fences if present
    let raw = result.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

    // If Claude returned prose, try to extract a JSON object from within it
    if (!raw.startsWith('{')) {
      const jsonMatch = raw.match(/\{[\s\S]*"person_name"[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`   ℹ️  Agent returned no match.`);
        return null;
      }
      raw = jsonMatch[0];
    }

    const contact = JSON.parse(raw);

    if (!contact?.person_name || !contact?.linkedin_url) return null;

    return contact;
  } catch (err) {
    console.error(`   ❌ Research failed for "${orgName}":`, err.message?.split('\n')[0]);
    return null;
  }
}

// Standalone CLI: node run.js "Org Name" "optional context"
if (process.argv[1].endsWith('contact-research/run.js')) {
  const org = process.argv[2];
  const ctx = process.argv[3] ?? '';

  if (!org) {
    console.error('Usage: node run.js "Organization Name" ["optional context"]');
    process.exit(1);
  }

  console.log(`\n🔍 Contact Research: "${org}"\n`);
  const result = await researchContact(org, ctx);

  if (result) {
    console.log('\n✅ Resolved:');
    console.log(`   👤 ${result.person_name} — ${result.person_title}`);
    console.log(`   🏢 ${result.person_company}`);
    console.log(`   🔗 ${result.linkedin_url}`);
    console.log(`   📊 Confidence: ${result.confidence}`);
    console.log(`   📝 Source: ${result.source}`);
  } else {
    console.log('\n⚠️  No confident match found.');
  }
}
