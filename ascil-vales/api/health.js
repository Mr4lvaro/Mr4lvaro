// GET /api/health  →  diagnóstico de la configuración (no muestra ningún secreto)
const { send } = require("./_lib.js");

function keyRole(key) {
  if (!key) return null;
  if (key.startsWith("sb_secret_")) return "service_role";
  if (key.startsWith("sb_publishable_")) return "anon";
  try { return JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role || null; } catch { return null; }
}

module.exports = async (req, res) => {
  const url = (process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const out = {
    api: "ok",
    SUPABASE_URL: Boolean(url),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(key),
    ADMIN_CODE: Boolean(process.env.ADMIN_CODE),
    problemas: [],
  };
  if (!url) out.problemas.push("Falta la variable SUPABASE_URL en Vercel.");
  else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) out.problemas.push("SUPABASE_URL debe ser solo la Project URL, tipo https://xxxx.supabase.co (sin /rest/v1 ni nada más).");
  if (!key) out.problemas.push("Falta la variable SUPABASE_SERVICE_ROLE_KEY en Vercel.");
  else if (keyRole(key) === "anon") out.problemas.push("La clave puesta es la 'anon/publishable'. Hay que usar la 'service_role' (Project Settings → API).");
  if (!process.env.ADMIN_CODE) out.problemas.push("Falta la variable ADMIN_CODE: sin ella el código de administrador no funciona.");

  if (url && key) {
    try {
      const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/employees?select=id`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
      out.supabase_status = r.status;
      if (r.ok) {
        out.empleados = (await r.json()).length;
        if (out.empleados !== 26) out.problemas.push(`En la tabla employees hay ${out.empleados} personas (deberían ser 26). ¿Se ejecutó el SQL completo?`);
      } else if (r.status === 401 || r.status === 403) out.problemas.push("Supabase rechaza la clave (401/403): revisa que sea la service_role y esté bien copiada, sin espacios.");
      else if (r.status === 404) out.problemas.push("Supabase responde 404: la tabla employees no existe (ejecuta el SQL) o la URL es de otro proyecto.");
      else out.problemas.push(`Supabase respondió con el estado ${r.status}.`);
    } catch (e) {
      out.supabase_status = 0;
      out.problemas.push("No se puede conectar con Supabase: revisa SUPABASE_URL.");
    }
  }
  out.ok = out.problemas.length === 0;
  return send(res, 200, out);
};
