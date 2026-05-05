async function sendTelegramNotify() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const message = process.argv.slice(2).join(' ') || "🚀 Mission accomplished: Task completed.";

  if (!token) {
    console.error("❌ Error: TELEGRAM_BOT_TOKEN environment variable is not set.");
    process.exit(1);
  }

  if (!chatId) {
    console.log("🔍 Extracting Chat ID...");
    const updates = await fetch(`https://api.telegram.org/bot${token}/getUpdates`).then(r => r.json());
    if (updates.result && updates.result.length > 0) {
      const discoveredId = updates.result[updates.result.length - 1].message.chat.id;
      console.log(`✅ Discovered Chat ID: ${discoveredId}`);
      console.log("PLEASE SAVE THIS TO YOUR .env AS TELEGRAM_CHAT_ID");
      // Use it for this run
      await broadcast(token, discoveredId, message);
    } else {
      console.error("❌ No messages found. Please message your bot on Telegram first!");
    }
    return;
  }

  await broadcast(token, chatId, message);
}

async function broadcast(token, chatId, message) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🤖 *Sales Command Agent*\n\n${message}`,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      console.log("✅ Telegram notification sent!");
    } else {
      console.error(`❌ Failed to send Telegram: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

sendTelegramNotify();
