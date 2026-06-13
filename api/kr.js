import { createClient } from '@supabase/supabase-js';

const PHONE_ACTIONS = ["open_binance","open_mexc","open_gateio","open_chrome","open_calculator","open_settings","open_tasker","check_notifications"];
const LAPTOP_ACTIONS = ["open_chrome","open_notepad","open_calculator","take_screenshot","open_explorer","open_terminal","screen_scan"];

const KR_TOOLS = [{
  functionDeclarations: [
    { name:"control_phone", description:"Safely open apps/check notifications on Dikong's Android phone via Join/Tasker.", parameters:{ type:"OBJECT", properties:{ action:{ type:"STRING", enum:PHONE_ACTIONS } }, required:["action"] } },
    { name:"control_laptop", description:"Queue safe laptop commands for the local KR laptop agent.", parameters:{ type:"OBJECT", properties:{ action:{ type:"STRING", enum:LAPTOP_ACTIONS } }, required:["action"] } },
    { name:"get_market_data", description:"Get live market data with RSI/EMA/orderbook/fear-greed when available.", parameters:{ type:"OBJECT", properties:{ pair:{type:"STRING"}, interval:{type:"STRING"} }, required:["pair"] } },
    { name:"web_research", description:"Research the web and summarize results for news, projects, jobs, science, tech, business, or any topic.", parameters:{ type:"OBJECT", properties:{ query:{type:"STRING"}, mode:{type:"STRING"} }, required:["query"] } },
    { name:"save_memory", description:"Save important memory/rule/preference for Dikong.", parameters:{ type:"OBJECT", properties:{ content:{type:"STRING"}, tag:{type:"STRING"}, importance:{type:"STRING", enum:["low","medium","high","critical"]} }, required:["content"] } },
    { name:"set_price_alert", description:"Create price alert. Does not trade.", parameters:{ type:"OBJECT", properties:{ pair:{type:"STRING"}, direction:{type:"STRING", enum:["above","below"]}, price:{type:"NUMBER"} }, required:["pair","direction","price"] } },
    { name:"check_wallet", description:"Check Solana wallet balance and recent signatures.", parameters:{ type:"OBJECT", properties:{ address:{type:"STRING"} }, required:["address"] } },
    { name:"reasoning_engine", description:"Strong reasoning for planning, decisions, explanations, and complex problems.", parameters:{ type:"OBJECT", properties:{ problem:{type:"STRING"} }, required:["problem"] } },
    { name:"coin_report", description:"Generate a coin/project research report.", parameters:{ type:"OBJECT", properties:{ coin:{type:"STRING"} }, required:["coin"] } },
    { name:"tech_planner", description:"Create technical implementation/deployment plan.", parameters:{ type:"OBJECT", properties:{ goal:{type:"STRING"} }, required:["goal"] } },
    { name:"debug_engine", description:"Debug code/errors and suggest fixes.", parameters:{ type:"OBJECT", properties:{ code:{type:"STRING"} }, required:["code"] } },
    { name:"website_builder_plan", description:"Plan website build and deployment workflow. Production deployment requires confirmation.", parameters:{ type:"OBJECT", properties:{ client_request:{type:"STRING"} }, required:["client_request"] } }
  ]
}];

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error:"POST only" });
    const { messages=[], systemExtra="", imageBase64=null } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    if (!apiKey) return res.status(200).json({ reply:`Dikong, GEMINI_API_KEY is missing in Vercel Environment Variables. Offline fallback config is ready: primary local model=${process.env.KR_LOCAL_MODEL_PRIMARY||"TheBloke/Mistral-7B-Instruct-v0.2-GGUF"}, backup=${process.env.KR_LOCAL_MODEL_BACKUP||"GPT4All Falcon"}.` });

    const supabase = getSupabase();
    const latestText = messages[messages.length-1]?.text || "";
    const memory = await loadMemory(supabase);
    const history = await loadHistory(supabase);
    const prefs = await loadPrefs(supabase);
    const agent = chooseAgent(latestText);

    const system = `You are K-R (Kay-Arr), Dikong's personal Jarvis-style AI OS.
Always call the user "Dikong". Be smart, direct, loyal, honest, and protective.

ACTIVE AGENT: ${agent}

LOCAL BACKUP MODELS CONFIGURED:
- Primary offline backup: ${process.env.KR_LOCAL_MODEL_PRIMARY || "TheBloke/Mistral-7B-Instruct-v0.2-GGUF"}
- Emergency backup: ${process.env.KR_LOCAL_MODEL_BACKUP || "GPT4All Falcon"}
- Runner: ${process.env.KR_LOCAL_MODEL_RUNNER || "GPT4All v3.10.0"}
- Model files stay on Dikong's laptop; Supabase stores memory/config only.

LIVE TOOLS ARE AVAILABLE:
- get_market_data for BTC/ETH/SOL/markets/RSI/EMA/price/trend.
- web_research for current news, business, tech, science, jobs, clients, websites.
- save_memory for user rules and long-term memory.
- set_price_alert for alerts only, no trading.
- check_wallet for wallet status.
- reasoning_engine for deep thinking/planning.
- coin_report for crypto/project reports.
- tech_planner/debug_engine/website_builder_plan for code, websites, deployment.
- control_phone/control_laptop for safe device commands.

VOICE MODE:
Voice input in Chat tab is treated like chat and can use all tools through this brain.

SAFETY:
- NEVER auto buy/sell, withdraw, transfer, approve payment, delete files, or click high-risk buttons.
- Trading and deployment require Dikong confirmation before final action.
- Do not expose API keys or secrets.
- If uncertain or risky, ask confirmation.

PREFERENCES:
${JSON.stringify(prefs)}

MEMORY:
${memory}

RECENT CHAT:
${history}

${systemExtra || ""}`;

    const contents = buildContents(messages, imageBase64);
    const first = await callGemini(apiKey, model, { systemInstruction:{parts:[{text:system}]}, contents, tools:KR_TOOLS, generationConfig:{temperature:0.45, topP:0.9, maxOutputTokens:1600} });
    const parts = first?.candidates?.[0]?.content?.parts || [];
    let reply = "";
    const toolResults = [];

    for (const part of parts) {
      if (part.text) reply += part.text + "\n";
      if (part.functionCall) {
        const { name, args={} } = part.functionCall;
        toolResults.push({ name, args, result: await runTool(name,args) });
      }
    }

    if (toolResults.length) {
      const follow = await callGemini(apiKey, model, {
        systemInstruction:{parts:[{text:system}]},
        contents:[...contents, {role:"model",parts}, {role:"user",parts:[{text:`Tool results:\n${JSON.stringify(toolResults).slice(0,12000)}\n\nGive Dikong the final answer. Mention missing setup/env if any. Keep safety rules.`}]}],
        generationConfig:{temperature:0.4, maxOutputTokens:1800}
      });
      const finalText = follow?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("\n").trim();
      if (finalText) reply = finalText;
    }

    reply = reply.trim() || "Dikong, K-R is online but Gemini gave no reply.";
    await logSupabase(supabase,"chat",{latest:latestText,reply,agent,toolResults});
    if (supabase && latestText) await supabase.from("kr_conversation_history").insert([{role:"user",content:latestText,session_id:"default"},{role:"kr",content:reply,session_id:"default"}]).catch(()=>{});
    return res.status(200).json({reply,agent,toolResults});
  } catch(e) {
    return res.status(500).json({reply:"KR backend error: "+e.message});
  }
}

