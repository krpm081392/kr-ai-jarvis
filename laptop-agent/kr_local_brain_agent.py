# K-R Local Brain Agent
# Purpose: when Gemini quota fails, Vercel queues a prompt in Supabase.
# This laptop agent reads the prompt, asks local GPT4All/Mistral, writes answer back.
#
# Install:
#   pip install requests supabase gpt4all
#
# Environment variables on laptop:
#   SUPABASE_URL=https://xxxxx.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx
#   GPT4ALL_MODEL_NAME=TheBloke/Mistral-7B-Instruct-v0.2-GGUF
#
# Run:
#   python kr_local_brain_agent.py

import os, time, traceback
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
MODEL_NAME = os.environ.get("GPT4ALL_MODEL_NAME", "mistral-7b-instruct-v0.2.Q4_0.gguf")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise SystemExit("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on laptop.")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def ask_gpt4all(prompt: str) -> str:
    try:
        from gpt4all import GPT4All
        model = GPT4All(MODEL_NAME)
        with model.chat_session(system_prompt="You are K-R local backup brain for Dikong. Be useful, concise, and safe. No trading execution, no withdrawals, no payments."):
            return model.generate(prompt, max_tokens=800, temp=0.4)
    except Exception as e:
        return f"Local GPT4All error: {e}\nMake sure GPT4All model name/path is correct. MODEL_NAME={MODEL_NAME}"

print("K-R Local Brain Agent running. Waiting for Supabase requests...")
while True:
    try:
        result = supabase.table("kr_local_ai_requests").select("*").eq("status","pending").limit(1).execute()
        rows = result.data or []
        for row in rows:
            rid = row["id"]
            prompt = row.get("prompt","")
            print("Processing local AI request:", rid)
            supabase.table("kr_local_ai_requests").update({"status":"running"}).eq("id", rid).execute()
            try:
                answer = ask_gpt4all(prompt)
                supabase.table("kr_local_ai_requests").update({"status":"done","response":answer}).eq("id", rid).execute()
                print("Done:", rid)
            except Exception as e:
                supabase.table("kr_local_ai_requests").update({"status":"error","error":str(e)}).eq("id", rid).execute()
                print("Error:", e)
    except Exception:
        traceback.print_exc()
    time.sleep(3)
