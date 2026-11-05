// Acceso a Supabase por su API REST (PostgREST). Solo se usa desde el servidor.
const base = () => `${process.env.SUPABASE_URL.trim().replace(/\/$/, "")}/rest/v1`;
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY.trim();

async function rest(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(base() + path, {
    method,
    headers: { apikey: key(), Authorization: `Bearer ${key()}`, "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* sin cuerpo JSON */ }
  return { status: res.status, ok: res.ok, data };
}

module.exports = {
  async getEmployeeByCode(codeNorm) {
    const r = await rest(`/employees?code_norm=eq.${encodeURIComponent(codeNorm)}&select=id,first_name,full_name,code&limit=1`);
    if (!r.ok) throw new Error(`Supabase ${r.status}`);
    return r.data[0] || null;
  },
  async hasOrder(employeeId) {
    const r = await rest(`/orders?employee_id=eq.${Number(employeeId)}&select=id&limit=1`);
    if (!r.ok) throw new Error(`Supabase ${r.status}`);
    return r.data.length > 0;
  },
  // Devuelve { conflict: true } si esa persona ya tenía pedido
  async createOrder({ employee_id, items, total_points }) {
    const r = await rest("/orders", { method: "POST", body: { employee_id, items, total_points }, headers: { Prefer: "return=minimal" } });
    if (r.status === 409) return { conflict: true };
    if (!r.ok) throw new Error(`Supabase ${r.status}`);
    return { ok: true };
  },
  async resetOrder(employeeId) {
    const r = await rest(`/orders?employee_id=eq.${Number(employeeId)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    if (!r.ok) throw new Error(`Supabase ${r.status}`);
  },
  async listAll() {
    const r = await rest("/employees?select=id,full_name,first_name,code,notes,is_test,orders(items,total_points,created_at)&order=id.asc");
    if (!r.ok) throw new Error(`Supabase ${r.status}`);
    return r.data.map((e) => {
      const o = Array.isArray(e.orders) ? e.orders[0] : e.orders;
      const { orders, ...rest } = e;
      return { ...rest, order: o || null };
    });
  },
};
