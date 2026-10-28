// Configuración editable de la campaña. No requiere tocar nada más.
window.CONFIG = {
  company: "ASCIL Biopharm",
  pointsPerEmployee: 1000,

  // Códigos de los sobres -> nombre de la persona (se usa en el mensaje final).
  // Se validan sin distinguir mayúsculas ni guiones. Sustituir por los reales.
  // En esta versión (sin servidor) se validan en el navegador (ver README).
  codes: {
    "ASCIL001": "Ana",
    "ASCIL002": "Luis",
    "ASCIL003": "Marta",
    "ASCIL004": "Carlos",
    "ASCIL005": "Lucía",
    "NAVIDAD": "",
  },

  // Carta final: cada elemento es un párrafo que se va escribiendo a mano.
  // "signature" es opcional: déjalo vacío ("") para no firmar.
  letter: [
    "Que estas fiestas te traigan salud, energía y mucho cariño.",
  ],
  signature: "",

  // Catálogo. Para poner foto real: añade  img: "assets/products/jamon.jpg"  (si no hay img se usa el emoji).
  // "points" = puntos que cuesta cada producto.
  products: [
    { id: "jamon",    name: "Jamón ibérico de bellota", emoji: "🍖", points: 450, tag: "Premium" },
    { id: "aceite",   name: "Aceite de oliva virgen extra", emoji: "🫒", points: 120 },
    { id: "vino",     name: "Vino tinto reserva", emoji: "🍷", points: 150 },
    { id: "cava",     name: "Cava brut nature", emoji: "🥂", points: 110 },
    { id: "turron",   name: "Surtido de turrones artesanos", emoji: "🍫", points: 90 },
    { id: "mazapan",  name: "Caja de mazapanes", emoji: "🥮", points: 70 },
    { id: "queso",    name: "Queso curado de oveja", emoji: "🧀", points: 100 },
    { id: "cafe",     name: "Café de especialidad", emoji: "☕", points: 60 },
    { id: "te",       name: "Pack de tés e infusiones", emoji: "🍵", points: 50 },
    { id: "galletas", name: "Lata de galletas de mantequilla", emoji: "🍪", points: 45 },
    { id: "miel",     name: "Miel de azahar", emoji: "🍯", points: 55 },
    { id: "spa",      name: "Vale spa para dos personas", emoji: "💆", points: 400, tag: "Experiencia" },
    { id: "cena",     name: "Vale cena en restaurante", emoji: "🍽️", points: 350, tag: "Experiencia" },
    { id: "vela",     name: "Set de velas aromáticas", emoji: "🕯️", points: 65 },
    { id: "manta",    name: "Manta polar navideña", emoji: "🧣", points: 80 },
    { id: "juego",    name: "Juego de mesa familiar", emoji: "🎲", points: 75 },
  ],
};
