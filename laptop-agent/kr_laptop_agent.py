# KR Laptop Agent v3
# pip install requests pyautogui pillow
# Set KR_BASE_URL to your Vercel URL or edit below.
import time, subprocess, requests, pyautogui, os
KR_BASE_URL = os.environ.get("KR_BASE_URL", "https://YOUR-KR-VERCEL-URL.vercel.app")
def open_chrome(): subprocess.Popen(["cmd","/c","start","chrome"])
def open_notepad(): subprocess.Popen(["notepad"])
def open_calculator(): subprocess.Popen(["calc"])
def take_screenshot(): pyautogui.screenshot("kr_screenshot.png"); print("Saved kr_screenshot.png")
def open_explorer(): subprocess.Popen(["explorer"])
def open_terminal(): subprocess.Popen(["cmd"])
ACTIONS={"open_chrome":open_chrome,"open_notepad":open_notepad,"open_calculator":open_calculator,"take_screenshot":take_screenshot,"open_explorer":open_explorer,"open_terminal":open_terminal}
print("KR Laptop Agent running:", KR_BASE_URL)
while True:
    try:
        data=requests.get(KR_BASE_URL+"/api/laptop",timeout=10).json()
        cmd=data.get("command")
        if cmd:
            print("Command:", cmd)
            if cmd in ACTIONS: ACTIONS[cmd]()
    except Exception as e: print("Agent error:", e)
    time.sleep(3)
