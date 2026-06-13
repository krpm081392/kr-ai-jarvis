import { createClient } from '@supabase/supabase-js';

export default async function handler(req,res){
  try{
    if(req.method !== "POST") return res.status(405).json({ok:false,error:"POST only"});
    const { prompt="", messages=[] } = req.body || {};
    const finalPrompt = prompt || messages.map(m=>`${m.role||"user"}: ${m.text||m.content||""}`).join("\n");
    if(!finalPrompt) return res.status(400).json({ok:false,error:"prompt required"});

    // Option 1: direct tunnel/local AI endpoint.
    // Example LOCAL_AI_URL=https://your-cloudflare-tunnel.trycloudflare.com
    if(process.env.LOCAL_AI_URL){
      const direct = await callLocalAi(finalPrompt);
      return res.status(200).json({...direct, route:"direct_LOCAL_AI_URL"});
    }

    // Option 2: Supabase queue. Laptop agent polls requests and writes answer back.
    const supabase = getSupabase();
    if(!supabase) return res.status(200).json({ok:false,error:"LOCAL_AI_URL missing and Supabase env missing. Add LOCAL_AI_URL or run queue mode with Supabase."});

    const requestId = crypto.randomUUID();
    await supabase.from("kr_local_ai_requests").insert({
      id: requestId,
      prompt: finalPrompt,
      status: "pending"
    }).throwOnError();

    const timeoutMs = Number(process.env.LOCAL_AI_TIMEOUT_MS || 45000);
    const started = Date.now();
    while(Date.now() - started < timeoutMs){
      const { data } = await supabase
        .from("kr_local_ai_requests")
        .select("status,response,error")
        .eq("id", requestId)
        .single();
      if(data?.status === "done") return res.status(200).json({ok:true,response:data.response,route:"supabase_queue"});
      if(data?.status === "error") return res.status(200).json({ok:false,error:data.error || "Local AI error",route:"supabase_queue"});
      await sleep(1500);
    }

    return res.status(200).json({
      ok:false,
      error:"Local brain request queued but laptop agent did not answer before timeout. Make sure kr_local_brain_agent.py is running.",
      requestId,
      route:"supabase_queue"
    });
  }catch(e){
    return res.status(500).json({ok:false,error:e.message});
  }
}

async function callLocalAi(prompt){
  const url = process.env.LOCAL_AI_URL.replace(/\/$/,"");
  const token = process.env.LOCAL_AI_TOKEN || "";
  const r = await fetch(`${url}/chat`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      ...(token ? {"Authorization":`Bearer ${token}`} : {})
    },
    body:JSON.stringify({prompt})
  });
  const data = await r.json().catch(()=>({}));
  if(!r.ok) return {ok:false,error:data.error || `LOCAL_AI_URL failed ${r.status}`};
  return {ok:true,response:data.response || data.reply || data.text || JSON.stringify(data)};
}

function getSupabase(){
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) return null;
  return createClient(url,key);
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
