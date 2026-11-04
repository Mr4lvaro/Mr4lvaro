(() => {
  const { products, pointsPerEmployee: TOTAL, demoCodes } = window.CONFIG;
  const norm = (c) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const demoMap = new Map(Object.entries(demoCodes || {}).map(([c, n]) => [norm(c), n]));
  const DEMO = new URLSearchParams(location.search).has("demo"); // prueba sin servidor
  const $ = (id) => document.getElementById(id);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const cart = new Map(); // id -> cantidad
  let currentCode = null, currentName = "";
  let mode = DEMO ? "demo" : "real"; // real | preview (administrador) | test (código PRUEBA) | demo (?demo)
  let adminCode = null;

  // Llamada a la API (nunca lanza error: devuelve { ok, status, data })
  async function api(path, { method = "POST", body, admin } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (admin) headers["x-admin-code"] = admin;
    let res;
    try { res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
    catch { return { ok: false, status: 0, data: { error: "network" } }; }
    let data = {};
    try { data = await res.json(); } catch { /* sin cuerpo */ }
    return { ok: res.ok, status: res.status, data };
  }

  /* ---------- Navegación ---------- */
  let current = "screen-code";
  function show(id) {
    current = id;
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(id).classList.add("active");
    document.body.classList.toggle("in-admin", id === "screen-admin");
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

  $("code-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = norm(input.value);
    const field = input.closest(".field"), btn = e.target.querySelector("button[type=submit]");
    const fail = (msg) => {
      $("code-error").textContent = msg;
      field.classList.remove("shake"); void field.offsetWidth; field.classList.add("shake");
    };
    if (!code) return fail("Escribe el código de tu sobre.");

    btn.disabled = true;
    try {
      if (DEMO) {
        if (!demoMap.has(code)) return fail("Código no válido (modo demo: usa DEMO-01).");
        currentCode = code; currentName = demoMap.get(code) || "";
        return runRedeem();
      }
      const r = await api("api/login", { body: { code } });
      if (r.ok && r.data.test) { startTest(r.data.name, input.value); return; }
      if (r.ok && r.data.admin) { adminCode = input.value; keepAdmin(adminCode); return openAdmin(); }
      if (r.ok) { currentCode = code; currentName = r.data.name || ""; mode = "real"; return runRedeem(); }
      if (r.status === 409) return fail("Este código ya se ha canjeado: tu selección está confirmada. ¡Gracias!");
      if (r.status === 404) return fail("Código no válido. Revisa que lo hayas escrito igual que en el vale.");
      if (r.status === 429) return fail("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
      return fail("No hemos podido conectar. Inténtalo de nuevo en unos minutos.");
    } finally { btn.disabled = false; }
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
    await swap(title, sub, "¡Feliz Navidad y felices fiestas!",
      "En ASCIL Biopharm queremos compartir contigo la magia de estas fechas.<br>" +
      `Disfruta de tus <b class="gold">${fmt(TOTAL)} puntos</b> y elige el regalo que más te ilusione.`);
    await wait(900);
    btn.hidden = false; btn.focus();
  }

  // Cambia el texto con un fundido
  async function swap(titleEl, subEl, t, st) {
    [titleEl, subEl].forEach((e) => e.classList.add("fade-out"));
    await wait(350);
    titleEl.textContent = t; subEl.innerHTML = st;
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
  const pic = (p) => (p.img ? `<img src="${p.img}" alt="" loading="lazy" decoding="async">` : p.emoji);
  const picCls = (p) => (p.img ? "has-img" : "is-emoji");

  let activeCat = "all", onlyGF = false;

  function startShop() {
    cart.clear(); activeCat = "all"; onlyGF = false;
    renderPresets(); renderFilters(); renderGrid(); renderBasket();
    show("screen-shop");
  }

  // Cestas ya preparadas: llenan la cesta con un clic (se puede cambiar antes de confirmar)
  function renderPresets() {
    const box = $("preset"), list = window.CONFIG.presetBaskets || [];
    box.hidden = list.length === 0;
    box.innerHTML = `<div class="preset-text"><b>¿Prefieres no elegir?</b><span>Te preparamos una cesta con un poco de todo, usando tus ${fmt(TOTAL)} puntos. Después puedes cambiarla.</span></div>
      <div class="preset-btns">${list.map((b) => `<button type="button" data-preset="${b.id}">${b.emoji} ${b.name}</button>`).join("")}</div>`;
    box.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", () => applyPreset(btn.dataset.preset)));
  }

  let presetBusy = false;
  async function applyPreset(id) {
    const preset = window.CONFIG.presetBaskets.find((b) => b.id === id);
    if (!preset || presetBusy) return;
    presetBusy = true;
    document.querySelectorAll("#preset button").forEach((b) => (b.disabled = true));
    cart.clear(); activeCat = "all"; onlyGF = false;
    renderFilters(); renderGrid();            // todos los productos visibles, cesta vacía
    for (const { id: pid, qty } of preset.items) {
      cart.set(pid, qty);
      const card = document.querySelector(`.product[data-id="${pid}"]`);
      if (card) fly(card.querySelector(".thumb"));
      renderBasket(pid);
      await wait(reduceMotion ? 0 : 260);
    }
    if (matchMedia("(max-width: 900px)").matches) setDrawer(true);
    document.querySelectorAll("#preset button").forEach((b) => (b.disabled = false));
    presetBusy = false;
  }

  function renderFilters() {
    const box = $("filters"); box.innerHTML = "";
    const chip = (label, active, cls, onClick) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = `chip ${cls} ${active ? "on" : ""}`; b.textContent = label;
      b.addEventListener("click", onClick); box.appendChild(b);
    };
    chip("Todo", activeCat === "all", "", () => { activeCat = "all"; renderFilters(); renderGrid(); });
    window.CONFIG.categories.forEach((c) => chip(c.name, activeCat === c.id, "", () => { activeCat = c.id; renderFilters(); renderGrid(); }));
    chip("Sin gluten", onlyGF, "gf-chip", () => { onlyGF = !onlyGF; renderFilters(); renderGrid(); });
  }

  function renderGrid() {
    const grid = $("grid"); grid.innerHTML = "";
    products.filter((p) => (activeCat === "all" || p.cat === activeCat) && (!onlyGF || p.gf)).forEach((p, i) => {
      const b = document.createElement("button");
      b.className = "product"; b.dataset.id = p.id; b.style.animationDelay = `${Math.min(i, 12) * 40}ms`;
      b.innerHTML = `${p.gf ? '<span class="gf">Sin gluten</span>' : ""}<span class="qty-badge">0</span>
        <span class="thumb ${picCls(p)}">${pic(p)}</span><span class="p-name">${p.name}</span>
        <span class="p-detail">${p.detail || ""}</span><span class="p-pts">${fmt(p.points)} pts</span>`;
      b.addEventListener("click", () => add(p.id, b));
      grid.appendChild(b);
    });
    renderBasket();
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

  // Cajón de la cesta (móvil): se abre desde abajo, con fondo oscuro y sin que se mueva la página
  function setDrawer(open) {
    $("basket").classList.toggle("show", open);
    $("drawer-backdrop").classList.toggle("show", open);
    document.body.classList.toggle("drawer-open", open);
  }
  $("basket-fab").addEventListener("click", () => setDrawer(true));
  $("close-basket").addEventListener("click", () => setDrawer(false));
  $("drawer-backdrop").addEventListener("click", () => setDrawer(false));

  /* ---------- Confirmación ---------- */
  $("checkout").addEventListener("click", () => {
    $("modal-error").hidden = true;
    const rest = left();
    $("modal-text").textContent = rest > 0
      ? `Te quedan ${fmt(rest)} puntos sin usar. Una vez confirmes, no podrás cambiar tu selección.`
      : "Has usado todos tus puntos. Una vez confirmes, no podrás cambiar tu selección.";
    $("modal").hidden = false;
  });
  $("modal-cancel").addEventListener("click", () => { $("modal").hidden = true; });
  $("modal-ok").addEventListener("click", async () => {
    const ok = $("modal-ok"), err = $("modal-error");
    err.hidden = true;
    if (mode === "real") {
      ok.disabled = true; ok.textContent = "Guardando…";
      const r = await api("api/order", { body: { code: currentCode, items: [...cart].map(([id, qty]) => ({ id, qty })) } });
      ok.disabled = false; ok.textContent = "Sí, confirmar";
      if (!r.ok) {
        err.textContent = r.status === 409 ? "Este código ya tiene una selección confirmada."
          : r.status === 400 ? "Tu selección no es válida. Revisa los productos y los puntos."
          : "No se ha podido guardar tu selección. Comprueba tu conexión e inténtalo de nuevo.";
        err.hidden = false;
        return;
      }
    }
    $("modal").hidden = true;
    setDrawer(false);

    const greet = $("done-greeting");
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
        if (!reduceMotion) await wait(/[.,]/.test(ch.textContent) ? 150 : 16 + Math.random() * 22);
      }
      if (!reduceMotion) await wait(p.classList.contains("sign") ? 0 : 350);
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

  /* ---------- Panel de administración ---------- */
  let adminData = null, adminFilter = "all";
  const keepAdmin = (c) => { try { sessionStorage.setItem("ascil_admin", c); } catch { /* sin almacenamiento */ } };
  const forgetAdmin = () => { try { sessionStorage.removeItem("ascil_admin"); } catch { /* sin almacenamiento */ } };
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const itemsText = (o) => o.items.map((i) => `${i.qty}× ${i.name}`).join(" · ");
  const when = (iso) => new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  async function openAdmin() {
    show("screen-admin");
    await loadAdmin();
  }

  async function loadAdmin() {
    $("admin-error").textContent = "";
    const r = await api("api/admin", { method: "GET", admin: adminCode });
    if (!r.ok) {
      if (r.status === 401) { forgetAdmin(); adminCode = null; show("screen-code"); return; }
      $("admin-error").textContent = "No se han podido cargar los datos. Pulsa Actualizar para reintentar.";
      return;
    }
    adminData = r.data;
    renderAdmin();
  }

  function renderAdmin() {
    const { people, maxPeople } = adminData;
    const done = people.filter((p) => p.order), pending = people.filter((p) => !p.order);
    const pts = done.reduce((s, p) => s + p.order.total_points, 0);

    $("admin-stats").innerHTML = [
      ["Personas", `${people.length} / ${maxPeople}`], ["Han elegido", done.length], ["Pendientes", pending.length], ["Puntos canjeados", fmt(pts)],
    ].map(([k, v]) => `<div class="stat"><small>${k}</small><b>${v}</b></div>`).join("");

    const box = $("admin-filters"); box.innerHTML = "";
    [["all", `Todos (${people.length})`], ["done", `Han elegido (${done.length})`], ["pending", `Pendientes (${pending.length})`]].forEach(([id, label]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = `chip ${adminFilter === id ? "on" : ""}`; b.textContent = label;
      b.addEventListener("click", () => { adminFilter = id; renderAdmin(); });
      box.appendChild(b);
    });

    const shown = people.filter((p) => adminFilter === "all" || (adminFilter === "done") === Boolean(p.order));
    $("admin-table").tBodies[0].innerHTML = shown.map((p) => `<tr class="${p.order ? "" : "pending"}">
      <td><b>${esc(p.full_name)}</b>${p.notes ? `<span class="note">📝 ${esc(p.notes)}</span>` : ""}</td>
      <td><code>${esc(p.code)}</code></td>
      <td>${p.order ? `<span class="badge ok">✔ Hecho</span><small>${when(p.order.created_at)}</small>` : '<span class="badge wait">Pendiente</span>'}</td>
      <td class="items">${p.order ? esc(itemsText(p.order)) : "—"}</td>
      <td class="r">${p.order ? fmt(p.order.total_points) : "—"}</td></tr>`).join("") || '<tr><td colspan="5" class="empty">Nada que mostrar.</td></tr>';

    // Total por producto (para preparar los lotes)
    const sum = new Map();
    done.forEach((p) => p.order.items.forEach((i) => {
      const cur = sum.get(i.id) || { name: i.name, qty: 0, points: 0 };
      cur.qty += i.qty; cur.points += i.qty * i.points; sum.set(i.id, cur);
    }));
    const rows = [...sum.values()].sort((a, b) => b.qty - a.qty || a.name.localeCompare(b.name));
    $("admin-products").tBodies[0].innerHTML = rows.map((r) => `<tr><td>${esc(r.name)}</td><td class="r">${r.qty}</td><td class="r">${fmt(r.points)}</td></tr>`).join("")
      || '<tr><td colspan="3" class="empty">Todavía no hay pedidos.</td></tr>';

    $("preview-as").innerHTML = '<option value="">Empleado de prueba (sin nombre)</option>' +
      people.map((p) => `<option value="${esc(p.first_name)}">${esc(p.full_name)}</option>`).join("");
  }

  $("admin-refresh").addEventListener("click", loadAdmin);
  $("admin-logout").addEventListener("click", () => { forgetAdmin(); adminCode = null; adminData = null; $("code-input").value = ""; show("screen-code"); });
  $("admin-csv").addEventListener("click", () => {
    if (!adminData) return;
    const cell = (t) => `"${String(t ?? "").replace(/"/g, '""')}"`;
    const lines = [["Nombre", "Código", "Estado", "Fecha", "Pedido", "Puntos", "Notas"].map(cell).join(";")];
    adminData.people.forEach((p) => lines.push([p.full_name, p.code, p.order ? "Hecho" : "Pendiente", p.order ? when(p.order.created_at) : "",
      p.order ? itemsText(p.order) : "", p.order ? p.order.total_points : "", p.notes || ""].map(cell).join(";")));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    a.download = "pedidos-vale-navidad.csv"; a.click(); URL.revokeObjectURL(a.href);
  });

  // Barra del modo prueba: según quién la use muestra unos botones u otros
  function showBar({ admin }) {
    $("preview-bar").hidden = false;
    $("exit-preview").hidden = !admin;
    $("test-status").hidden = admin; $("test-restart").hidden = admin;
  }

  // Ver la web como un empleado (modo prueba: no se guarda nada)
  $("preview-btn").addEventListener("click", () => {
    mode = "preview"; currentCode = null; currentName = $("preview-as").value;
    showBar({ admin: true });
    runRedeem();
  });
  $("exit-preview").addEventListener("click", () => {
    letterRun++; mode = "real"; $("preview-bar").hidden = true;
    $("modal").hidden = true; setDrawer(false);
    openAdmin();
  });

  // Si el administrador recarga la página, vuelve al panel (sesión de la pestaña)
  try {
    const saved = sessionStorage.getItem("ascil_admin");
    if (saved && !DEMO) { adminCode = saved; openAdmin(); }
  } catch { /* sin almacenamiento */ }

  /* ---------- Código PRUEBA: probar la web sin límites y ver el seguimiento ---------- */
  let testCode = null, statusData = null, statusFilter = "all", returnTo = "screen-code";

  function startTest(name, code) {
    mode = "test"; testCode = code; currentCode = null; currentName = name || "";
    showBar({ admin: false });
    runRedeem();
  }

  $("test-restart").addEventListener("click", () => {
    letterRun++; mode = "real"; testCode = null; cart.clear();
    $("preview-bar").hidden = true; $("modal").hidden = true; setDrawer(false);
    $("code-input").value = ""; $("code-error").textContent = "";
    show("screen-code");
  });

  $("test-status").addEventListener("click", async () => {
    returnTo = current;
    show("screen-status");
    await loadStatus();
  });
  $("status-back").addEventListener("click", () => show(returnTo));

  async function loadStatus() {
    $("status-error").textContent = "";
    const r = await fetch("api/status", { headers: { "x-test-code": testCode || "" } }).then(async (x) => ({ ok: x.ok, data: await x.json().catch(() => ({})) })).catch(() => ({ ok: false, data: {} }));
    if (!r.ok) { $("status-error").textContent = "No se ha podido cargar el seguimiento. Inténtalo de nuevo."; return; }
    statusData = r.data.people; renderStatus();
  }

  function renderStatus() {
    const sent = statusData.filter((p) => p.sent), pending = statusData.filter((p) => !p.sent);
    $("status-stats").innerHTML = [["Personas", statusData.length], ["Han enviado", sent.length], ["Pendientes", pending.length]]
      .map(([k, v]) => `<div class="stat"><small>${k}</small><b>${v}</b></div>`).join("");
    const box = $("status-filters"); box.innerHTML = "";
    [["all", `Todos (${statusData.length})`], ["sent", `Han enviado (${sent.length})`], ["pending", `Pendientes (${pending.length})`]].forEach(([id, label]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = `chip ${statusFilter === id ? "on" : ""}`; b.textContent = label;
      b.addEventListener("click", () => { statusFilter = id; renderStatus(); });
      box.appendChild(b);
    });
    const shown = statusData.filter((p) => statusFilter === "all" || (statusFilter === "sent") === p.sent);
    $("status-table").tBodies[0].innerHTML = shown.map((p) => `<tr class="${p.sent ? "" : "pending"}"><td><b>${esc(p.name)}</b></td>
      <td>${p.sent ? '<span class="badge ok">✔ Ha enviado</span>' : '<span class="badge wait">Pendiente</span>'}</td></tr>`).join("")
      || '<tr><td colspan="2" class="empty">Nada que mostrar.</td></tr>';
  }
})();
