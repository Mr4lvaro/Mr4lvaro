# ASCIL Biopharm · Vale de Navidad

Web estática de 4 pantallas (sin dependencias, abre `index.html` o súbela a cualquier hosting):

1. **Código** – el empleado introduce el código de su sobre.
2. **Canje** – animación navideña: sobre que se abre, vale que sube, contador de puntos y confeti.
3. **Tienda** – cuadrícula de productos y cesta lateral (en móvil, cajón inferior) con animación al añadir y barra de puntos.
4. **Confirmación** – resumen del pedido y opción de imprimir/guardar.

## Personalizar
Todo en `js/config.js`: puntos por empleado, códigos válidos y catálogo (nombre, emoji, puntos).
Para fotos reales, sustituye el `emoji` por una imagen en `renderGrid()` de `js/app.js`.

## Importante
Los códigos y su “ya canjeado” se validan en el navegador (localStorage), válido para una demo.
Para el reparto real hace falta un backend (o formulario/hoja de cálculo) que valide cada código una sola vez y reciba el pedido final.
