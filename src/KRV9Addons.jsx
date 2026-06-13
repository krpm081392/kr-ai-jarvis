import { useEffect, useRef, useState } from "react";

export default function KRV9Addons(){
  const [tab,setTab]=useState("mastery");
  const [mastery,setMastery]=useState(null);
  const [voice,setVoice]=useState(null);
  const [intelligence,setIntelligence]=useState(null);
  const [mission,setMission]=useState(null);
  const [diagnostic,setDiagnostic]=useState(null);
  const [graph,setGraph]=useState(null);
  const [screen,setScreen]=useState(null);
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");
  const fileRef=useRef(null);

  useEffect(()=>{loadMastery();},[]);

  async function j(url,opt){
    const r=await fetch(url,opt); const d=await r.json();
    if(!r.ok||d.ok===false) throw new Error(d.error||d.reply||"Request failed");
    return d;
  }

  async function loadMastery(){
    setBusy(true); setMsg("");
    try{setMastery(await j("/api/jarvis-mastery")); setTab("mastery");}
    catch(e){setMsg(e.message)}
    setBusy(false);
  }

  async function voiceMode(){
    setBusy(true); setMsg("");
    try{setVoice(await j("/api/voice-mastery")); setTab("voice");}
    catch(e){setMsg(e.message)}
    setBusy(false);
  }

  async function intel(){
    setBusy(true); setMsg("");
    try{setIntelligence(await j("/api/intelligence-engine")); setTab("intel");}
    catch(e){setMsg(e.message)}
    setBusy(false);
  }

  async function missionSwarm(){
    const goal=prompt("Mission for K-R swarm?"); if(!goal)return;
    setBusy(true); setMsg("");
    try{setMission(await j("/api/mission-swarm",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goal})})); setTab("mission");}
    catch(e){setMsg(e.message)}
    setBusy(false);
  }

  async function diagnose(){
    setBusy(true); setMsg("");
    try{setDiagnostic(await j("/api/self-diagnostic")); setTab("diagnostic");}
    catch(e){setMsg(e.message)}
    setBusy(false);
  }

  async function knowledgeGraph(){
    setBusy(true); setMsg("");
    try{setGraph(await j("/api/knowledge-graph")); setTab("graph");}
    catch(e){setMsg(e.message)}
    setBusy(false);
  }

  async function screenOrchestrate(file){
    if(!file)return;
    const reader=new FileReader();
    reader.onload=async()=>{
      setBusy(true); setMsg("");
      try{
        const imageBase64=String(reader.result).split(",")[1];
        setScreen(await j("/api/screen-orchestrator",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageBase64,prompt:"Describe the screen and propose safe next actions. Do not execute high-risk actions without confirmation."})}));
        setTab("screen");
      }catch(e){setMsg(e.message)}
      setBusy(false);
    };
    reader.readAsDataURL(file);
  }

  const tabs=["mastery","voice","intel","mission","diagnostic","graph","screen"];
  return <div className="v9">
    <style>{css}</style>
    <div className="v9top">
      <div><h2>K‑R v9 Jarvis Mastery</h2><p>Wake word, multi-source intelligence, mission swarm, diagnostics, knowledge graph, advanced screen orchestration.</p></div>
      <button onClick={loadMastery}>Refresh</button>
    </div>
    <div className="holo"><div className="holoorb">K‑R</div><div className="rings"></div></div>
    <div className="v9actions">
      <button onClick={voiceMode}>Voice Mastery</button>
      <button onClick={intel}>Intel Engine</button>
      <button onClick={missionSwarm}>Mission Swarm</button>
      <button onClick={diagnose}>Self Diagnostic</button>
      <button onClick={knowledgeGraph}>Knowledge Graph</button>
      <button onClick={()=>fileRef.current?.click()}>Screen Orchestrate</button>
      <input ref={fileRef} hidden type="file" accept="image/*" onChange={e=>screenOrchestrate(e.target.files?.[0])}/>
    </div>
    <div className="v9tabs">{tabs.map(t=><button key={t} className={tab===t?"a":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {busy&&<div className="v9note">K‑R processing...</div>}{msg&&<div className="v9note">{msg}</div>}
    {tab==="mastery"&&<Card title="Jarvis Mastery Status"><pre>{JSON.stringify(mastery||{},null,2)}</pre></Card>}
    {tab==="voice"&&<Card title="Full Voice Wake Word + Continuous Mode"><pre>{JSON.stringify(voice||{},null,2)}</pre></Card>}
    {tab==="intel"&&<Card title="Real-Time Multi-Source Intelligence">{intelligence?<><div className="score">{intelligence.score}/10</div><div className="v9summary">{intelligence.summary}</div><pre>{JSON.stringify(intelligence.sources||{},null,2)}</pre></>:<p>Run Intel Engine.</p>}</Card>}
    {tab==="mission"&&<Card title="Mission Swarm Executor">{mission?<><div className="v9summary">{mission.report}</div><pre>{JSON.stringify(mission.tasks||[],null,2)}</pre></>:<p>Create a mission.</p>}</Card>}
    {tab==="diagnostic"&&<Card title="Self-Diagnostic + Optimization"><pre>{JSON.stringify(diagnostic||{},null,2)}</pre></Card>}
    {tab==="graph"&&<Card title="Personal Knowledge Graph"><pre>{JSON.stringify(graph||{},null,2)}</pre></Card>}
    {tab==="screen"&&<Card title="Advanced Screen Orchestration">{screen?<div className="v9summary">{screen.proposal}</div>:<p>Upload a screen.</p>}</Card>}
  </div>
}

function Card({title,children}){return <div className="v9card"><h3>{title}</h3>{children}</div>}
const css=`.v9{background:#030612;border:1px solid #7c00cc;border-radius:14px;padding:14px;margin:14px;color:#e8e8f4;position:relative;overflow:hidden}.v9:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 0,rgba(176,38,255,.16),transparent 35%),repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,245,255,.04) 3px,rgba(0,245,255,.04) 4px);pointer-events:none}.v9top{display:flex;justify-content:space-between;gap:10px;position:relative}.v9 h2{color:#00f5ff;margin:0;text-shadow:0 0 16px #00f5ff}.v9 p{font-size:12px;color:#b8d8e8}.v9actions,.v9tabs{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0;position:relative}.v9 button{background:#071225;border:1px solid #7c00cc;color:#e8e8f4;border-radius:9px;padding:8px 10px;font-weight:700}.v9 button.a,.v9 button:hover{border-color:#00f5ff;color:#00f5ff}.holo{height:120px;display:grid;place-items:center;position:relative}.holoorb{width:92px;height:92px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#00f5ff 0,#7c00cc 42%,#030612 74%);box-shadow:0 0 42px rgba(0,245,255,.85);font-weight:900;animation:pulse 2s infinite}.rings{position:absolute;width:150px;height:70px;border:1px solid rgba(0,245,255,.45);border-radius:50%;transform:rotateX(70deg);animation:spin 6s linear infinite}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}@keyframes spin{from{transform:rotateX(70deg) rotateZ(0)}to{transform:rotateX(70deg) rotateZ(360deg)}}.v9card{background:#071225;border:1px solid #104e72;border-radius:12px;padding:12px;margin-top:10px;position:relative}.v9card h3{color:#b026ff;margin:0 0 8px}.v9 pre{white-space:pre-wrap;max-height:330px;overflow:auto;background:#01030a;border:1px solid #104e72;border-radius:8px;padding:8px;font-size:10px;color:#00f5ff}.v9summary{white-space:pre-wrap;background:#01030a;border:1px solid #104e72;border-radius:8px;padding:10px;font-size:12px;line-height:1.55}.v9note{border:1px solid #ff9100;color:#ff9100;border-radius:8px;padding:8px;margin:8px 0;font-size:12px}.score{font-size:42px;color:#00f5ff;text-shadow:0 0 14px #00f5ff;font-weight:900}`;
