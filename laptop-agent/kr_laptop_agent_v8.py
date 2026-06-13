# KR Laptop Agent v8 - Environment Awareness
# pip install requests pyautogui pillow
import time, subprocess, requests, pyautogui, os, base64

KR_BASE_URL=os.environ.get("KR_BASE_URL","https://YOUR-KR-VERCEL-URL.vercel.app")
SCREEN_INTERVAL=int(os.environ.get("KR_SCREEN_INTERVAL","300"))
last_screen=0

def upload_screen():
    path="kr_screen.png"
    pyautogui.screenshot(path)
    with open(path,"rb") as f:
        b64=base64.b64encode(f.read()).decode()
    r=requests.post(KR_BASE_URL+"/api/screen-awareness",json={"imageBase64":b64,"prompt":"Periodic laptop screen awareness scan. Look for errors, warnings, opportunities, or unusual activity. Do not execute anything."},timeout=60)
    print("Screen awareness:", r.json().get("analysis","")[:400])

def click_requires_confirmation(x,y):
    print("High-risk click requested. Manual confirmation required before pyautogui.click().")
    # Intentionally not clicking automatically.

ACTIONS={
 "open_chrome":lambda:subprocess.Popen(["cmd","/c","start","chrome"]),
 "open_notepad":lambda:subprocess.Popen(["notepad"]),
 "open_calculator":lambda:subprocess.Popen(["calc"]),
 "open_explorer":lambda:subprocess.Popen(["explorer"]),
 "open_terminal":lambda:subprocess.Popen(["cmd"]),
 "take_screenshot":upload_screen,
}

print("KR Laptop Agent v8 running:",KR_BASE_URL)
while True:
    try:
        now=time.time()
        if now-last_screen>SCREEN_INTERVAL:
            upload_screen()
            last_screen=now
        data=requests.get(KR_BASE_URL+"/api/laptop",timeout=10).json()
        cmd=data.get("command")
        if cmd:
            print("Command:",cmd)
            if cmd in ACTIONS: ACTIONS[cmd]()
    except Exception as e:
        print("Agent error:",e)
    time.sleep(3)
