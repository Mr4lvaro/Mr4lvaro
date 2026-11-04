// POST /api/login  { code }  →  { ok, name } | { ok, admin } | error
const { CONFIG, norm, isTestCode, send, readBody, isAdminCode, tooManyAttempts, registerFailure, getDb } = require("./_lib.js");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  try {
    if (tooManyAttempts(req)) return send(res, 429, { error: "too_many" });
    const { code } = await readBody(req);
    const c = norm(code);
    if (!c) return send(res, 400, { error: "empty" });

    if (isTestCode(c)) return send(res, 200, { ok: true, test: true, name: CONFIG.testName });
    if (isAdminCode(c)) return send(res, 200, { ok: true, admin: true });

    const db = getDb();
    const emp = await db.getEmployeeByCode(c);
    if (!emp) { registerFailure(req); return send(res, 404, { error: "invalid" }); }
    if (await db.hasOrder(emp.id)) return send(res, 409, { error: "used", name: emp.first_name });
    return send(res, 200, { ok: true, name: emp.first_name });
  } catch (e) {
    console.error("login", e);
    return send(res, 500, { error: "server" });
  }
};
