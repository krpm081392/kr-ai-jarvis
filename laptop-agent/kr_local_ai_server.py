# K-R Direct Local AI Server
# Optional faster mode: expose this with Cloudflare Tunnel/ngrok and set LOCAL_AI_URL in Vercel.
#
# Install:
#   pip install flask gpt4all
# Run:
#   python kr_local_ai_server.py
#
# Then tunnel:
#   cloudflared tunnel --url http://localhost:4891
# Vercel env:
#   LOCAL_AI_URL=https://your-tunnel.trycloudflare.com

import os
from flask import Flask, request, jsonify

MODEL_NAME = os.environ.get("GPT4ALL_MODEL_NAME", "mistral-7b-instruct-v0.2.Q4_0.gguf")
LOCAL_AI_TOKEN = os.environ.get("LOCAL_AI_TOKEN", "")

app = Flask(__name__)
_model = None

def get_model():
    global _model
    if _model is None:
        from gpt4all import GPT4All
        _model = GPT4All(MODEL_NAME)
    return _model

@app.post("/chat")
def chat():
    if LOCAL_AI_TOKEN:
        auth = request.headers.get("Authorization","")
        if auth != f"Bearer {LOCAL_AI_TOKEN}":
            return jsonify(ok=False,error="Unauthorized"), 401
    data = request.get_json(force=True, silent=True) or {}
    prompt = data.get("prompt","")
    if not prompt:
        return jsonify(ok=False,error="prompt required"), 400
    model = get_model()
    with model.chat_session(system_prompt="You are K-R local backup brain for Dikong. Be useful, concise, and safe."):
        answer = model.generate(prompt, max_tokens=800, temp=0.4)
    return jsonify(ok=True,response=answer)

@app.get("/health")
def health():
    return jsonify(ok=True,model=MODEL_NAME)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT","4891")))
