async function sendSlackNotify() {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  const message = process.argv.slice(2).join(' ') || "🚀 Mission accomplished: Task completed.";

  if (!webhook) {
    console.error("❌ Error: SLACK_WEBHOOK_URL environment variable is not set.");
    process.exit(1);
  }

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🤖 *Sales Command Agent Update*\n> ${message}`
      })
    });

    if (response.ok) {
      console.log("✅ Slack notification sent!");
    } else {
      console.error(`❌ Failed to send Slack notification: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`❌ Error sending Slack notification: ${error.message}`);
  }
}

sendSlackNotify();
