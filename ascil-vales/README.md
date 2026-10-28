# ASCIL Biopharm · Vale de Navidad

Web estática de 4 pantallas (sin dependencias, abre `index.html` o súbela a cualquier hosting):

1. **Código** – el empleado introduce el código de su sobre.
2. **Canje** – animación navideña: sobre que se abre, vale que sube, contador de puntos y confeti.
3. **Tienda** – cuadrícula de productos y cesta lateral (en móvil, cajón inferior) con animación al añadir y barra de puntos.
4. **Confirmación** – resumen del pedido y opción de imprimir/guardar.

## Personalizar
Todo en `js/config.js`: puntos por empleado, códigos válidos (cada uno con el nombre de la persona, que sale en el mensaje final) y catálogo (nombre, emoji, puntos).
**Fotos de productos:** copia las imágenes a `assets/products/` y añade `img: "assets/products/jamon.jpg"` al producto en `js/config.js` (cuadradas, mejor ~600×600). Salen en la tienda, la cesta, el resumen y la caja final. Sin `img` se usa el emoji. Los puntos de cada producto se cambian en `points`.
**Caja base:** `baseBox` en `js/config.js` (siempre aparece como "Incluida" en el resumen final). Ponlo a `null` para quitarla.

## Importante
Los códigos y su “ya canjeado” se validan en el navegador (localStorage), válido para una demo.
Para el reparto real hace falta un backend (o formulario/hoja de cálculo) que valide cada código una sola vez y reciba el pedido final.
