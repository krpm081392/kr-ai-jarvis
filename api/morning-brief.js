import { createClient } from '@supabase/supabase-js';

export default async function handler(req,res){
  try{
    const market = await safeFetch(`${getBaseUrl()}/api/market-data?pair=BTC/USDT&interval=15m`);
    const eth = await safeFetch(`${getBaseUrl()}/api/market-data?pair=ETH/USDT&interval=15m`);
    const supabase=getSupabase();

    let alerts=[];
    if(supabase){
      const {data}=await supabase.from("kr_alerts").select("*").eq("active",true).order("created_at",{ascending:false}).limit(5);
      alerts=data||[];
    }

    const prompt=`Create Dikong's Jarvis-style morning briefing.
BTC data: ${JSON.stringify(market).slice(0,2500)}
ETH data: ${JSON.stringify(eth).slice(0,2500)}
Active alerts: ${JSON.stringify(alerts)}

Include:
1. Market status
2. BTC/ETH trend
3. Risk warning
4. What to watch today
5. K-R status
Keep concise.`;

    const brief=await askGemini(prompt);
    if(supabase) await supabase.from("kr_logs").insert({type:"morning_brief",data:{brief}}).catch(()=>{});
    await pushJoin("K-R Morning Brief", brief.slice(0,900));

    return res.status(200).json({ok:true,brief});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
}

async function askGemini(prompt){
  const apiKey=process.env.GEMINI_API_KEY, model=process.env.GEMINI_MODEL||"gemini-1.5-flash";
  if(!apiKey) return "Dikong, Gemini key missing.";
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:.35,maxOutputTokens:1000}})
  });
  const data=await r.json();
  return data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("\n").trim() || "No brief.";
}

async function safeFetch(url){try{const r=await fetch(url);return await r.json();}catch(e){return {error:e.message};}}
function getBaseUrl(){if(process.env.VERCEL_URL)return `https://${process.env.VERCEL_URL}`;if(process.env.NEXT_PUBLIC_SITE_URL)return process.env.NEXT_PUBLIC_SITE_URL;return "http://localhost:3000";}
async function pushJoin(title,text){
  const apiKey=process.env.JOIN_API_KEY, deviceId=process.env.JOIN_DEVICE_ID;
  if(!apiKey||!deviceId) return;
  const url=`https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush?apikey=${encodeURIComponent(apiKey)}&deviceId=${encodeURIComponent(deviceId)}&title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
  await fetch(url).catch(()=>{});
}
function getSupabase(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return null;return createClient(url,key);}
