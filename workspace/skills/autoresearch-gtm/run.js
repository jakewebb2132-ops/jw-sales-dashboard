/**
 * Autoresearch GTM — Autonomous self-improvement loop for contact resolution.
 * Adapted from github.com/karpathy/autoresearch.
 *
 * Metric:   resolution_rate = resolved / tested * 100 (higher = better)
 * Modifies: workspace/skills/contact-research/run.js (PROMPT_TEMPLATE only)
 * Loop:     propose → test → keep if better → revert if not → repeat
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith('--batch='))?.split('=')[1] ?? '10');
const MAX_EXPERIMENTS = parseInt(process.argv.find(a => a.startsWith('--max-experiments='))?.split('=')[1] ?? 'Infinity');
const RESULTS_TSV = path.join(process.cwd(), 'workspace/skills/autoresearch-gtm/results.tsv');
const CONTACT_RESEARCH_PATH = path.join(process.cwd(), 'workspace/skills/contact-research/run.js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', timeout: 120000, ...opts });
}

function gitCommitHash() {
  return run('git rev-parse --short HEAD').trim();
}

function logResult(commit, rate, status, description) {
  if (!fs.existsSync(RESULTS_TSV)) {
    fs.writeFileSync(RESULTS_TSV, 'commit\tresolution_rate\tstatus\tdescription\n');
  }
  fs.appendFileSync(RESULTS_TSV, `${commit}\t${rate.toFixed(2)}\t${status}\t${description}\n`);
}

function readCurrentPromptTemplate() {
  const src = fs.readFileSync(CONTACT_RESEARCH_PATH, 'utf8');
  const match = src.match(/const PROMPT_TEMPLATE = \(orgName, context\) => `([\s\S]*?)`;/);
  return match?.[1] ?? null;
}

function applyNewPromptTemplate(newBody) {
  const src = fs.readFileSync(CONTACT_RESEARCH_PATH, 'utf8');
  const updated = src.replace(
    /const PROMPT_TEMPLATE = \(orgName, context\) => `[\s\S]*?`;/,
    `const PROMPT_TEMPLATE = (orgName, context) => \`${newBody}\`;`
  );
  fs.writeFileSync(CONTACT_RESEARCH_PATH, updated);
}

// ---------------------------------------------------------------------------
// Measure resolution rate on a fixed signal batch
// ---------------------------------------------------------------------------

async function measureResolutionRate(signals) {
  const { researchContact } = await import(`${CONTACT_RESEARCH_PATH}?ts=${Date.now()}`);
  let resolved = 0;

  for (const signal of signals) {
    if (!signal.interaction_text?.includes('at')) continue;
    const org = signal.interaction_text.split('at')[1].trim();
    const result = await researchContact(org, signal.interaction_text);
    if (result?.person_name) resolved++;
  }

  return (resolved / signals.length) * 100;
}

// ---------------------------------------------------------------------------
// Ask Claude to propose a prompt improvement
// ---------------------------------------------------------------------------

function proposePromptImprovement(currentPrompt, resultsHistory) {
  const historyStr = resultsHistory.length
    ? `\nPrevious experiments:\n${resultsHistory.slice(-5).map(r => `- ${r.status} (${r.rate.toFixed(1)}%): ${r.description}`).join('\n')}`
    : '';

  const prompt = `You are optimizing a B2B contact research prompt for an AI agent. The prompt is used to find decision-makers at organizations via web search.

Current PROMPT_TEMPLATE body (the content between backtick markers):
\`\`\`
${currentPrompt}
\`\`\`
${historyStr}

Propose ONE specific improvement to this prompt that might improve the resolution rate (% of orgs successfully matched to a named person). Focus on:
- Better persona targeting language
- More specific LinkedIn URL finding instructions
- Smarter fallback logic for obscure orgs
- Clearer JSON output enforcement

Rules:
- Return ONLY the new prompt body text, no commentary, no backticks
- Keep orgName and context template literals (${'{'}orgName{'}'}, ${'{'}context{'}'}) intact
- The prompt must end with the JSON structure and "return only the word: null" fallback
- Simpler is better — don't add complexity without clear reason`;

  const output = run(
    `claude -p ${JSON.stringify(prompt)} --output-format json`,
    { timeout: 30000 }
  );
  const parsed = JSON.parse(output);
  return parsed.result?.trim() ?? null;
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

async function main() {
  console.log('🔬 Autoresearch GTM — Autonomous Experiment Loop');
  console.log(`   Batch size: ${BATCH_SIZE} | Max experiments: ${MAX_EXPERIMENTS}\n`);

  // Fetch fixed test batch (Pending Enrichment signals)
  const { data: batch, error } = await supabase
    .from('signals')
    .select('*')
    .eq('person_name', 'Pending Enrichment')
    .limit(BATCH_SIZE);

  if (error || !batch?.length) {
    console.log('⚠️  No Pending Enrichment signals to test on. Run identity-resolution first to generate test data.');
    process.exit(0);
  }

  console.log(`📦 Test batch: ${batch.length} unresolved signals\n`);

  // Establish baseline
  console.log('📊 Measuring baseline resolution rate...');
  const baselineRate = await measureResolutionRate(batch);
  const baselineCommit = gitCommitHash();
  logResult(baselineCommit, baselineRate, 'baseline', 'baseline — unmodified prompt');
  console.log(`   Baseline: ${baselineRate.toFixed(1)}% resolution rate\n`);

  const history = [{ rate: baselineRate, status: 'baseline', description: 'baseline' }];
  let bestRate = baselineRate;
  let experimentNum = 0;

  // Experiment loop
  while (experimentNum < MAX_EXPERIMENTS) {
    experimentNum++;
    console.log(`\n━━━ Experiment #${experimentNum} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // 1. Read current prompt
    const currentPrompt = readCurrentPromptTemplate();
    if (!currentPrompt) {
      console.error('❌ Could not parse PROMPT_TEMPLATE from contact-research/run.js');
      break;
    }

    // 2. Propose improvement
    console.log('🤖 Proposing prompt improvement...');
    const newPrompt = proposePromptImprovement(currentPrompt, history);
    if (!newPrompt || newPrompt === currentPrompt) {
      console.log('   No meaningful change proposed — skipping.');
      continue;
    }

    // 3. Apply and commit
    applyNewPromptTemplate(newPrompt);
    run('git add workspace/skills/contact-research/run.js');

    // Extract first meaningful line as description
    const description = newPrompt.split('\n').find(l => l.trim().length > 10)?.trim().slice(0, 80) ?? 'prompt update';
    run(`git commit -m "autoresearch-gtm experiment #${experimentNum}: ${description}"`);
    const commitHash = gitCommitHash();
    console.log(`   Committed: ${commitHash}`);

    // 4. Measure new rate
    console.log('🔎 Testing new prompt...');
    const newRate = await measureResolutionRate(batch);
    console.log(`   Result: ${newRate.toFixed(1)}% (was ${bestRate.toFixed(1)}%)`);

    // 5. Keep or revert
    if (newRate > bestRate) {
      console.log(`   ✅ KEEP — improved by ${(newRate - bestRate).toFixed(1)}%`);
      logResult(commitHash, newRate, 'keep', description);
      history.push({ rate: newRate, status: 'keep', description });
      bestRate = newRate;
    } else {
      console.log(`   ↩️  DISCARD — no improvement, reverting`);
      run('git reset --hard HEAD~1');
      logResult(commitHash, newRate, 'discard', description);
      history.push({ rate: newRate, status: 'discard', description });
    }

    console.log(`   Best so far: ${bestRate.toFixed(1)}%`);
  }

  console.log('\n━━━ Experiment loop complete ━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Experiments run: ${experimentNum}`);
  console.log(`   Baseline:        ${baselineRate.toFixed(1)}%`);
  console.log(`   Best achieved:   ${bestRate.toFixed(1)}%`);
  console.log(`   Improvement:     +${(bestRate - baselineRate).toFixed(1)}%`);
  console.log(`   Results log:     ${RESULTS_TSV}`);
}

main().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
