import { createClient } from '@supabase/supabase-js';
const allowed = ["open_chrome","open_notepad","open_calculator","take_screenshot","open_explorer","open_terminal"];
export default async function handler(req,res){
  try{
    const supabase=getSupabase();
    if(req.method==="POST"){
      const {action=""}=req.body||{};
      if(!allowed.includes(action)) return res.status(400).json({ok:false,error:"Action not allowed"});
      if(!supabase) return res.status(200).json({ok:false,error:"Supabase env missing. Laptop persistence requires Supabase."});
      await supabase.from("kr_command_queue").insert({device:"laptop",action,status:"pending"});
      return res.status(200).json({ok:true,action});
    }
    if(req.method==="GET"){
      if(!supabase) return res.status(200).json({ok:false,command:null,error:"Supabase env missing"});
      const {data,error}=await supabase.from("kr_command_queue").select("*").eq("device","laptop").eq("status","pending").order("created_at",{ascending:true}).limit(1);
      if(error) return res.status(500).json({ok:false,error:error.message});
      const cmd=data?.[0];
      if(!cmd) return res.status(200).json({ok:true,command:null});
      await supabase.from("kr_command_queue").update({status:"claimed",claimed_at:new Date().toISOString()}).eq("id",cmd.id);
      return res.status(200).json({ok:true,id:cmd.id,command:cmd.action});
    }
    return res.status(405).json({ok:false,error:"Method not allowed"});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
}
function getSupabase(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return null;return createClient(url,key);}
