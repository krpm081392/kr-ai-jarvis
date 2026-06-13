import { useEffect, useRef, useState } from "react";

export default function KRV8Addons(){
  const [tab,setTab]=useState("orb");
  const [orb,setOrb]=useState(null);
  const [global,setGlobal]=useState(null);
  const [mission,setMission]=useState(null);
  const [prediction,setPrediction]=useState(null);
  const [screen,setScreen]=useState(null);
  const [browser,setBrowser]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");
  const fileRef=useRef(null);

  useEffect(()=>{loadOrb();},[]);

  async function j(url,opt){
    const r=await fetch(url,opt); const d=await r.json();
    if(!r.ok||d.ok===false) throw new Error(d.error||d.reply||"Request failed");
    return d;
  }

  async function loadOrb(){
    setBusy(true); setMsg("");
    try{setOrb(await j("/api/system-orb"));setTab("orb");}
    catch(e){setMsg(e.message)} setBusy(false);
  }

  async function globalBrief(){
    setBusy(true); setMsg("");
    try{setGlobal(await j("/api/global-brief"));setTab("global");}
    catch(e){setMsg(e.message)} setBusy(false);
  }

  async function planMission(){
    const goal=prompt("Mission goal? e.g. prepare my trading day / research a client / build a website update");
    if(!goal)return;
    setBusy(true); setMsg("");
    try{setMission(await j("/api/mission-planner",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goal})}));setTab("mission");}
    catch(e){setMsg(e.message)} setBusy(false);
  }

  async function predict(){
    const scenario=prompt("What-if scenario? e.g. BTC breaks 70k / if I enter ETH long now");
    if(!scenario)return;
    setBusy(true); setMsg("");
    try{setPrediction(await j("/api/prediction-engine",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scenario})}));setTab("prediction");}
    catch(e){setMsg(e.message)} setBusy(false);
  }

  async function screenAnalyze(file){
    if(!file)return;
    const reader=new FileReader();
    reader.onload=async()=>{
      setBusy(true); setMsg("");
      try{
        const b64=String(reader.result).split(",")[1];
        setScreen(await j("/api/screen-awareness",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageBase64:b64,prompt:"What is on my screen right now? Identify errors, opportunities, warnings, and safe next actions."})}));
        setTab("screen");
      }catch(e){setMsg(e.message)}
      setBusy(false);
    };
    reader.readAsDataURL(file);
  }

  async function browseRead(){
    const url=prompt("URL for K-R to read safely:");
    if(!url)return;
    setBusy(true);setMsg("");
    try{setBrowser(await j("/api/browser-read",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})}));setTab("browser");}
    catch(e){setMsg(e.message)} setBusy(false);
  }

  async function requestHighRisk(){
    const action=prompt("High-risk action request to test confirmation gate:");
    if(!action)return;
    setBusy(true);setMsg("");
    try{setConfirm(await j("/api/confirm-action",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,risk:"high"})}));setTab("confirm");}
    catch(e){setMsg(e.message)} setBusy(false);
  }

  const tabs=["orb","global","mission","prediction","screen","browser","confirm"];
  return <div className="v8">
    <style>{css}</style>
    <div className="v8top"><div><h2>K‑R v8 Jarvis Vision Layer</h2><p>Environment awareness, mission orchestration, global intelligence, screen vision, confirmation gates.</p></div><button onClick={loadOrb}>Refresh Orb</button></div>
    <div className={(orb?.volatility==="high"?"orb high":"orb")}><span>K‑R</span></div>
    <div className="v8actions">
      <button onClick={globalBrief}>Global Brief</button>
      <button onClick={planMission}>Plan Mission</button>
      <button onClick={predict}>What‑If Prediction</button>
      <button onClick={()=>fileRef.current?.click()}>Analyze Screen</button>
      <button onClick={browseRead}>Browser Read</button>
      <button onClick={requestHighRisk}>Confirm Gate</button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>screenAnalyze(e.target.files?.[0])}/>
    </div>
    <div className="v8tabs">{tabs.map(t=><button key={t} className={tab===t?"a":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {busy&&<div className="v8note">K‑R processing...</div>}{msg&&<div className="v8note">{msg}</div>}
    {tab==="orb"&&<Card title="Live System Status Orb"><pre>{JSON.stringify(orb||{},null,2)}</pre></Card>}
    {tab==="global"&&<Card title="Universal Global Brief">{global?<div className="v8summary">{global.brief}</div>:<p>Click Global Brief.</p>}</Card>}
    {tab==="mission"&&<Card title="Mission Planner / Agent Swarm">{mission?<><div className="v8summary">{mission.plan}</div><pre>{JSON.stringify(mission.tasks||[],null,2)}</pre></>:<p>Plan a mission.</p>}</Card>}
    {tab==="prediction"&&<Card title="Prediction / What‑If Engine">{prediction?<div className="v8summary">{prediction.analysis}</div>:<p>Run a prediction.</p>}</Card>}
    {tab==="screen"&&<Card title="Screen Awareness">{screen?<div className="v8summary">{screen.analysis}</div>:<p>Upload screenshot.</p>}</Card>}
    {tab==="browser"&&<Card title="Safe Browser Read">{browser?<><p><b>{browser.title||browser.url}</b></p><div className="v8summary">{browser.summary}</div></>:<p>Paste URL.</p>}</Card>}
    {tab==="confirm"&&<Card title="High-Risk Confirmation Gate">{confirm?<pre>{JSON.stringify(confirm,null,2)}</pre>:<p>Test confirmation gate.</p>}</Card>}
  </div>
}
function Card({title,children}){return <div className="v8card"><h3>{title}</h3>{children}</div>}
const css=`.v8{background:#050814;border:1px solid #00f5ff;border-radius:14px;padding:14px;margin:14px;color:#e8e8f4;position:relative;overflow:hidden}.v8:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(0,245,255,.03) 4px,rgba(0,245,255,.03) 5px);pointer-events:none}.v8top{display:flex;justify-content:space-between;gap:10px;position:relative}.v8 h2{color:#00f5ff;margin:0;text-shadow:0 0 12px #00f5ff}.v8 p{font-size:12px;color:#b8d8e8}.v8actions,.v8tabs{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0;position:relative}.v8 button{background:#071225;border:1px solid #104e72;color:#e8e8f4;border-radius:9px;padding:8px 10px;font-weight:700}.v8 button.a,.v8 button:hover{border-color:#b026ff;color:#b026ff}.orb{width:86px;height:86px;border-radius:50%;display:grid;place-items:center;margin:8px auto;background:radial-gradient(circle,#00f5ff 0,#154a80 35%,#050814 72%);box-shadow:0 0 28px rgba(0,245,255,.7);animation:pulse 2.4s infinite}.orb.high{box-shadow:0 0 38px rgba(255,45,120,.95);background:radial-gradient(circle,#ff2d78 0,#154a80 35%,#050814 72%)}.orb span{font-weight:900;color:white}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}.v8card{background:#071225;border:1px solid #104e72;border-radius:12px;padding:12px;margin-top:10px;position:relative}.v8card h3{color:#b026ff;margin:0 0 8px}.v8 pre{white-space:pre-wrap;max-height:300px;overflow:auto;background:#02040a;border:1px solid #104e72;border-radius:8px;padding:8px;font-size:10px;color:#00f5ff}.v8summary{white-space:pre-wrap;background:#02040a;border:1px solid #104e72;border-radius:8px;padding:10px;font-size:12px;line-height:1.55}.v8note{border:1px solid #ff9100;color:#ff9100;border-radius:8px;padding:8px;margin:8px 0;font-size:12px}`;
