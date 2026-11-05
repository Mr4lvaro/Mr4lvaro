// GET  /api/admin  (cabecera x-admin-code)  →  personas y pedidos. Solo para el administrador.
// POST /api/admin  { action: "reset", id }  →  borra el pedido de una PERSONA DE PRUEBA (para repetir la prueba).
const { CONFIG, send, readBody, isAdminCode, tooManyAttempts, registerFailure, getDb } = require("./_lib.js");

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") return send(res, 405, { error: "method" });
  try {
    if (tooManyAttempts(req)) return send(res, 429, { error: "too_many" });
    if (!isAdminCode(req.headers["x-admin-code"])) { registerFailure(req); return send(res, 401, { error: "unauthorized" }); }
    const db = getDb();

    if (req.method === "POST") {
      const { action, id } = await readBody(req);
      if (action !== "reset") return send(res, 400, { error: "bad_request" });
      const person = (await db.listAll()).find((p) => p.id === Number(id));
      if (!person || !person.is_test) return send(res, 403, { error: "only_test" }); // nunca se borra el pedido de una persona real
      await db.resetOrder(person.id);
      return send(res, 200, { ok: true });
    }

    const people = await db.listAll();
    return send(res, 200, { ok: true, maxPeople: CONFIG.maxPeople, pointsPerEmployee: CONFIG.pointsPerEmployee, people });
  } catch (e) {
    console.error("admin", e);
    return send(res, 500, { error: "server" });
  }
};
