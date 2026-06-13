import { createClient } from '@supabase/supabase-js';

export default async function handler(req,res){
  try{
    const address = req.query.address || req.body?.address || process.env.SOLANA_WATCH_WALLET;
    if(!address) return res.status(400).json({ok:false,error:"wallet address required"});

    const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const balanceData = await rpcCall(rpc, "getBalance", [address]);
    const sigData = await rpcCall(rpc, "getSignaturesForAddress", [address, { limit: 5 }]);

    const sol = (balanceData?.result?.value || 0) / 1_000_000_000;
    const payload = { ok:true, address, solBalance:sol, recentSignatures:sigData?.result || [] };

    const supabase=getSupabase();
    if(supabase) await supabase.from("kr_logs").insert({type:"solana_wallet_check",data:payload}).catch(()=>{});

    return res.status(200).json(payload);
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
}

async function rpcCall(rpc, method, params){
  const r=await fetch(rpc,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})});
  return await r.json();
}
function getSupabase(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return null;return createClient(url,key);}
