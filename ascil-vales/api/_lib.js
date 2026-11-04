// Utilidades compartidas por los endpoints. Los ficheros que empiezan por "_" no son rutas.
const crypto = require("crypto");
const CONFIG = require("../public/js/config.js");

const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const isTestCode = (code) => norm(code) !== "" && norm(code) === norm(CONFIG.testCode);

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { return {}; }
}

// Comparación a tiempo constante
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// El código de administrador vive solo en la variable de entorno ADMIN_CODE
function isAdminCode(code) {
  const admin = norm(process.env.ADMIN_CODE);
  return Boolean(admin) && safeEqual(norm(code), admin);
}

// Limitador de intentos (por IP, en memoria: reduce la fuerza bruta, no la elimina)
const attempts = new Map();
function tooManyAttempts(req, { max = 20, windowMs = 10 * 60 * 1000 } = {}) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?").split(",")[0].trim();
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter((t) => now - t < windowMs);
  attempts.set(ip, list);
  return list.length >= max;
}
function registerFailure(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?").split(",")[0].trim();
  attempts.set(ip, [...(attempts.get(ip) || []), Date.now()]);
}

function getDb() {
  if (process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return require("./_db-supabase.js");
  if (process.env.USE_MEMORY_DB === "1") return require("./_db-memory.js");
  throw new Error("Base de datos no configurada (faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY)");
}

module.exports = { CONFIG, norm, isTestCode, send, readBody, isAdminCode, tooManyAttempts, registerFailure, getDb };
