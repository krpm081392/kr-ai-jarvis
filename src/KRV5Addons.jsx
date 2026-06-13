import { useEffect, useRef, useState } from "react";

export default function KRV5Addons() {
  const [tab,setTab]=useState("dashboard");
  const [health,setHealth]=useState(null);
  const [stats,setStats]=useState(null);
  const [market,setMarket]=useState(null);
  const [research,setResearch]=useState(null);
  const [wallet,setWallet]=useState(null);
  const [journal,setJournal]=useState([]);
  const [phone,setPhone]=useState(null);
  const [msg,setMsg]=useState("");
  const [busy,setBusy]=useState(false);
  const fileRef=useRef(null);

  useEffect(()=>{refresh();},[]);

  async function getJson(url,opt){
    const r=await fetch(url,opt); const d=await r.json();
    if(!r.ok||d.ok===false) throw new Error(d.error||d.reply||"Request failed");
    return d;
  }
  async function refresh(){
    setBusy(true); setMsg("");
    const calls=await Promise.allSettled([
      getJson("/api/health"), getJson("/api/dashboard"), getJson("/api/phone-status")
    ]);
    if(calls[0].status==="fulfilled")setHealth(calls[0].value);
    if(calls[1].status==="fulfilled")setStats(calls[1].value.stats||calls[1].value);
    if(calls[2].status==="fulfilled")setPhone(calls[2].value.status||null);
    setBusy(false);
  }
  async function loadMarket(pair="BTC/USDT"){
    setBusy(true);setMsg("");
    try{setMarket(await getJson(`/api/market-data?pair=${encodeURIComponent(pair)}&interval=15m`));setTab("market");}
    catch(e){setMsg(e.message)} setBusy(false);
  }
  async function runResearch(){
    const q=prompt("Research what, Dikong?"); if(!q)return;
    setBusy(true);setMsg("");
    try{setResearch(await getJson("/api/web-research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q})}));setTab("research");}
    catch(e){setMsg(e.message)} setBusy(false);
  }
  async function checkWallet(){
    const a=prompt("Paste Solana wallet address:"); if(!a)return;
    setBusy(true);setMsg("");
    try{setWallet(await getJson(`/api/solana-wallet?address=${encodeURIComponent(a)}`));setTab("wallet");}
    catch(e){setMsg(e.message)} setBusy(false);
  }
  async function loadJournal(){
    setBusy(true);setMsg("");
    try{const d=await getJson("/api/trade-journal");setJournal(d.trades||[]);setTab("journal");}
    catch(e){setMsg(e.message)} setBusy(false);
  }
  async function addJournal(){
    const pair=prompt("Pair? e.g. BTC/USDT"); if(!pair)return;
    const direction=prompt("Direction? LONG/SHORT")||"";
    const result=prompt("Result? win/loss/open")||"";
    const notes=prompt("Notes?")||"";
    setBusy(true);
    try{await getJson("/api/trade-journal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pair,direction,result,notes})});await loadJournal();}
    catch(e){setMsg(e.message)} setBusy(false);
  }
  async function runLoop(){
    setBusy(true);setMsg("");
    try{const d=await getJson("/api/autonomous-loop");setMsg("Loop done: "+(d.triggered||d.checks||[]).join(" | "));}
    catch(e){setMsg(e.message)} setBusy(false);
  }
  async function analyzeImage(file){
    if(!file)return; const reader=new FileReader();
    reader.onload=async()=>{setBusy(true);setMsg("");
      try{const b64=String(reader.result).split(",")[1];const d=await getJson("/api/vision-analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageBase64:b64,prompt:"Analyze this screenshot/chart for Dikong."})});setResearch({query:"Screenshot",summary:d.analysis,results:[]});setTab("research");}
      catch(e){setMsg(e.message)} setBusy(false);
    };
    reader.readAsDataURL(file);
  }
  const pill=(ok)=><span className={ok?"v5ok":"v5bad"}>{ok?"ONLINE":"MISSING"}</span>;
  return <div className="v5">
    <style>{css}</style>
    <div className="v5top"><div><h2>K‑R v5 Live Layer</h2><p>Added only. Existing K‑R stays intact.</p></div><button onClick={refresh}>Refresh</button></div>
    <div className="v5tabs">{["dashboard","market","research","wallet","journal"].map(x=><button className={tab===x?"a":""} onClick={()=>setTab(x)} key={x}>{x}</button>)}</div>
    <div className="v5actions">
      <button onClick={()=>loadMarket("BTC/USDT")}>BTC Live</button><button onClick={()=>loadMarket("ETH/USDT")}>ETH Live</button>
      <button onClick={runResearch}>Web Research</button><button onClick={checkWallet}>Wallet</button><button onClick={loadJournal}>Journal</button>
      <button onClick={addJournal}>Add Trade</button><button onClick={runLoop}>Run Loop</button><button onClick={()=>fileRef.current?.click()}>Screenshot</button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>analyzeImage(e.target.files?.[0])}/>
    </div>
    {busy&&<div className="v5note">K‑R working...</div>}{msg&&<div className="v5note">{msg}</div>}
    {tab==="dashboard"&&<div className="v5grid">
      <div className="v5card"><h3>Health</h3><p>Gemini {pill(health?.gemini)}</p><p>Supabase {pill(health?.supabase)}</p><p>Join {pill(health?.join)}</p></div>
      <div className="v5card"><h3>Stats</h3><pre>{JSON.stringify(stats||{},null,2)}</pre></div>
      <div className="v5card"><h3>Phone Status</h3><pre>{JSON.stringify(phone||{note:"No phone status yet"},null,2)}</pre></div>
    </div>}
    {tab==="market"&&<div className="v5card"><h3>Live Market</h3>{market?<><p>{market.pair} · {market.interval}</p><div className="v5grid mini"><div>Last<br/><b>{market.indicators?.lastClose}</b></div><div>Trend<br/><b>{market.indicators?.trend}</b></div><div>RSI<br/><b>{market.indicators?.rsi14}</b></div><div>EMA20<br/><b>{market.indicators?.ema20}</b></div><div>EMA50<br/><b>{market.indicators?.ema50}</b></div><div>Fear<br/><b>{market.fearGreed?.value}</b></div></div><pre>{JSON.stringify(market.orderbook,null,2)}</pre></>:<p>Click BTC Live.</p>}</div>}
    {tab==="research"&&<div className="v5card"><h3>Research / Vision</h3>{research?<><p><b>{research.query}</b></p><div className="summary">{research.summary}</div>{(research.results||[]).map((r,i)=><p key={i}>🔗 {r.title}<br/><small>{r.snippet}</small></p>)}</>:<p>Run research or screenshot analysis.</p>}</div>}
    {tab==="wallet"&&<div className="v5card"><h3>Solana Wallet</h3>{wallet?<><p>{wallet.address}</p><p>SOL: {wallet.solBalance}</p><pre>{JSON.stringify(wallet.recentSignatures,null,2)}</pre></>:<p>Click Wallet.</p>}</div>}
    {tab==="journal"&&<div className="v5card"><h3>Trade Journal</h3>{journal.length?journal.map(t=><p key={t.id}><b>{t.pair}</b> {t.direction} · {t.result}<br/><small>{t.notes}</small></p>):<p>No trades loaded.</p>}</div>}
  </div>
}
const css=`.v5{background:#0f0d1a;border:1px solid #3a2d6a;border-radius:14px;padding:14px;margin:14px;color:#e8e8f4}.v5top{display:flex;justify-content:space-between}.v5 h2{color:#00f5ff;margin:0}.v5 p{font-size:12px;color:#a8a8c8}.v5tabs,.v5actions{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0}.v5 button{background:#161228;border:1px solid #251d42;color:#e8e8f4;border-radius:9px;padding:8px 10px;font-weight:700}.v5 button.a,.v5 button:hover{border-color:#b026ff;color:#b026ff}.v5grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.v5grid.mini{grid-template-columns:repeat(auto-fit,minmax(100px,1fr))}.v5card{background:#161228;border:1px solid #251d42;border-radius:12px;padding:12px;margin-top:10px}.v5card h3{color:#b026ff;margin:0 0 8px}.v5card pre{white-space:pre-wrap;max-height:260px;overflow:auto;background:#08080f;border:1px solid #251d42;border-radius:8px;padding:8px;font-size:10px;color:#00f5ff}.v5ok{color:#00e676}.v5bad{color:#ff1744}.v5note{border:1px solid #ff9100;color:#ff9100;border-radius:8px;padding:8px;margin:8px 0}.summary{white-space:pre-wrap;background:#08080f;border:1px solid #251d42;border-radius:8px;padding:10px;font-size:12px;line-height:1.55}`;
