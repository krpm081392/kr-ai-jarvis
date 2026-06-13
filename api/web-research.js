import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const { query = "", mode = "research" } = req.method === "POST" ? (req.body || {}) : (req.query || {});
    if (!query) return res.status(400).json({ ok:false, error:"query required" });

    const results = await webSearch(query);
    const summary = await summarizeResearch(query, results, mode);

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("kr_logs").insert({ type:"web_research", data:{ query, results, summary } }).catch(()=>{});
    }

    return res.status(200).json({ ok:true, query, results, summary });
  } catch (e) {
    return res.status(500).json({ ok:false, error:e.message });
  }
}

async function webSearch(query) {
  const googleKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;

  if (googleKey && googleCx) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(googleKey)}&cx=${encodeURIComponent(googleCx)}&q=${encodeURIComponent(query)}&num=5`;
    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || "Google search error");
    return (data.items || []).map(x => ({ title:x.title, link:x.link, snippet:x.snippet }));
  }

  // Free fallback: limited quality, but works without API key.
  const ddg = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const r = await fetch(ddg);
  const data = await r.json();
  const related = (data.RelatedTopics || []).slice(0,5).map(x => ({
    title: x.Text || x.Name || "Result",
    link: x.FirstURL || "",
    snippet: x.Text || ""
  }));
  return [
    data.AbstractText ? { title:data.Heading || query, link:data.AbstractURL || "", snippet:data.AbstractText } : null,
    ...related
  ].filter(Boolean);
}

async function summarizeResearch(query, results, mode) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  if (!apiKey) return "Dikong, I found web results, but GEMINI_API_KEY is missing so I cannot summarize them yet.";

  const prompt = `You are K-R Research Agent. Summarize this web research for Dikong.
Mode: ${mode}
Query: ${query}

Results:
${results.map((r,i)=>`${i+1}. ${r.title}\n${r.snippet}\n${r.link}`).join("\n\n")}

Rules:
- Be honest if results are weak.
- Include key points.
- Include risks/what to verify.
- Do not invent facts.
- Keep it concise.`;

  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ contents:[{ role:"user", parts:[{ text:prompt }] }], generationConfig:{ temperature:0.35, maxOutputTokens:1000 } })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || "Gemini summarize error");
  return data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("\n").trim() || "No summary.";
}

function getSupabase(){
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) return null;
  return createClient(url,key);
}
