# KR Laptop Agent v5
# pip install requests pyautogui pillow
import time, subprocess, requests, pyautogui, os, base64
KR_BASE_URL=os.environ.get("KR_BASE_URL","https://YOUR-KR-VERCEL-URL.vercel.app")
def shot():
    path="kr_screenshot.png"; pyautogui.screenshot(path)
    with open(path,"rb") as f:b64=base64.b64encode(f.read()).decode()
    r=requests.post(KR_BASE_URL+"/api/vision-analyze",json={"imageBase64":b64,"prompt":"Analyze laptop screenshot for Dikong."},timeout=60)
    print(r.json().get("analysis","No analysis")[:500])
ACTIONS={"open_chrome":lambda:subprocess.Popen(["cmd","/c","start","chrome"]),"open_notepad":lambda:subprocess.Popen(["notepad"]),"open_calculator":lambda:subprocess.Popen(["calc"]),"open_explorer":lambda:subprocess.Popen(["explorer"]),"open_terminal":lambda:subprocess.Popen(["cmd"]),"take_screenshot":shot}
print("KR Laptop Agent v5:",KR_BASE_URL)
while True:
    try:
        d=requests.get(KR_BASE_URL+"/api/laptop",timeout=10).json(); cmd=d.get("command")
        if cmd and cmd in ACTIONS: print("Command:",cmd); ACTIONS[cmd]()
    except Exception as e: print("Agent error:",e)
    time.sleep(3)