function buildContents(messages,imageBase64){
  const contents=[];
  for(const m of (Array.isArray(messages)?messages:[]).slice(-14)){
    const role=m.role==="kr"?"model":"user";
    const parts=[];
    const img=m.image||imageBase64;
    if(img) parts.push({inlineData:{mimeType:"image/jpeg",data:img}});
    parts.push({text:String(m.text||"").slice(0,6000)});
    contents.push({role,parts});
  }
  if(!contents.length) contents.push({role:"user",parts:[{text:"Hello K-R"}]});
  return contents;
}

function chooseAgent(text=""){
  const t=text.toLowerCase();
  if(/btc|eth|sol|price|market|rsi|ema|trade|chart|mexc|binance|forex|stock|gold|oil/.test(t)) return "market";
  if(/website|client|business|proposal|crm|deploy|vercel|github|supabase/.test(t)) return "business/deployment";
  if(/code|bug|error|debug|api|script|fix/.test(t)) return "code";
  if(/research|news|search|learn|science|what is|latest/.test(t)) return "research";
  if(/open|phone|laptop|tasker|screen|screenshot/.test(t)) return "ops";
  if(/remember|memory|save this|forget/.test(t)) return "memory";
  return "brain";
}

async function runTool(name,args){
  try{
    if(name==="control_phone") return await triggerPhone(args.action);
    if(name==="control_laptop") return await triggerLaptop(args.action);
    if(name==="get_market_data") return await callLocal(`/api/market-data?pair=${encodeURIComponent(args.pair)}&interval=${encodeURIComponent(args.interval||"15m")}`);
    if(name==="web_research") return await callLocal(`/api/web-research`,"POST",{query:args.query,mode:args.mode||"research"});
    if(name==="save_memory") return await saveMemory(args.content,args.tag||"chat",args.importance||"high");
    if(name==="set_price_alert") return await setPriceAlert(args.pair,args.direction,args.price);
    if(name==="check_wallet") return await callLocal(`/api/solana-wallet?address=${encodeURIComponent(args.address)}`);
    if(name==="reasoning_engine") return await callLocal(`/api/reasoning-engine`,"POST",{problem:args.problem});
    if(name==="coin_report") return await callLocal(`/api/coin-report`,"POST",{coin:args.coin});
    if(name==="tech_planner") return await callLocal(`/api/tech-planner`,"POST",{goal:args.goal});
    if(name==="debug_engine") return await callLocal(`/api/debug-engine`,"POST",{code:args.code});
    if(name==="website_builder_plan") return await callLocal(`/api/tech-planner`,"POST",{goal:"Build/deploy website request: "+args.client_request});
    return {ok:false,error:"Unknown tool"};
  }catch(e){return {ok:false,error:e.message};}
}

