import { createClient } from '@supabase/supabase-js';

const allowedActions = ['open_binance','open_chrome','open_mexc','open_gateio','open_calculator','open_settings','open_tasker','check_notifications'];

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ reply: 'POST only' });
    const { message = '', history = [] } = req.body || {};
    if (!message.trim()) return res.status(200).json({ reply: 'Dikong, send me a command first.' });

    const systemPrompt = `You are K-R, Dikong's Jarvis-style AI assistant.
Call the user Dikong. Be loyal, smart, direct, calm, honest.
KR Packs: Intelligence, Phone Control via Join/Tasker/AutoInput, Laptop Control via KR Agent, Trading Assistant, Supabase Memory, Security, Builder.
Safety: never auto buy, auto sell, auto confirm, send money, delete files, or do irreversible actions. For trading entry/exit always ask Dikong first.
If phone action is needed, end reply with exactly: ACTION: action_name
Allowed actions: open_binance, open_chrome, open_mexc, open_gateio, open_calculator, open_settings, open_tasker, check_notifications.
If no live market data is provided, say you need screenshot/live API before exact market call.`;

    const raw = await askGemini(systemPrompt, message, history);
    const action = extractAction(raw);
    let reply = raw.replace(/\n?ACTION:\s*[a-zA-Z0-9_]+\s*$/i, '').trim();

    await saveMemory('chat', { message, reply, action });

    if (action) {
      const sent = await sendJoin(action, message).catch(e => ({ ok:false, error:e.message }));
      reply += sent.ok ? `\n\n✅ Sent to phone: ${action}` : `\n\n⚠️ Phone bridge not connected yet: add JOIN_API_KEY and JOIN_DEVICE_ID in Vercel.`;
    }
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ reply: 'KR backend error: ' + e.message });
  }
}

async function askGemini(systemPrompt, message, history) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  if (!apiKey) return 'Dikong, GEMINI_API_KEY is missing in Vercel Environment Variables.';

  const contents = [];
  for (const m of Array.isArray(history) ? history.slice(-12) : []) {
    if (!m?.text) continue;
    contents.push({ role: m.role === 'kr' ? 'model' : 'user', parts: [{ text: String(m.text).slice(0, 2500) }] });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method:'POST', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ systemInstruction:{ parts:[{ text: systemPrompt }] }, contents, generationConfig:{ temperature:0.7, topP:0.9, maxOutputTokens:1200 } })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || JSON.stringify(data));
  return data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('\n').trim() || 'Dikong, Gemini gave no reply.';
}

function extractAction(text) {
  const match = String(text).match(/ACTION:\s*([a-zA-Z0-9_]+)/i);
  if (!match) return null;
  const action = match[1].trim();
  return allowedActions.includes(action) ? action : null;
}

async function sendJoin(action, originalMessage) {
  const apiKey = process.env.JOIN_API_KEY, deviceId = process.env.JOIN_DEVICE_ID;
  if (!apiKey || !deviceId) return { ok:false };
  const url = `https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush?apikey=${encodeURIComponent(apiKey)}&deviceId=${encodeURIComponent(deviceId)}&title=KR&text=${encodeURIComponent('kr_action:'+action)}&clipboard=${encodeURIComponent(JSON.stringify({source:'KR',action,originalMessage}))}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Join API failed ' + r.status);
  return { ok:true };
}

async function saveMemory(type, data) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const supabase = createClient(url, key);
  await supabase.from('kr_logs').insert({ type, data });
}
