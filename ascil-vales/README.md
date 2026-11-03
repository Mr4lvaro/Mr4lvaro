# ASCIL Biopharm · Vale de Navidad

Web estática de 4 pantallas (sin dependencias, abre `index.html` o súbela a cualquier hosting):

1. **Código** – el empleado introduce el código de su sobre ("Descubre tu regalo 🎁").
2. **Canje** – animación navideña: sobre que se abre, vale que sube, contador de puntos y confeti.
3. **Tienda** – catálogo de 31 productos con foto y puntos, filtros por categoría y "sin gluten", y una cesta que se va llenando (en móvil, cajón inferior).
4. **Confirmación** – carta de felicitación escrita a mano, con el nombre de la persona y la firma.

## Personalizar
Todo en `js/config.js`:
- `pointsPerEmployee`: puntos por persona (1.000).
- `codes`: un código por empleado y su nombre (sale en el mensaje final).
- `letter` y `signature`: texto de la carta final y firma.
- `categories` y `products`: catálogo. Cada producto lleva `name`, `detail`, `cat`, `gf` (sin gluten), `points` e `img` (foto en `assets/products/`).

Los textos de las pantallas 1 y 2 están en `index.html` y `js/app.js` (función `runRedeem`).

## Importante
Los códigos y su "ya canjeado" se validan en el navegador (localStorage): válido para una demo.
Para el reparto real hace falta un servidor (o formulario/hoja de cálculo) que valide cada código una sola vez y reciba el pedido final.
