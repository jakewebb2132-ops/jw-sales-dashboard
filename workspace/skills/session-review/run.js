import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function reviewSession() {
  console.log("🧐 Reviewing the day's accomplishments...");

  const root = process.cwd();
  const learningsPath = path.join(root, 'LEARNINGS.md');

  // 1. Get git changes from the last 24 hours
  let diffSummary = "";
  try {
    diffSummary = execSync('git log --since="24 hours ago" --oneline', { encoding: 'utf8' });
  } catch (e) {
    diffSummary = "No recent commits found.";
  }

  // 2. Format the learning entry
  const entry = `\n## 🗓 Review: ${new Date().toLocaleDateString()}\n\n`;
  const summary = `### Tactical Output\n${diffSummary || "No tactical changes logged."}\n\n`;

  // 3. Append to LEARNINGS.md
  if (fs.existsSync(learningsPath)) {
    fs.appendFileSync(learningsPath, entry + summary);
  } else {
    fs.writeFileSync(learningsPath, "# Karpathy Learning Ledger\n" + entry + summary);
  }

  // 4. Sync to central Knowledge Base
  const centralLEARNINGS = '/Users/jake/my-knowledge-base/LEARNINGS.md';
  if (fs.existsSync(path.dirname(centralLEARNINGS))) {
    fs.copyFileSync(learningsPath, centralLEARNINGS);
    console.log("📡 Synced LEARNINGS.md to central registry.");
  }

  console.log("✅ Daily review complete and committed to local memory.");
}

reviewSession();
