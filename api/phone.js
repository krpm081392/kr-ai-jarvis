export default async function handler(req,res){
 try{
  if(req.method!=="POST") return res.status(405).json({ok:false,error:"POST only"});
  const {action=""}=req.body||{};
  const apiKey=process.env.JOIN_API_KEY, deviceId=process.env.JOIN_DEVICE_ID;
  if(!apiKey||!deviceId) return res.status(200).json({ok:false,error:"JOIN_API_KEY or JOIN_DEVICE_ID missing"});
  const allowed=["open_binance","open_mexc","open_gateio","open_chrome","open_calculator","open_settings","open_tasker","check_notifications"];
  if(!allowed.includes(action)) return res.status(400).json({ok:false,error:"Action not allowed"});
  const url=`https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush?apikey=${encodeURIComponent(apiKey)}&deviceId=${encodeURIComponent(deviceId)}&title=${encodeURIComponent("KR")}&text=${encodeURIComponent("kr_action:"+action)}`;
  const r=await fetch(url);
  if(!r.ok) return res.status(500).json({ok:false,error:"Join API failed: "+r.status});
  return res.status(200).json({ok:true,action});
 }catch(e){return res.status(500).json({ok:false,error:e.message});}
}
