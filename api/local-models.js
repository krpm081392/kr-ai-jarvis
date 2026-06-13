// K-R Local Models Registry (ADD-ONLY)
// These are the local GPT4All models Dikong currently has installed on the laptop.
// Important: model files stay on the laptop. Supabase/Vercel only store names/config.

const LOCAL_MODELS = [
  {
    id: "gpt4all-falcon-q4_0",
    name: "GPT4All Falcon",
    runner: "GPT4All v3.10.0",
    type: "Falcon",
    parameters: "7B",
    quantization: "q4_0",
    fileSize: "3.92 GB",
    ramRequired: "8 GB",
    role: "emergency_backup",
    notes: "Fast local fallback model. Keep as emergency backup only."
  },
  {
    id: "mistral-7b-instruct-v0.2-gguf-q4_0",
    name: "TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
    runner: "GPT4All v3.10.0",
    type: "Mistral",
    parameters: "7B",
    quantization: "q4_0",
    fileSize: "3.83 GB",
    ramRequired: "~8 GB",
    role: "primary_offline_backup",
    notes: "Best current offline backup brain for K-R from the installed models."
  }
];

export default async function handler(req, res) {
  const primary = process.env.KR_LOCAL_MODEL_PRIMARY || "TheBloke/Mistral-7B-Instruct-v0.2-GGUF";
  const backup = process.env.KR_LOCAL_MODEL_BACKUP || "GPT4All Falcon";
  const runner = process.env.KR_LOCAL_MODEL_RUNNER || "GPT4All v3.10.0";
  const endpoint = process.env.KR_LOCAL_MODEL_ENDPOINT || "local laptop only - not exposed on Vercel";

  return res.status(200).json({
    ok: true,
    message: "K-R local model registry loaded. Model files stay on Dikong's laptop; Supabase only stores config/memory.",
    primary,
    backup,
    runner,
    endpoint,
    models: LOCAL_MODELS,
    safe_rule: "Use Gemini first when online. If Gemini/API/internet is unavailable, use local Mistral. Falcon stays as emergency backup."
  });
}
