import os, requests, time, json, subprocess
from datetime import datetime

tg_token = "8615501866:AAFafj90KHa6EAexN3iqFMgV7OXrg65Jn3M"
chat_id = "8689871501"
gemini_key = "AIzaSyADrh0JcLyyzVuVYvBQi5A2VpRITodfhdQ"
inbox_file = "memory/telegram_inbox.json"
last_processed_idx = -1

def send_update(text):
    requests.post(f"https://api.telegram.org/bot{tg_token}/sendMessage", json={
        "chat_id": chat_id, "text": text, "parse_mode": "Markdown"
    })

def run_skill(skill_path, args=""):
    try:
        # Check if it's a python skill
        if os.path.exists(os.path.join(skill_path, "run.py")):
            cmd = f"python3 {os.path.join(skill_path, 'run.py')} {args}"
        else:
            # Fallback to simple shell execution if it's a generic command
            cmd = args
        
        result = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT, text=True)
        return f"✅ Success:\n```\n{result[:3000]}\n```"
    except Exception as e:
        return f"❌ Error:\n```\n{str(e)}\n```"

def process_tasks():
    global last_processed_idx
    if not os.path.exists(inbox_file): return
    
    with open(inbox_file, "r") as f:
        try:
            data = json.load(f)
        except: return
        
    if last_processed_idx == -1:
        last_processed_idx = len(data) - 1
        return

    for i in range(last_processed_idx + 1, len(data)):
        msg = data[i]
        if msg['role'] == 'user':
            text = msg['text'].strip()
            # Look for /do or /run commands
            if text.startswith("/do") or text.startswith("/run"):
                cmd_content = text.split(" ", 1)[1] if " " in text else ""
                send_update(f"⚙️ *Executing Task:* {cmd_content}...")
                
                # Simple logic for now: if it's a known skill name, run it.
                # Otherwise, treat as a shell command (safely-ish).
                response = run_skill(".", cmd_content)
                send_update(response)
            
            elif text.startswith("/status"):
                send_update("📡 *System Status:* Online. Waiting for commands in local session.")

        last_processed_idx = i

print("🤖 Autonomous Telegram Command Loop is STARTING...")
send_update("🚀 *Autonomous Command Loop is LIVE.*\n\nYou can now control this terminal from Telegram using `/run [command]` or `/status`.")

while True:
    try:
        process_tasks()
    except Exception as e:
        with open("loop_errors.txt", "a") as f:
            f.write(f"{datetime.now()}: {str(e)}\n")
    time.sleep(5)
