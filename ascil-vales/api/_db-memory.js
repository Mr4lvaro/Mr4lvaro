// Base de datos en memoria: SOLO para probar en local (USE_MEMORY_DB=1). Se pierde al reiniciar.
const fs = require("fs");
const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

let seed = [
  { full_name: "Ana Prueba Uno", first_name: "Ana", code: "TEST-01", notes: "" },
  { full_name: "Luis Prueba Dos", first_name: "Luis", code: "TEST-02", notes: "Celiaco" },
  { full_name: "Marta Prueba Tres", first_name: "Marta", code: "TEST-03", notes: "" },
];
// Empleados de prueba: SEED_FILE, o private/employees.json / private/employees.csv si existen
function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const cols = lines.shift().split(",");
  return lines.map((l) => {
    const cells = []; let cur = "", q = false;
    for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { cells.push(cur); cur = ""; } else cur += ch; }
    cells.push(cur);
    return Object.fromEntries(cols.map((c, i) => [c.trim(), cells[i] || ""]));
  });
}
const path = require("path");
const candidates = [process.env.SEED_FILE, path.join(__dirname, "../private/employees.json"), path.join(__dirname, "../private/employees.csv")].filter(Boolean);
const found = candidates.find((f) => fs.existsSync(f));
if (found) seed = found.endsWith(".csv") ? parseCsv(fs.readFileSync(found, "utf8")) : JSON.parse(fs.readFileSync(found, "utf8"));

const employees = seed.map((e, i) => ({ id: i + 1, notes: "", ...e }));
const orders = new Map(); // employee_id -> pedido

module.exports = {
  async getEmployeeByCode(codeNorm) { return employees.find((e) => norm(e.code) === codeNorm) || null; },
  async hasOrder(id) { return orders.has(id); },
  async createOrder({ employee_id, items, total_points }) {
    if (orders.has(employee_id)) return { conflict: true };
    orders.set(employee_id, { items, total_points, created_at: new Date().toISOString() });
    return { ok: true };
  },
  async listAll() { return employees.map((e) => ({ ...e, order: orders.get(e.id) || null })); },
};
