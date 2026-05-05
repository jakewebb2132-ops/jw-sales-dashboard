import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const tgToken = "8615501866:AAFafj90KHa6EAexN3iqFMgV7OXrg65Jn3M";
const chatId = "8689871501";
const geminiKey = "AIzaSyADrh0JcLyyzVuVYvBQi5A2VpRITodfhdQ";

async function poll() {
  try {
    const r = await fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=5`);
    const d = await r.json();
    if (d.result && d.result.length > 0) {
      for (const u of d.result) {
        lastUpdateId = u.update_id;
        if (u.message && u.message.text) await handle(u.message.text);
      }
    }
  } catch (e) {
    fs.appendFileSync('telegram_errors.txt', e.message + "\n");
  }
  setTimeout(poll, 1000);
}

let lastUpdateId = 0;
async function handle(text) {
  console.log("Captured:", text);
  // Log locally
  fs.appendFileSync('memory/telegram_inbox.json', JSON.stringify({text}) + "\n");

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "You are the Sales Command Agent. Ground your response in the AGENTS.md mission. User says: " + text }] }] })
    });
    const result = await res.json();
    const answer = result.candidates[0].content.parts[0].text;

    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: answer, parse_mode: 'Markdown' })
    });
  } catch (e) {
    fs.appendFileSync('telegram_errors.txt', "Gemini Error: " + e.message + "\n");
  }
}
poll();
