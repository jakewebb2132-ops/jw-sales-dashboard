import fs from 'fs';
import path from 'path';

/**
 * Context Distiller: Building a high-density knowledge artifact for NotebookLM.
 */
async function distillContext() {
  console.log("🛠 Distilling project context for NotebookLM...");

  const root = process.cwd();
  const knowledgeDir = path.join(root, 'knowledge');
  if (!fs.existsSync(knowledgeDir)) {
    fs.mkdirSync(knowledgeDir);
  }

  let distillation = `# Project Context Snapshot: Sales Command Center\n`;
  distillation += `Generated: ${new Date().toISOString()}\n\n`;

  // 1. Core Objectives
  if (fs.existsSync(path.join(root, 'AGENTS.md'))) {
    const agentsMd = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
    distillation += `## 🎯 Core Objectives\n\n${agentsMd}\n\n`;
  }

  // 2. Strategic Wiki
  distillation += `## 🧠 Strategic Wiki (Local Intelligence)\n\n`;
  const wikiPath = path.join(root, 'wiki');
  if (fs.existsSync(wikiPath)) {
    const wikiFiles = walkDir(wikiPath);
    wikiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      distillation += `### File: ${path.relative(root, file)}\n\n${content}\n\n`;
    });
  }

  // 3. Operational Skills
  distillation += `## 🛠 Operational Skills (Code Capabilities)\n\n`;
  const skillsPath = path.join(root, 'workspace', 'skills');
  if (fs.existsSync(skillsPath)) {
    const skillFiles = walkDir(skillsPath, 'SKILL.md');
    skillFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const skillName = path.dirname(path.relative(skillsPath, file));
      distillation += `### Skill: ${skillName}\n\n${content}\n\n`;
    });
  }

  // 4. Repository Structure
  distillation += `## 📂 Repository Registry\n\n\`\`\`\n`;
  distillation += getRepoMap(root);
  distillation += `\n\`\`\`\n`;

  const outputPath = path.join(knowledgeDir, 'context_distillation.md');
  fs.writeFileSync(outputPath, distillation);

  // Sync to central Knowledge Base
  const centralKB = '/Users/jake/my-knowledge-base/raw';
  if (fs.existsSync(centralKB)) {
    fs.copyFileSync(outputPath, path.join(centralKB, 'context_distillation.md'));
    fs.copyFileSync(outputPath, path.join(centralKB, 'context_distillation.txt'));
    console.log(`📡 Synced to central Knowledge Base: ${centralKB}`);
  }

  console.log(`✅ Distillation complete! Saved to ${outputPath}`);
  console.log("👉 Upload this file to NotebookLM to offload context window usage.");
}

function walkDir(dir, filter = '.md') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file, filter));
    } else {
      if (file.endsWith(filter)) results.push(file);
    }
  });
  return results;
}

function getRepoMap(dir, depth = 0) {
  if (depth > 2) return ''; 
  let map = '';
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file.startsWith('.') && file !== '.agents') return;
    if (file === 'node_modules') return;
    const stat = fs.statSync(path.join(dir, file));
    map += '  '.repeat(depth) + `- ${file}${stat.isDirectory() ? '/' : ''}\n`;
    if (stat.isDirectory()) {
      map += getRepoMap(path.join(dir, file), depth + 1);
    }
  });
  return map;
}

distillContext();
