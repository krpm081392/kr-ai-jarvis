import { useEffect, useState } from "react";

export default function KRV7Addons(){
  const [tab,setTab]=useState("agents");
  const [agents,setAgents]=useState(null);
  const [queue,setQueue]=useState([]);
  const [notifications,setNotifications]=useState([]);
  const [history,setHistory]=useState([]);
  const [portfolio,setPortfolio]=useState(null);
  const [pattern,setPattern]=useState(null);
  const [greeting,setGreeting]=useState(null);
  const [lang,setLang]=useState(localStorage.getItem("kr_lang")||"en");
  const [personality,setPersonality]=useState(localStorage.getItem("kr_personality")||"jarvis");
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");

  useEffect(()=>{loadAll();},[]);

  async function j(url,opt){
    const r=await fetch(url,opt); const d=await r.json();
    if(!r.ok||d.ok===false) throw new Error(d.error||d.reply||"Request failed");
    return d;
  }
  async function loadAll(){
    setBusy(true); setMsg("");
    const calls=await Promise.allSettled([j("/api/agent-status"),j("/api/agent-queue"),j("/api/notification-history"),j("/api/conversation-history"),j("/api/portfolio-tracker"),j("/api/pattern-learning"),j("/api/proactive-greeting")]);
    if(calls[0].status==="fulfilled")setAgents(calls[0].value);
    if(calls[1].status==="fulfilled")setQueue(calls[1].value.tasks||[]);
    if(calls[2].status==="fulfilled")setNotifications(calls[2].value.notifications||[]);
    if(calls[3].status==="fulfilled")setHistory(calls[3].value.history||[]);
    if(calls[4].status==="fulfilled")setPortfolio(calls[4].value);
    if(calls[5].status==="fulfilled")setPattern(calls[5].value);
    if(calls[6].status==="fulfilled")setGreeting(calls[6].value);
    setBusy(false);
  }
  async function delegate(){
    const task=prompt("What task should K-R delegate to an agent?"); if(!task)return;
    setBusy(true); setMsg("");
    try{await j("/api/agent-delegate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({task})}); const q=await j("/api/agent-queue"); setQueue(q.tasks||[]); setTab("queue");}
    catch(e){setMsg(e.message)} setBusy(false);
  }
  async function addPortfolio(){
    const asset=prompt("Asset? BTC, ETH, AAPL, EURUSD, GOLD"); if(!asset)return;
    const market=prompt("Market? crypto/stocks/forex/commodities","crypto")||"crypto";
    const size=Number(prompt("Size/quantity?","1")||"1");
    const entry=Number(prompt("Entry price?","0")||"0");
    setBusy(true);
    try{await j("/api/portfolio-tracker",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({asset,market,size,entry})}); setPortfolio(await j("/api/portfolio-tracker")); setTab("portfolio");}
    catch(e){setMsg(e.message)} setBusy(false);
  }
  async function saveSettings(){
    localStorage.setItem("kr_lang",lang); localStorage.setItem("kr_personality",personality);
    try{await j("/api/user-preferences",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({language:lang,personality})}); setMsg("Saved KR language/personality mode.");}
    catch(e){setMsg(e.message)}
  }
  async function offlineTest(){
    setBusy(true);
    try{const d=await j("/api/offline-fallback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:"What can you do if Gemini is down?"})}); setMsg(d.reply);}
    catch(e){setMsg(e.message)} setBusy(false);
  }

  const tabs=["agents","queue","notifications","conversation","portfolio","patterns","settings"];
  return <div className="v7">
    <style>{css}</style>
    <div className="v7top"><div><h2>K‑R v7 Universal Agent OS</h2><p>Sintra-style delegation + universal Jarvis layer. Add-only.</p></div><button onClick={loadAll}>Refresh</button></div>
    {greeting?.greeting && <div className="v7greet">{greeting.greeting}</div>}
    <div className="v7actions"><button onClick={delegate}>Delegate Task</button><button onClick={addPortfolio}>Add Portfolio</button><button onClick={offlineTest}>Test Offline</button><button onClick={()=>setTab("settings")}>Modes</button></div>
    <div className="v7tabs">{tabs.map(t=><button key={t} className={tab===t?"a":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {busy&&<div className="v7note">K‑R working...</div>}{msg&&<div className="v7note">{msg}</div>}
    {tab==="agents"&&<Card title="Agent Status">{agents?<div className="v7grid">{(agents.agents||[]).map(a=><div className="agent" key={a.id}><b>{a.icon} {a.name}</b><br/><small>{a.role}</small><br/><span>{a.status}</span></div>)}</div>:<p>Loading agents...</p>}</Card>}
    {tab==="queue"&&<Card title="Agent Task Queue">{queue.length?queue.map(t=><div className="v7row" key={t.id}><b>{t.agent}</b> · {t.status}<br/>{t.task}<br/><small>{t.created_at}</small></div>):<p>No delegated tasks yet.</p>}</Card>}
    {tab==="notifications"&&<Card title="Notification History">{notifications.length?notifications.map(n=><div className="v7row" key={n.id}><b>{n.title||n.type}</b><br/>{n.message}<br/><small>{n.created_at}</small></div>):<p>No notifications yet.</p>}</Card>}
    {tab==="conversation"&&<Card title="Conversation Memory Across Sessions">{history.length?history.map(h=><div className="v7row" key={h.id}><b>{h.role}</b>: {h.content}<br/><small>{h.created_at}</small></div>):<p>No saved conversation yet.</p>}</Card>}
    {tab==="portfolio"&&<Card title="Universal Portfolio Tracker">{portfolio?<><div className="v7grid mini"><div>Total Positions<br/><b>{portfolio.positions?.length||0}</b></div><div>Total Exposure<br/><b>{portfolio.totalExposure}</b></div><div>Risk Level<br/><b>{portfolio.riskLevel}</b></div></div><pre>{JSON.stringify(portfolio.positions||[],null,2)}</pre></>:<p>Add a position.</p>}</Card>}
    {tab==="patterns"&&<Card title="K-R Pattern Learning">{pattern?<><p>{pattern.summary}</p><pre>{JSON.stringify(pattern.suggestions||[],null,2)}</pre></>:<p>Need more logs first.</p>}</Card>}
    {tab==="settings"&&<Card title="Language + Voice Personality Modes"><label>Language</label><select value={lang} onChange={e=>setLang(e.target.value)}><option value="en">English</option><option value="taglish">Tagalog / Taglish</option><option value="filipino">Filipino</option></select><label>Voice Personality</label><select value={personality} onChange={e=>setPersonality(e.target.value)}><option value="jarvis">Jarvis Mode</option><option value="bro">Bro Mode</option><option value="war">War Mode</option></select><button onClick={saveSettings}>Save Settings</button><p>Jarvis = formal/calm. Bro = casual Filipino. War = focused/intense.</p></Card>}
  </div>
}
function Card({title,children}){return <div className="v7card"><h3>{title}</h3>{children}</div>}
const css=`.v7{background:#090b13;border:1px solid #4a2d6e;border-radius:14px;padding:14px;margin:14px;color:#e8e8f4}.v7top{display:flex;justify-content:space-between;gap:10px}.v7 h2{color:#b026ff;margin:0}.v7 p{font-size:12px;color:#b8b8d8}.v7actions,.v7tabs{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0}.v7 button,.v7 select{background:#151225;border:1px solid #4a2d6e;color:#e8e8f4;border-radius:9px;padding:8px 10px;font-weight:700;margin:4px}.v7 button.a,.v7 button:hover{border-color:#00f5ff;color:#00f5ff}.v7card{background:#151225;border:1px solid #4a2d6e;border-radius:12px;padding:12px;margin-top:10px}.v7card h3{color:#00f5ff;margin:0 0 8px}.v7grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.v7grid.mini{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}.agent{background:#080914;border:1px solid #2d2448;border-radius:10px;padding:10px;font-size:12px}.v7row{border-bottom:1px solid #2d2448;padding:8px 0;font-size:12px;color:#b8b8d8}.v7note,.v7greet{border:1px solid #ff9100;color:#ff9100;border-radius:8px;padding:8px;margin:8px 0;font-size:12px}.v7greet{border-color:#00f5ff;color:#00f5ff}.v7 pre{white-space:pre-wrap;max-height:300px;overflow:auto;background:#060914;border:1px solid #2d2448;border-radius:8px;padding:8px;font-size:10px;color:#00f5ff}`;
