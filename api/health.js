export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    gemini: Boolean(process.env.GEMINI_API_KEY),
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    join: Boolean(process.env.JOIN_API_KEY && process.env.JOIN_DEVICE_ID)
  });
}
