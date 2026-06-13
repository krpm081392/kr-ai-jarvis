import { createClient } from '@supabase/supabase-js';
export default async function handler(req,res){
 try{
  const s=getSupabase(); if(!s)return res.status(200).json({ok:false,error:"Supabase env missing"});
  const {data:rules=[]}=await s.from("kr_price_alerts").select("*").eq("active",true);
  const triggered=[];
  for(const rule of rules||[]){
    const market=await safeFetch(`${getBaseUrl()}/api/market-data?pair=${encodeURIComponent(rule.pair)}&interval=15m`);
    const price=market?.indicators?.lastClose; if(!price)continue;
    const hit=(rule.direction==="above"&&price>=Number(rule.price))||(rule.direction==="below"&&price<=Number(rule.price));
    if(hit){const message=`${rule.pair} is ${rule.direction} ${rule.price}. Current: ${price}.`; triggered.push(message); await s.from("kr_alerts").insert({type:"price",message,priority:"high",active:true}); await s.from("kr_price_alerts").update({active:false,triggered_at:new Date().toISOString()}).eq("id",rule.id); await pushJoin("K-R Price Alert",message);}
  }
  await s.from("kr_logs").insert({type:"price_alert_check",data:{triggered}});
  return res.status(200).json({ok:true,triggered});
 }catch(e){return res.status(500).json({ok:false,error:e.message});}
}
async function safeFetch(url){try{const r=await fetch(url);return await r.json();}catch(e){return {ok:false,error:e.message};}}
function getBaseUrl(){if(process.env.VERCEL_URL)return`https://${process.env.VERCEL_URL}`;if(process.env.NEXT_PUBLIC_SITE_URL)return process.env.NEXT_PUBLIC_SITE_URL;return"http://localhost:3000";}
async function pushJoin(title,text){const apiKey=process.env.JOIN_API_KEY,deviceId=process.env.JOIN_DEVICE_ID;if(!apiKey||!deviceId)return;const url=`https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush?apikey=${encodeURIComponent(apiKey)}&deviceId=${encodeURIComponent(deviceId)}&title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;await fetch(url).catch(()=>{});}
function getSupabase(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return null;return createClient(url,key);}
