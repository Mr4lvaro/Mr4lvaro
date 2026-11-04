// Servidor local para probar la web y la API sin Vercel ni Supabase:  node dev-server.js
// Usa una base de datos en memoria (se pierde al reiniciar). Código de administrador por defecto: ADMIN
process.env.USE_MEMORY_DB = process.env.USE_MEMORY_DB || "1";
process.env.ADMIN_CODE = process.env.ADMIN_CODE || "ADMIN";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "public");
const PORT = Number(process.env.PORT) || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json" };

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const m = url.pathname.match(/^\/api\/([a-z]+)$/);
  if (m && fs.existsSync(path.join(__dirname, "api", `${m[1]}.js`))) return require(`./api/${m[1]}.js`)(req, res);

  const rel = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end("No encontrado"); }
  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}  (admin: ${process.env.ADMIN_CODE})`));