async function callGemini(apiKey,model,body){
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await r.json();
  if(!r.ok) throw new Error(data?.error?.message||"Gemini API error");
  return data;
}

async function callLocal(path,method="GET",body=null){
  const r=await fetch(getBaseUrl()+path,{method,headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});
  const data=await r.json().catch(()=>({}));
  if(!r.ok || data.ok===false) return {ok:false,error:data.error||data.reply||"API failed",data};
  return data;
}

async function triggerPhone(action){
  if(!PHONE_ACTIONS.includes(action)) return {ok:false,error:"Phone action not allowed"};
  const apiKey=process.env.JOIN_API_KEY, deviceId=process.env.JOIN_DEVICE_ID;
  if(!apiKey||!deviceId) return {ok:false,error:"JOIN_API_KEY or JOIN_DEVICE_ID missing"};
  const url=`https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush?apikey=${encodeURIComponent(apiKey)}&deviceId=${encodeURIComponent(deviceId)}&title=${encodeURIComponent("KR")}&text=${encodeURIComponent("kr_action:"+action)}`;
  const r=await fetch(url);
  return {ok:r.ok,action,error:r.ok?undefined:"Join failed "+r.status};
}

async function triggerLaptop(action){
  if(!LAPTOP_ACTIONS.includes(action)) return {ok:false,error:"Laptop action not allowed"};
  return await callLocal(`/api/laptop`,"POST",{action});
}

async function saveMemory(content,tag,importance){
  const s=getSupabase();
  if(!s) return {ok:false,error:"Supabase env missing"};
  await s.from("kr_memory").insert({content,tag,importance}).throwOnError();
  return {ok:true,content,tag,importance};
}

async function setPriceAlert(pair,direction,price){
  const s=getSupabase();
  if(!s) return {ok:false,error:"Supabase env missing"};
  await s.from("kr_price_alerts").insert({pair,direction,price,active:true}).throwOnError();
  return {ok:true,pair,direction,price};
}

async function loadMemory(s){if(!s)return"Supabase not connected.";const {data=[]}=await s.from("kr_memory").select("content,tag,importance").order("created_at",{ascending:false}).limit(10);return data.map(m=>`- [${m.importance||"medium"}:${m.tag||"memory"}] ${m.content}`).join("\n");}
async function loadPrefs(s){if(!s)return{};const {data=[]}=await s.from("kr_user_preferences").select("*").order("created_at",{ascending:false}).limit(1);return data[0]||{};}
async function loadHistory(s){if(!s)return"";const {data=[]}=await s.from("kr_conversation_history").select("role,content").order("created_at",{ascending:false}).limit(8);return data.reverse().map(h=>`${h.role}: ${h.content}`).join("\n");}
async function logSupabase(s,type,data){if(!s)return;await s.from("kr_logs").insert({type,data}).catch(()=>{});}
function getBaseUrl(){if(process.env.VERCEL_URL)return`https://${process.env.VERCEL_URL}`;if(process.env.NEXT_PUBLIC_SITE_URL)return process.env.NEXT_PUBLIC_SITE_URL;return"http://localhost:3000";}
function getSupabase(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return null;return createClient(url,key);}
