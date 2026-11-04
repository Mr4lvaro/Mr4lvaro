// Configuración editable de la campaña. No requiere tocar nada más.
const CONFIG = {
  company: "ASCIL Biopharm",
  pointsPerEmployee: 1000,

  // Máximo de personas con vale (también lo limita la base de datos).
  maxPeople: 26,

  // Código de PRUEBA para que cualquiera pruebe la web: sin caducidad, usos ilimitados, entra con este
  // nombre, NO guarda ningún pedido y NO da acceso al panel de administración.
  testCode: "PRUEBA",
  testName: "Ruth",

  // Solo para probar sin servidor: abre la web con ?demo en la dirección (nada se guarda).
  // Los códigos y nombres reales NO están aquí: viven en la base de datos (Supabase).
  demoCodes: { "DEMO-01": "Ana", "DEMO-02": "Luis", "DEMO-03": "" },

  // Carta final: cada elemento es un párrafo que se va escribiendo a mano.
  // "signature" es opcional: déjalo vacío ("") para no firmar.
  letter: [
    "Que estas fiestas te regalen momentos de felicidad, salud y bienestar, y que el nuevo año llegue lleno de energía, ilusión y nuevos proyectos.",
    "Gracias por acompañarnos y formar parte de nuestro equipo un año más.",
    "Con nuestros mejores deseos y todo nuestro cariño,",
  ],
  signature: "ASCIL Biopharm 🎄🌟",

  // Cestas ya preparadas para quien no quiere elegir (cada una suma los 1.000 puntos).
  // Se rellenan con un clic y la persona aún puede cambiarlas antes de confirmar.
  presetBaskets: [
    { id: "sorpresa", name: "Cesta sorpresa", emoji: "🎁",
      text: "Un poco de todo: vino, cava, jamón, quesos y dulces navideños.",
      items: [{ id: "p03", qty: 1 }, { id: "p05", qty: 1 }, { id: "p06", qty: 1 }, { id: "p14", qty: 1 }, { id: "p18", qty: 1 }, { id: "p20", qty: 1 }, { id: "p31", qty: 1 }] },
    { id: "sin-gluten", name: "Cesta sin gluten", emoji: "🌾",
      text: "La misma idea, con todos los productos aptos para celíacos.",
      items: [{ id: "p03", qty: 1 }, { id: "p05", qty: 1 }, { id: "p06", qty: 1 }, { id: "p14", qty: 1 }, { id: "p18", qty: 1 }, { id: "p20", qty: 1 }, { id: "p15", qty: 1 }] },
  ],

  // Categorías del catálogo (en el orden en que aparecen en los filtros)
  categories: [
    { id: "bodega",   name: "Bodega" },
    { id: "ibericos", name: "Ibéricos" },
    { id: "mesa",     name: "Foie, quesos y aceite" },
    { id: "turrones", name: "Turrones y neules" },
    { id: "dulces",   name: "Dulces y bombones" },
  ],

  // Catálogo: 31 productos. "points" = puntos que cuesta, "img" = foto, "gf" = sin gluten.
  products: [
    { id: "p01", name: "Albariño Mar de Frades", detail: "Vino blanco · D.O. Rías Baixas · 75 cl", cat: "bodega", gf: true, points: 300, img: "assets/products/p01.jpg" },
    { id: "p02", name: "Viña Esmeralda", detail: "Vino blanco · D.O. Catalunya · 75 cl", cat: "bodega", gf: true, points: 150, img: "assets/products/p02.jpg" },
    { id: "p03", name: "Ramón Bilbao Crianza", detail: "Vino tinto · D.O.Ca. Rioja · 75 cl", cat: "bodega", gf: true, points: 190, img: "assets/products/p03.jpg" },
    { id: "p04", name: "Protos Roble", detail: "Vino tinto · D.O. Ribera del Duero · 75 cl", cat: "bodega", gf: true, points: 190, img: "assets/products/p04.jpg" },
    { id: "p05", name: "Cava Anna de Codorníu Brut", detail: "Cava · 75 cl", cat: "bodega", gf: true, points: 160, img: "assets/products/p05.jpg" },
    { id: "p06", name: "Jamón de cebo ibérico 50%", detail: "Flor Sierra de Jabugo · loncheado 90 g", cat: "ibericos", gf: true, points: 190, img: "assets/products/p06.jpg" },
    { id: "p07", name: "Paleta de cebo ibérica 50%", detail: "Sánchez Alcaraz · loncheada 100 g", cat: "ibericos", gf: true, points: 100, img: "assets/products/p07.jpg" },
    { id: "p08", name: "Lomo de cebo ibérico 50%", detail: "Deveta · loncheado 100 g", cat: "ibericos", gf: true, points: 140, img: "assets/products/p08.jpg" },
    { id: "p09", name: "Lomo Duroc", detail: "Sánchez Alcaraz · pieza 450 g", cat: "ibericos", gf: true, points: 160, img: "assets/products/p09.jpg" },
    { id: "p10", name: "Salchichón ibérico extra", detail: "Sánchez Alcaraz · pieza 400 g", cat: "ibericos", gf: false, points: 210, img: "assets/products/p10.jpg" },
    { id: "p11", name: "Bloc de foie gras de pato", detail: "Martiko · lata 130 g", cat: "mesa", gf: true, points: 130, img: "assets/products/p11.jpg" },
    { id: "p12", name: "Foie gras entero mi-cuit", detail: "Martiko · 80 g", cat: "mesa", gf: true, points: 160, img: "assets/products/p12.jpg" },
    { id: "p13", name: "Bloc de foie gras de pato", detail: "Capdevila · lata 135 g", cat: "mesa", gf: true, points: 120, img: "assets/products/p13.jpg" },
    { id: "p14", name: "Tabla de quesos", detail: "Obrador de Quesos · selección 150 g", cat: "mesa", gf: true, points: 130, img: "assets/products/p14.jpg" },
    { id: "p15", name: "Parmigiano Reggiano D.O.P.", detail: "Cuña 200 g", cat: "mesa", gf: true, points: 100, img: "assets/products/p15.jpg" },
    { id: "p16", name: "Rulo de queso de cabra", detail: "Gourmet · 180 g", cat: "mesa", gf: true, points: 80, img: "assets/products/p16.jpg" },
    { id: "p17", name: "Aceite Dauliba", detail: "Aceite de oliva virgen extra de Arbequina sin hueso · 50 cl", cat: "mesa", gf: true, points: 180, img: "assets/products/p17.jpg" },
    { id: "p18", name: "Turrón artesano Vicens", detail: "Duro o blando · 200 g", cat: "turrones", gf: true, points: 150, img: "assets/products/p18.jpg" },
    { id: "p19", name: "Turrón de yema Vicens", detail: "Yema tostada · 200 g", cat: "turrones", gf: true, points: 150, img: "assets/products/p19.jpg" },
    { id: "p20", name: "Turrón El Almendro duro", detail: "Calidad suprema · 250 g", cat: "turrones", gf: true, points: 80, img: "assets/products/p20.jpg" },
    { id: "p21", name: "Turrón Suchard Clásico", detail: "Chocolate crujiente · 230 g", cat: "turrones", gf: false, points: 90, img: "assets/products/p21.jpg" },
    { id: "p22", name: "Neules artesanas Vicens", detail: "Estuche 160 g", cat: "turrones", gf: false, points: 100, img: "assets/products/p22.jpg" },
    { id: "p23", name: "Neules de chocolate Vicens", detail: "Estuche 240 g", cat: "turrones", gf: false, points: 170, img: "assets/products/p23.jpg" },
    { id: "p24", name: "Carquiñolis Vicens", detail: "Artesanos de Agramunt · 300 g", cat: "turrones", gf: false, points: 110, img: "assets/products/p24.jpg" },
    { id: "p25", name: "Surtido de Navidad La Confitera", detail: "Polvorones y mantecados · 300 g", cat: "dulces", gf: false, points: 70, img: "assets/products/p25.jpg" },
    { id: "p26", name: "Polvorones de almendra Vicens", detail: "Estuche 300 g", cat: "dulces", gf: false, points: 110, img: "assets/products/p26.jpg" },
    { id: "p27", name: "Polvorón artesano de almendra", detail: "La Confitera · 350 g", cat: "dulces", gf: false, points: 70, img: "assets/products/p27.jpg" },
    { id: "p28", name: "Panettone de chocolate sin gluten", detail: "Bauli · 400 g", cat: "dulces", gf: true, points: 140, img: "assets/products/p28.jpg" },
    { id: "p29", name: "Ferrero Rocher", detail: "Caja de 16 bombones", cat: "dulces", gf: false, points: 120, img: "assets/products/p29.jpg" },
    { id: "p30", name: "Lindt Lindor", detail: "Cornet de bombones de leche · 200 g", cat: "dulces", gf: false, points: 130, img: "assets/products/p30.jpg" },
    { id: "p31", name: "Nestlé Caja Roja", detail: "Surtido de bombones · 198 g", cat: "dulces", gf: false, points: 100, img: "assets/products/p31.jpg" },
  ],
};

// En el navegador se usa como window.CONFIG; en el servidor (api/) se importa con require.
if (typeof window !== "undefined") window.CONFIG = CONFIG;
if (typeof module !== "undefined") module.exports = CONFIG;
