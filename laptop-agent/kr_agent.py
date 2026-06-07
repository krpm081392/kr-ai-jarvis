from flask import Flask, request, jsonify
import subprocess, pyautogui
app = Flask(__name__)
ALLOWED = {
    "open_chrome": lambda: subprocess.Popen(["cmd", "/c", "start", "chrome"]),
    "open_notepad": lambda: subprocess.Popen(["notepad"]),
    "open_calculator": lambda: subprocess.Popen(["calc"]),
    "screenshot": lambda: pyautogui.screenshot("kr_screenshot.png"),
}
@app.post("/command")
def command():
    data = request.get_json(force=True) or {}
    action = data.get("action", "")
    if action not in ALLOWED:
        return jsonify({"ok": False, "error": "Action not allowed"}), 400
    ALLOWED[action]()
    return jsonify({"ok": True, "action": action})
@app.get("/health")
def health():
    return jsonify({"ok": True, "agent": "KR Laptop Agent online"})
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)
