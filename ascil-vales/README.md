# ASCIL Biopharm · Vale de Navidad

Web de 4 pantallas con servidor (Vercel + Supabase) y panel de administración. **Puesta en marcha: ver [SETUP.md](SETUP.md).**

1. **Código** – el empleado introduce el código de su sobre ("Descubre tu regalo 🎁").
2. **Canje** – animación navideña: sobre que se abre, vale que sube, contador de puntos y confeti.
3. **Tienda** – catálogo de 31 productos con foto y puntos, filtros por categoría y "sin gluten", y cesta que se va llenando.
4. **Confirmación** – el pedido se guarda en la base de datos y sale la carta escrita a mano, con el nombre.
5. **Panel de administración** (código de administrador) – pedidos por persona, pendientes, total por producto, CSV y "Ver como empleado".

## Estructura
- `public/` – la web (HTML, CSS, JS, fotos). Textos y catálogo en `public/js/config.js`.
- `api/` – funciones del servidor: `login`, `order`, `admin`.
- `supabase/schema.sql` – tablas de la base de datos.
- `dev-server.js` – servidor local de pruebas (base de datos en memoria).
- `presentacion/` – PDF de presentación y presupuesto.

## Personalizar (`public/js/config.js`)
`pointsPerEmployee` (1.000), `maxPeople` (26), `letter` y `signature` (carta final), `categories` y `products`
(cada producto: `name`, `detail`, `cat`, `gf`, `points`, `img`). Los textos de las pantallas 1 y 2 están en
`public/index.html` y `public/js/app.js` (`runRedeem`).
