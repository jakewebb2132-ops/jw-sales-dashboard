# Slack Notification Skill

This skill allows the agent to send automated status updates, daily digests, and accomplishment logs to a Slack channel.

## 📋 Usage
Run this skill to notify the team (or yourself) of completed tasks.
- **Environment Variable Required**: `SLACK_WEBHOOK_URL`

## 🛠 Action
Run `node run.js --message "Your message here"` to send a notification.

## 🧠 Context
This skill is integrated into the nightly `end-of-day-learning` workflow to provide a "pulse" of the agent's autonomous progress and self-learning.
