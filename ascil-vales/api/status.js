// GET /api/status  (cabecera x-test-code)  →  quién ha enviado su selección y quién no.
// Vista limitada para el código PRUEBA: solo nombre y estado. Sin códigos, pedidos ni notas.
const { send, isTestCode, tooManyAttempts, registerFailure, getDb } = require("./_lib.js");

module.exports = async (req, res) => {
  if (req.method !== "GET") return send(res, 405, { error: "method" });
  try {
    if (tooManyAttempts(req)) return send(res, 429, { error: "too_many" });
    if (!isTestCode(req.headers["x-test-code"])) { registerFailure(req); return send(res, 401, { error: "unauthorized" }); }
    const people = (await getDb().listAll()).filter((p) => !p.is_test).map((p) => ({ name: p.full_name, sent: Boolean(p.order) }));
    return send(res, 200, { ok: true, people });
  } catch (e) {
    console.error("status", e);
    return send(res, 500, { error: "server" });
  }
};
