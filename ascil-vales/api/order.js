// POST /api/order  { code, items: [{ id, qty }] }  →  guarda el pedido (una sola vez por persona)
// Todo se valida en el servidor: código, producto, cantidades y puntos.
const { CONFIG, norm, isTestCode, send, readBody, tooManyAttempts, registerFailure, getDb } = require("./_lib.js");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  try {
    if (tooManyAttempts(req)) return send(res, 429, { error: "too_many" });
    const { code, items } = await readBody(req);
    const c = norm(code);
    if (isTestCode(c)) return send(res, 200, { ok: true, test: true }); // la prueba nunca guarda nada
    if (!c || !Array.isArray(items) || items.length === 0 || items.length > 60) return send(res, 400, { error: "bad_request" });

    // Unir líneas repetidas y validar cada producto
    const qtyById = new Map();
    for (const it of items) {
      const qty = Number(it && it.qty);
      if (!it || typeof it.id !== "string" || !Number.isInteger(qty) || qty < 1 || qty > 50) return send(res, 400, { error: "bad_items" });
      qtyById.set(it.id, (qtyById.get(it.id) || 0) + qty);
    }
    const lines = [];
    let total = 0;
    for (const [id, qty] of qtyById) {
      const p = CONFIG.products.find((x) => x.id === id);
      if (!p) return send(res, 400, { error: "bad_items" });
      lines.push({ id: p.id, name: p.name, qty, points: p.points });
      total += p.points * qty;
    }
    if (total > CONFIG.pointsPerEmployee) return send(res, 400, { error: "over_budget" });

    const db = getDb();
    const emp = await db.getEmployeeByCode(c);
    if (!emp) { registerFailure(req); return send(res, 404, { error: "invalid" }); }
    const r = await db.createOrder({ employee_id: emp.id, items: lines, total_points: total });
    if (r.conflict) return send(res, 409, { error: "used" });
    return send(res, 200, { ok: true, name: emp.first_name, total_points: total });
  } catch (e) {
    console.error("order", e);
    return send(res, 500, { error: "server" });
  }
};
