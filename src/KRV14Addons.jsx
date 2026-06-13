
import { useEffect, useState } from "react";

export default function KRV14Addons(){
  const [tab,setTab]=useState("reason");
  const [data,setData]=useState({});
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");

  useEffect(()=>{run("reason","/api/reasoning-engine",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({problem:"Explain what K-R v14 reasoning mode can do."})})},[]);

  async function j(url,opt){
    const r=await fetch(url,opt); const d=await r.json();
    if(!r.ok||d.ok===false) throw new Error(d.error||d.reply||"Request failed");
    return d;
  }

  async function run(key,url,opt){
    setBusy(true); setMsg("");
    try{const d=await j(url,opt); setData(p=>({...p,[key]:d})); setTab(key);}
    catch(e){setMsg(e.message)}
    setBusy(false);
  }

  function askReason(){
    const problem=prompt("What should K-R reason through?");
    if(!problem)return;
    run("reason","/api/reasoning-engine",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({problem})});
  }

  function debugCode(){
    const code=prompt("Paste error/code summary for K-R to debug:");
    if(!code)return;
    run("debug","/api/debug-engine",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})});
  }

  function techPlan(){
    const goal=prompt("What tech plan should K-R create?");
    if(!goal)return;
    run("plan","/api/tech-planner",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goal})});
  }

  function teach(){
    const topic=prompt("What should K-R explain/teach?");
    if(!topic)return;
    run("teach","/api/explain-teach",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic})});
  }

  function knowledge(){
    const query=prompt("What knowledge should K-R research?");
    if(!query)return;
    run("knowledge","/api/knowledge-base-search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query})});
  }

  const tabs=["reason","debug","plan","teach","knowledge","architecture","review"];
  return <div className="v14">
    <style>{css}</style>
    <div className="v14top"><div><h2>K‑R v14 Reasoning + Knowledge Core</h2><p>Huge knowledge-base style research, stronger reasoning, tech planning, debugging, teaching, and architecture review.</p></div><button onClick={askReason}>Reason</button></div>
    <div className="brain"><span>THINK</span></div>
    <div className="v14actions">
      <button onClick={askReason}>Strong Reasoning</button>
      <button onClick={debugCode}>Debug Engine</button>
      <button onClick={techPlan}>Tech Planner</button>
      <button onClick={teach}>Explain / Teach</button>
      <button onClick={knowledge}>Knowledge Search</button>
      <button onClick={()=>run("architecture","/api/architecture-review")}>Architecture Review</button>
      <button onClick={()=>run("review","/api/code-review-agent")}>Code Review Agent</button>
    </div>
    <div className="v14tabs">{tabs.map(t=><button key={t} className={tab===t?"a":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {busy&&<div className="v14note">K‑R thinking...</div>}{msg&&<div className="v14note">{msg}</div>}
    <Card title={tab.toUpperCase()}>
      <pre>{JSON.stringify(data[tab]||{},null,2)}</pre>
    </Card>
  </div>
}
function Card({title,children}){return <div className="v14card"><h3>{title}</h3>{children}</div>}
const css=`.v14{background:#07040f;border:1px solid #b026ff;border-radius:16px;padding:14px;margin:14px;color:#e8e8f4;position:relative;overflow:hidden}.v14:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 10%,rgba(176,38,255,.18),transparent 30%),repeating-linear-gradient(0deg,rgba(0,245,255,.03),rgba(0,245,255,.03) 1px,transparent 1px,transparent 18px);pointer-events:none}.v14top{display:flex;justify-content:space-between;gap:10px;position:relative}.v14 h2{color:#b026ff;margin:0;text-shadow:0 0 18px #b026ff}.v14 p{font-size:12px;color:#e8d8ff}.v14actions,.v14tabs{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0;position:relative}.v14 button{background:#140a20;border:1px solid #b026ff;color:#e8e8f4;border-radius:9px;padding:8px 10px;font-weight:800}.v14 button.a,.v14 button:hover{border-color:#00f5ff;color:#00f5ff}.brain{width:130px;height:130px;margin:10px auto;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#fff 0,#b026ff 12%,#00f5ff 36%,#140a20 62%,#07040f 80%);box-shadow:0 0 60px rgba(176,38,255,.9);animation:v14pulse 2s infinite}.brain span{font-weight:900;color:#07040f;font-size:13px}@keyframes v14pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}.v14card{background:#140a20;border:1px solid #b026ff;border-radius:12px;padding:12px;margin-top:10px;position:relative}.v14card h3{color:#00f5ff;margin:0 0 8px}.v14 pre{white-space:pre-wrap;max-height:460px;overflow:auto;background:#01030a;border:1px solid #104e72;border-radius:8px;padding:8px;font-size:10px;color:#00f5ff}.v14note{border:1px solid #ff9100;color:#ff9100;border-radius:8px;padding:8px;margin:8px 0;font-size:12px}`;
