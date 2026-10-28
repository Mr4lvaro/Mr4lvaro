(() => {
  const { codes, products, pointsPerEmployee: TOTAL } = window.CONFIG;
  const norm = (c) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const codeMap = new Map(Object.entries(codes).map(([c, n]) => [norm(c), n]));
  const $ = (id) => document.getElementById(id);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const USED_KEY = "ascil_used_codes";
  const readUsed = () => { try { return JSON.parse(localStorage.getItem(USED_KEY)) || []; } catch { return []; } };
  const markUsed = (c) => { try { localStorage.setItem(USED_KEY, JSON.stringify([...readUsed(), c])); } catch {} };

  const cart = new Map(); // id -> cantidad
  let currentCode = null, currentName = "";

  /* ---------- Navegación ---------- */
  function show(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(id).classList.add("active");
    window.scrollTo(0, 0);
  }

  /* ---------- Nieve ---------- */
  (function snow() {
    if (reduceMotion) return;
    const c = $("snow"), ctx = c.getContext("2d");
    let flakes = [];
    const resize = () => {
      c.width = innerWidth; c.height = innerHeight;
      flakes = Array.from({ length: Math.min(110, Math.floor(innerWidth / 11)) }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 2.8 + 1, s: Math.random() * 0.9 + 0.35, d: Math.random() * Math.PI * 2,
      }));
    };
    addEventListener("resize", resize); resize();
    (function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.shadowColor = "rgba(70,110,200,.45)"; ctx.shadowBlur = 4;
      for (const f of flakes) {
        f.d += 0.01; f.y += f.s; f.x += Math.sin(f.d) * 0.5;
        if (f.y > c.height + 5) { f.y = -5; f.x = Math.random() * c.width; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill();
      }
      requestAnimationFrame(tick);
    })();
  })();

  /* ---------- Guirnaldas de luces ---------- */
  document.querySelectorAll(".lights").forEach((box) => {
    const colors = ["#ff5a5f", "#ffd45c", "#4dd0ff", "#7ee081", "#c58cff"];
    const n = Math.ceil(innerWidth / 44);
    for (let i = 0; i < n; i++) {
      const b = document.createElement("i");
      b.style.left = `${(i + 0.5) * (100 / n)}%`;
      b.style.top = `${4 + Math.abs(Math.sin((i / n) * Math.PI * 3)) * 14}px`;
      b.style.setProperty("--c", colors[i % colors.length]);
      b.style.setProperty("--t", `${(i % 5) * 0.35}s`);
      box.appendChild(b);
    }
  });

  /* ---------- Pantalla 1: código ---------- */
  const input = $("code-input");
  input.addEventListener("input", () => { input.value = input.value.toUpperCase(); $("code-error").textContent = ""; });

  $("code-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = norm(input.value);
    const field = input.closest(".field");
    const fail = (msg) => {
      $("code-error").textContent = msg;
      field.classList.remove("shake"); void field.offsetWidth; field.classList.add("shake");
    };
    if (!code) return fail("Escribe el código de tu sobre.");
    if (!codeMap.has(code)) return fail("Código no válido. Revisa que lo hayas escrito igual que en el vale.");
    if (readUsed().includes(code)) return fail("Este código ya ha sido canjeado.");
    currentCode = code; currentName = codeMap.get(code) || "";
    runRedeem();
  });

  /* ---------- Pantalla 2: animación de canje ---------- */
  async function runRedeem() {
    const env = $("envelope"), counter = $("redeem-counter");
    const title = $("redeem-title"), sub = $("redeem-sub"), btn = $("redeem-continue");
    // reset
    env.className = "envelope"; counter.textContent = "0"; btn.hidden = true;
    $("screen-redeem").classList.remove("burst"); $("confetti").innerHTML = "";
    title.textContent = "Abriendo tu sobre…"; sub.textContent = "Tenemos algo especial para ti";
    show("screen-redeem");

    await wait(700);
    env.classList.add("shake"); await wait(700);
    env.classList.remove("shake"); env.classList.add("open"); await wait(800);
    env.classList.add("rise"); await wait(700);

    $("screen-redeem").classList.add("burst");
    confetti();
    await countUp(counter, TOTAL, 1600);
    await swap(title, sub, `Un vale regalo de ${fmt(TOTAL)} puntos`, `Este año te regalamos ${fmt(TOTAL)} puntos.`);
    await wait(2800);
    confetti();
    await swap(title, sub, "Feliz Navidad desde ASCIL Biopharm 🎄",
      "Te deseamos una feliz Navidad, unas felices fiestas y lo mejor de todo. ¿Y qué mejor forma que con esta cesta de Navidad? " +
      `Tienes ${fmt(TOTAL)} puntos para que los gastes y escojas los regalos a tu gusto, lo que tú prefieras.`);
    await wait(900);
    btn.hidden = false; btn.focus();
  }

  // Cambia el texto con un fundido
  async function swap(titleEl, subEl, t, st) {
    [titleEl, subEl].forEach((e) => e.classList.add("fade-out"));
    await wait(350);
    titleEl.textContent = t; subEl.textContent = st;
    [titleEl, subEl].forEach((e) => { e.classList.remove("fade-out"); e.classList.add("fade-in"); });
    await wait(500);
    [titleEl, subEl].forEach((e) => e.classList.remove("fade-in"));
  }
  $("redeem-continue").addEventListener("click", startShop);

  function countUp(el, to, ms) {
    return new Promise((res) => {
      const t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / ms, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(to * eased));
        p < 1 ? requestAnimationFrame(step) : res();
      })(t0);
    });
  }

  function confetti(box = $("confetti")) {
    const colors = ["#f2b84b", "#ffe29a", "#1db3f0", "#d8434e", "#ffffff", "#8d8be0"];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement("i");
      p.style.background = colors[i % colors.length];
      box.appendChild(p);
      const angle = Math.random() * Math.PI * 2, dist = 160 + Math.random() * 360;
      const dx = Math.cos(angle) * dist, dy = Math.sin(angle) * dist - 120;
      p.animate([
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx * 1.15}px,${dy + 420}px) rotate(${Math.random() * 1080}deg)`, opacity: 0 },
      ], { duration: 2200 + Math.random() * 1200, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" });
    }
  }

  /* ---------- Pantalla 3: tienda ---------- */
  const spent = () => [...cart].reduce((s, [id, q]) => s + byId(id).points * q, 0);
  const left = () => TOTAL - spent();
  const count = () => [...cart.values()].reduce((a, b) => a + b, 0);
  const byId = (id) => products.find((p) => p.id === id);
  // Foto del producto si existe "img"; si no, el emoji
  const pic = (p) => (p.img ? `<img src="${p.img}" alt="">` : p.emoji);
  const picCls = (p) => (p.img ? "has-img" : "is-emoji");

  function startShop() {
    cart.clear(); renderGrid(); renderBasket();
    show("screen-shop");
  }

  function renderGrid() {
    const grid = $("grid"); grid.innerHTML = "";
    products.forEach((p, i) => {
      const b = document.createElement("button");
      b.className = "product"; b.dataset.id = p.id; b.style.animationDelay = `${i * 45}ms`;
      b.innerHTML = `${p.tag ? `<span class="tag">${p.tag}</span>` : ""}<span class="qty-badge">0</span>
        <span class="thumb ${picCls(p)}">${pic(p)}</span><span class="p-name">${p.name}</span><span class="p-pts">${fmt(p.points)} pts</span>`;
      b.addEventListener("click", () => add(p.id, b));
      grid.appendChild(b);
    });
  }

  function add(id, card) {
    const p = byId(id);
    if (p.points > left()) {
      card.classList.remove("nope"); void card.offsetWidth; card.classList.add("nope");
      return;
    }
    cart.set(id, (cart.get(id) || 0) + 1);
    fly(card.querySelector(".thumb"));
    renderBasket(id);
  }

  function change(id, delta) {
    const q = (cart.get(id) || 0) + delta;
    if (delta > 0 && byId(id).points > left()) return;
    if (q <= 0) {
      const li = document.querySelector(`.b-item[data-id="${id}"]`);
      cart.delete(id);
      if (li) { li.classList.add("removing"); setTimeout(() => renderBasket(), 280); return; }
    } else cart.set(id, q);
    renderBasket();
  }

  // Emoji volando desde el producto hasta la cesta
  function fly(srcEl) {
    if (reduceMotion) return;
    const mobile = matchMedia("(max-width: 900px)").matches;
    const target = mobile ? $("basket-fab") : $("basket-stage");
    const a = srcEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const el = document.createElement("span");
    el.className = `fly ${srcEl.classList.contains("has-img") ? "has-img" : ""}`; el.innerHTML = srcEl.innerHTML;
    el.style.left = a.left + "px"; el.style.top = a.top + "px";
    document.body.appendChild(el);
    const dx = b.left + b.width / 2 - a.left - a.width / 2, dy = b.top + b.height * 0.4 - a.top - a.height / 2;
    el.animate([
      { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 90}px) scale(1.3) rotate(160deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px,${dy}px) scale(.35) rotate(360deg)`, opacity: .3 },
    ], { duration: 750, easing: "cubic-bezier(.5,0,.4,1)" }).onfinish = () => {
      el.remove();
      const bk = mobile ? target : $("basket"); bk.classList.remove("pulse"); void bk.offsetWidth; bk.classList.add("pulse");
      const st = $("basket-stage"); st.classList.remove("wobble"); void st.offsetWidth; st.classList.add("wobble");
    };
  }

  function renderBasket(addedId) {
    const list = $("basket-list");
    const existing = new Map([...list.children].map((li) => [li.dataset.id, li]));

    for (const [id, q] of cart) {
      let li = existing.get(id);
      if (!li) {
        const p = byId(id);
        li = document.createElement("li");
        li.className = "b-item"; li.dataset.id = id;
        li.innerHTML = `<span class="b-emoji ${picCls(p)}">${pic(p)}</span>
          <div class="b-info"><div class="b-name">${p.name}</div><div class="b-pts"></div></div>
          <div class="b-qty"><button aria-label="Quitar uno">−</button><span></span><button aria-label="Añadir uno">+</button></div>`;
        const [minus, plus] = li.querySelectorAll("button");
        minus.addEventListener("click", () => change(id, -1));
        plus.addEventListener("click", () => change(id, +1));
        list.appendChild(li);
      } else existing.delete(id);
      li.querySelector(".b-qty span").textContent = q;
      li.querySelector(".b-pts").textContent = `${fmt(byId(id).points * q)} pts`;
    }
    existing.forEach((li) => li.remove());
    renderPieces();

    const total = spent(), remaining = left();
    $("basket-total").textContent = `${fmt(total)} pts`;
    $("basket-left").textContent = `${fmt(remaining)} pts`;
    $("fab-count").textContent = count();
    $("fab-pts").textContent = `${fmt(total)} pts`;
    $("checkout").disabled = count() === 0;

    const pl = $("points-left");
    pl.textContent = fmt(remaining);
    pl.classList.add("bump"); setTimeout(() => pl.classList.remove("bump"), 300);
    $("bar-fill").style.width = `${(remaining / TOTAL) * 100}%`;
    if (addedId) { const f = $("fab-count"); f.classList.remove("bump"); void f.offsetWidth; f.classList.add("bump"); }

    document.querySelectorAll(".product").forEach((card) => {
      const id = card.dataset.id, q = cart.get(id) || 0;
      card.classList.toggle("in-cart", q > 0);
      card.querySelector(".qty-badge").textContent = q;
      card.classList.toggle("too-expensive", q === 0 && byId(id).points > remaining);
    });
  }

  // Cesta visual: una pieza (emoji) por unidad, que cae dentro de la cesta
  const MAX_PIECES = 14;
  const SLOTS = [14, 46, 78, 30, 62, 8, 38, 70, 22, 54, 86, 4, 48, 74]; // posición horizontal (%)
  function renderPieces() {
    const box = $("pieces");
    const wanted = [];
    for (const [id, q] of cart) for (let n = 0; n < q; n++) wanted.push(`${id}#${n}`);
    const shown = wanted.slice(-MAX_PIECES);
    const have = new Map([...box.children].map((el) => [el.dataset.key, el]));
    shown.forEach((key, i) => {
      if (have.has(key)) { have.delete(key); return; }
      const el = document.createElement("span");
      el.className = "piece"; el.dataset.key = key;
      const pp = byId(key.split("#")[0]);
      el.classList.add(picCls(pp)); el.innerHTML = pic(pp);
      const slot = SLOTS[i % SLOTS.length];
      el.style.left = `${slot}%`;
      el.style.bottom = `${56 + Math.floor(i / 3) * 18 + (i % 2) * 8}px`;
      el.style.setProperty("--rot", `${(i * 37) % 30 - 15}deg`);
      el.style.zIndex = i;
      box.appendChild(el);
    });
    have.forEach((el) => { el.classList.add("out"); setTimeout(() => el.remove(), 250); });
    const extra = wanted.length - shown.length;
    $("more").hidden = extra <= 0; $("more").textContent = `+${extra}`;
  }

  $("basket-fab").addEventListener("click", () => $("basket").classList.add("show"));
  $("close-basket").addEventListener("click", () => $("basket").classList.remove("show"));

  /* ---------- Confirmación ---------- */
  $("checkout").addEventListener("click", () => {
    const rest = left();
    $("modal-text").textContent = rest > 0
      ? `Te quedan ${fmt(rest)} puntos sin usar. Una vez confirmes, no podrás cambiar tu selección.`
      : "Has usado todos tus puntos. Una vez confirmes, no podrás cambiar tu selección.";
    $("modal").hidden = false;
  });
  $("modal-cancel").addEventListener("click", () => { $("modal").hidden = true; });
  $("modal-ok").addEventListener("click", () => {
    $("modal").hidden = true;
    $("basket").classList.remove("show");
    markUsed(currentCode);

    const greet = $("done-greeting");
    $("done-title").textContent = currentName ? "Felices fiestas y feliz Navidad," : "Felices fiestas y feliz Navidad";
    greet.textContent = currentName; greet.hidden = !currentName;
    startLetter(1500);
    show("screen-done");
    confettiOn();
  });

  // La carta se escribe letra a letra, como a mano
  let letterRun = 0;
  async function startLetter(delay) {
    const run = ++letterRun, box = $("letter-body");
    const { letter, signature } = window.CONFIG;
    box.innerHTML = "";
    const blocks = (signature ? [...letter, signature] : letter).map((text, i, all) => {
      const p = document.createElement("p");
      p.className = signature && i === all.length - 1 ? "hand sign" : "hand";
      p.setAttribute("aria-label", text);
      p.innerHTML = [...text].map((c) => `<span class="ch" aria-hidden="true">${c}</span>`).join("");
      box.appendChild(p);
      return p;
    });
    await wait(delay);
    for (const p of blocks) {
      for (const ch of p.children) {
        if (run !== letterRun) return;
        ch.classList.add("on");
        if (!reduceMotion) await wait(/[.,]/.test(ch.textContent) ? 220 : 34 + Math.random() * 40);
      }
      if (!reduceMotion) await wait(p.classList.contains("sign") ? 0 : 450);
    }
    if (run === letterRun) box.classList.add("done");
  }

  function confettiOn() {
    if (reduceMotion) return;
    const box = document.createElement("div");
    box.className = "confetti";
    box.style.cssText = "position:fixed;inset:0;z-index:150";
    document.body.appendChild(box);
    confetti(box);
    setTimeout(() => box.remove(), 4200);
  }
})();
