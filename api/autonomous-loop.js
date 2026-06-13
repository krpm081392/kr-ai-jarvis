import { createClient } from '@supabase/supabase-js';
export default async function handler(req,res){
 try{
  const secret=process.env.KR_CRON_SECRET;
  if(secret&&req.headers["x-kr-secret"]!==secret&&req.query?.secret!==secret)return res.status(401).json({ok:false,error:"Unauthorized"});
  const s=getSupabase(); if(!s)return res.status(200).json({ok:false,error:"Supabase env missing"});
  const btc=await safeFetch(`${getBaseUrl()}/api/market-data?pair=BTC/USDT&interval=15m`);
  const eth=await safeFetch(`${getBaseUrl()}/api/market-data?pair=ETH/USDT&interval=15m`);
  const triggered=[];
  for(const m of [btc,eth]){
    if(!m?.ok)continue;
    if(m.indicators?.volumeSpike){const message=`${m.pair} volume spike detected. Trend: ${m.indicators.trend}, RSI: ${m.indicators.rsi14}`; triggered.push(message); await s.from("kr_alerts").insert({type:"market",message,priority:"high",active:true}); await pushJoin("K-R Market Alert",message);}
    if(m.indicators?.rsi14>=70||m.indicators?.rsi14<=30){const message=`${m.pair} RSI extreme: ${m.indicators.rsi14}. Review only, no auto-trade.`; triggered.push(message); await s.from("kr_alerts").insert({type:"rsi",message,priority:"medium",active:true});}
  }
  await s.from("kr_logs").insert({type:"autonomous_loop",data:{btc,eth,triggered,memoryScan:"active",ts:new Date().toISOString()}});
  return res.status(200).json({ok:true,checks:["BTC checked","ETH checked","memory scan active"],triggered});
 }catch(e){return res.status(500).json({ok:false,error:e.message});}
}
async function safeFetch(url){try{const r=await fetch(url);return await r.json();}catch(e){return {ok:false,error:e.message};}}
function getBaseUrl(){if(process.env.VERCEL_URL)return`https://${process.env.VERCEL_URL}`;if(process.env.NEXT_PUBLIC_SITE_URL)return process.env.NEXT_PUBLIC_SITE_URL;return"http://localhost:3000";}
async function pushJoin(title,text){const apiKey=process.env.JOIN_API_KEY,deviceId=process.env.JOIN_DEVICE_ID;if(!apiKey||!deviceId)return;const url=`https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush?apikey=${encodeURIComponent(apiKey)}&deviceId=${encodeURIComponent(deviceId)}&title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;await fetch(url).catch(()=>{});}
function getSupabase(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return null;return createClient(url,key);}
