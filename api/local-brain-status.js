export default function handler(req,res){
  res.status(200).json({
    ok:true,
    localAiUrlConfigured:Boolean(process.env.LOCAL_AI_URL),
    queueModeConfigured:Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    recommended:"Run laptop-agent/kr_local_brain_agent.py while GPT4All is open or install gpt4all Python package.",
    env:{
      optional:["LOCAL_AI_URL","LOCAL_AI_TOKEN","LOCAL_AI_TIMEOUT_MS"],
      requiredForQueue:["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"]
    }
  });
}