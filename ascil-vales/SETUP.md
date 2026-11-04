# Puesta en marcha: Supabase + Vercel

La web (`public/`) la sirve Vercel. Las funciones del servidor (`api/`) validan los códigos, guardan los pedidos
en Supabase y alimentan el panel de administración. Los códigos y nombres **no** están en la web: solo en la base de datos.

## 1. Supabase (base de datos)
1. Crea un proyecto en https://supabase.com (región UE, p. ej. Frankfurt).
2. **SQL Editor** → pega y ejecuta `supabase/schema.sql` (crea las tablas, limita a 26 personas y bloquea el acceso público).
3. En el mismo editor ejecuta `private/seed_employees.sql` (los 26 empleados con su código).
   *Alternativa:* **Table Editor → employees → Import data from CSV** con `private/employees.csv`.
4. **Project Settings → API**: copia la *Project URL* y la clave **service_role** (¡secreta, nunca en la web!).

## 2. Vercel
1. *Add New Project* → importa el repositorio. **Root Directory:** `ascil-vales`. Framework: *Other*. Sin build.
2. **Settings → Environment Variables** (Production y Preview):

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | la Project URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | la clave service_role |
| `ADMIN_CODE` | el código de administrador (ver abajo) |

3. *Redeploy* para que tome las variables.

## 3. Usar la web
- Los empleados entran con su código del sobre. Cada código solo puede hacer **un** pedido.
- Con el código de administrador se entra al **panel**: quién ha elegido y qué, quién falta, total por producto,
  descarga en CSV (se abre en Excel) y **"Ver como empleado"** (modo prueba: no guarda nada ni gasta códigos).
- Para probar en local sin Supabase: `node dev-server.js` (base de datos en memoria, admin = `ADMIN`).

## Seguridad
- El `ADMIN_CODE` da acceso a nombres, códigos y pedidos de todo el personal. **Usa uno largo y poco adivinable**
  (p. ej. `ASCIL-admin-2026-xxxx`) y cámbialo cuando termine la campaña.
- Los datos personales (`private/`) no se suben al repositorio (`.gitignore`). No los publiques.
- La clave `service_role` solo debe estar en Vercel (variables de entorno).
