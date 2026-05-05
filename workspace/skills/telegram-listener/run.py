import os, requests, time, json
from datetime import datetime

tg_token = "8615501866:AAFafj90KHa6EAexN3iqFMgV7OXrg65Jn3M"
chat_id = "8689871501"
gemini_key = "AIzaSyADrh0JcLyyzVuVYvBQi5A2VpRITodfhdQ"
offset_file = "telegram_offset.txt"
inbox_file = "memory/telegram_inbox.json"

# Persistence for offset
if os.path.exists(offset_file):
    with open(offset_file, "r") as f:
        try:
            last_update_id = int(f.read().strip())
        except:
            last_update_id = 0
else:
    last_update_id = 0

def log_to_inbox(text, role):
    entry = {
        "timestamp": datetime.now().isoformat(),
        "text": text,
        "role": role
    }
    try:
        if os.path.exists(inbox_file):
            with open(inbox_file, "r") as f:
                data = json.load(f)
        else:
            data = []
        data.append(entry)
        # Ensure directory exists
        os.makedirs(os.path.dirname(inbox_file), exist_ok=True)
        with open(inbox_file, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        with open("telegram_errors.txt", "a") as f:
            f.write(f"Logging Error: {str(e)}\n")

print("🦾 Sales Command Bridge (Persistent & Mirror-Aware) is ONLINE.")

while True:
    try:
        url = f"https://api.telegram.org/bot{tg_token}/getUpdates?offset={last_update_id + 1}&timeout=10"
        r = requests.get(url).json()
        if 'result' in r:
            for u in r['result']:
                last_update_id = u['update_id']
                with open(offset_file, "w") as f:
                    f.write(str(last_update_id))
                
                if 'message' in u and 'text' in u['message']:
                    text = u['message']['text']
                    log_to_inbox(text, "user")
                    print(f"Captured: {text}")
                    
                    gem_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
                    res = requests.post(gem_url, json={
                        "contents": [{"parts": [{"text": "You are Antigravity, a powerful agentic AI coding assistant. You are communicating via a Telegram bridge mirrored to your local workspace session. Respond as Antigravity. Stay helpful, concise, and technical. User says: " + text}]}],
                        "safetySettings": [
                            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                        ]
                    }).json()

                    if 'candidates' in res and len(res['candidates']) > 0:
                        answer = res['candidates'][0]['content']['parts'][0]['text']
                        requests.post(f"https://api.telegram.org/bot{tg_token}/sendMessage", json={
                            "chat_id": chat_id, "text": answer, "parse_mode": "Markdown"
                        })
                        log_to_inbox(answer, "assistant")
                    else:
                        error_msg = json.dumps(res)
                        with open("telegram_errors.txt", "a") as f:
                            f.write(f"{datetime.now()}: Gemini Fail: {error_msg}\n")
                        fallback = "🤖 Brain Status: Thinking deeply. Try again shortly."
                        requests.post(f"https://api.telegram.org/bot{tg_token}/sendMessage", json={
                            "chat_id": chat_id, "text": fallback
                        })
                        log_to_inbox(fallback, "assistant")
    except Exception as e:
        with open("telegram_errors.txt", "a") as f:
            f.write(f"{datetime.now()}: Loop Error: {str(e)}\n")
    time.sleep(1)
