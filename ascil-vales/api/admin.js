// GET /api/admin  (cabecera x-admin-code)  →  personas y pedidos. Solo para el administrador.
const { CONFIG, send, isAdminCode, tooManyAttempts, registerFailure, getDb } = require("./_lib.js");

module.exports = async (req, res) => {
  if (req.method !== "GET") return send(res, 405, { error: "method" });
  try {
    if (tooManyAttempts(req)) return send(res, 429, { error: "too_many" });
    if (!isAdminCode(req.headers["x-admin-code"])) { registerFailure(req); return send(res, 401, { error: "unauthorized" }); }
    const people = await getDb().listAll();
    return send(res, 200, { ok: true, maxPeople: CONFIG.maxPeople, pointsPerEmployee: CONFIG.pointsPerEmployee, people });
  } catch (e) {
    console.error("admin", e);
    return send(res, 500, { error: "server" });
  }
};
