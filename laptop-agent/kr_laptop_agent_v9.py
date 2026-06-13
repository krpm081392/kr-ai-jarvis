# KR Laptop Agent v9 - Jarvis Mastery
# pip install requests pyautogui pillow
import time, subprocess, requests, pyautogui, os, base64
KR_BASE_URL=os.environ.get("KR_BASE_URL","https://YOUR-KR-VERCEL-URL.vercel.app")
SCREEN_INTERVAL=int(os.environ.get("KR_SCREEN_INTERVAL","300"))
last=0

def upload_screen():
    path="kr_screen.png"
    pyautogui.screenshot(path)
    with open(path,"rb") as f:
        b64=base64.b64encode(f.read()).decode()
    r=requests.post(KR_BASE_URL+"/api/screen-orchestrator",json={"imageBase64":b64,"prompt":"Jarvis screen orchestration scan. Propose safe actions only."},timeout=60)
    print("Screen proposal:",r.json().get("proposal","")[:500])

def safe_click_notice():
    print("Click requested. High-risk UI actions require Dikong confirmation first. No automatic click performed.")

ACTIONS={
 "open_chrome":lambda:subprocess.Popen(["cmd","/c","start","chrome"]),
 "open_notepad":lambda:subprocess.Popen(["notepad"]),
 "open_calculator":lambda:subprocess.Popen(["calc"]),
 "open_explorer":lambda:subprocess.Popen(["explorer"]),
 "open_terminal":lambda:subprocess.Popen(["cmd"]),
 "take_screenshot":upload_screen,
 "screen_scan":upload_screen,
}

print("KR Laptop Agent v9 running:",KR_BASE_URL)
while True:
    try:
        if time.time()-last>SCREEN_INTERVAL:
            upload_screen()
            last=time.time()
        d=requests.get(KR_BASE_URL+"/api/laptop",timeout=10).json()
        cmd=d.get("command")
        if cmd:
            print("Command:",cmd)
            if cmd in ACTIONS:ACTIONS[cmd]()
    except Exception as e:
        print("Agent error:",e)
    time.sleep(3)
