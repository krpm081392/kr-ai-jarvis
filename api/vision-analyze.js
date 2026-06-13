import { createClient } from '@supabase/supabase-js';

export default async function handler(req,res){
  try{
    if(req.method !== "POST") return res.status(405).json({ok:false,error:"POST only"});
    const { imageBase64="", prompt="Analyze this screenshot/chart for Dikong." } = req.body || {};
    if(!imageBase64) return res.status(400).json({ok:false,error:"imageBase64 required"});

    const apiKey=process.env.GEMINI_API_KEY;
    const model=process.env.GEMINI_MODEL || "gemini-1.5-flash";
    if(!apiKey) return res.status(200).json({ok:false,analysis:"GEMINI_API_KEY missing."});

    const system=`You are K-R Vision Agent. Analyze screenshots/charts for Dikong.
- If it is a trading chart: identify trend, support/resistance, momentum, risk, possible entry zones.
- Never tell Dikong to execute blindly.
- Always require confirmation and risk management.
- If screenshot is not clear, say what is missing.`;

    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:system}]},
        contents:[{role:"user",parts:[
          {inlineData:{mimeType:"image/jpeg",data:imageBase64}},
          {text:prompt}
        ]}],
        generationConfig:{temperature:.35,maxOutputTokens:1200}
      })
    });

    const data=await r.json();
    if(!r.ok) return res.status(500).json({ok:false,error:data?.error?.message || "Gemini vision error"});
    const analysis=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("\n").trim() || "No analysis.";

    const supabase=getSupabase();
    if(supabase) await supabase.from("kr_logs").insert({type:"vision_analysis",data:{prompt,analysis}}).catch(()=>{}); await supabase.from("kr_screenshot_history").insert({prompt,analysis}).catch(()=>{});

    return res.status(200).json({ok:true,analysis});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
}

function getSupabase(){
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) return null;
  return createClient(url,key);
}
