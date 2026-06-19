/* ===== 鰻処 湖松 — interactions ===== */
(function () {
  "use strict";

  /* --- Header shrink on scroll --- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- Mobile nav --- */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );

  /* --- Current year --- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* --- Scroll reveal --- */
  const revealTargets = document.querySelectorAll(
    ".card, .menu-item, .product, .voice-card, .stat, .section-head, .access-info, .access-map, .reserve-form"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => io.observe(el));

  /* --- Animated counters --- */
  const nums = document.querySelectorAll(".stat-num");
  const fmt = (n) => n.toLocaleString("ja-JP");
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.count;
        const dur = 1500;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((n) => counterIO.observe(n));

  /* --- Cart --- */
  const cart = [];
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("overlay");
  const itemsEl = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  const yen = (n) => "¥" + n.toLocaleString("ja-JP");

  const openCart = () => {
    drawer.classList.add("open");
    overlay.classList.add("show");
    drawer.setAttribute("aria-hidden", "false");
  };
  const closeCart = () => {
    drawer.classList.remove("open");
    overlay.classList.remove("show");
    drawer.setAttribute("aria-hidden", "true");
  };

  const render = () => {
    countEl.textContent = cart.length;
    totalEl.textContent = yen(cart.reduce((s, i) => s + i.price, 0));
    if (!cart.length) {
      itemsEl.innerHTML = '<li class="cart-empty">カートは空です</li>';
      return;
    }
    itemsEl.innerHTML = cart
      .map(
        (i, idx) => `
      <li class="cart-row">
        <span class="ci-name">${i.name}</span>
        <span class="ci-price">${yen(i.price)}</span>
        <button class="ci-del" data-idx="${idx}" aria-label="削除">✕</button>
      </li>`
      )
      .join("");
  };

  document.querySelectorAll(".add-cart").forEach((btn) =>
    btn.addEventListener("click", () => {
      cart.push({ name: btn.dataset.name, price: +btn.dataset.price });
      render();
      openCart();
    })
  );

  itemsEl.addEventListener("click", (e) => {
    const del = e.target.closest(".ci-del");
    if (!del) return;
    cart.splice(+del.dataset.idx, 1);
    render();
  });

  document.getElementById("cartFab").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

  document.getElementById("checkout").addEventListener("click", () => {
    if (!cart.length) {
      alert("カートに商品がありません。");
      return;
    }
    alert(
      "ご注文ありがとうございます！（デモ）\n\n" +
        cart.map((i) => `・${i.name} ${yen(i.price)}`).join("\n") +
        "\n\n合計 " +
        yen(cart.reduce((s, i) => s + i.price, 0))
    );
    cart.length = 0;
    render();
    closeCart();
  });

  render();

  /* --- Reserve form --- */
  const form = document.getElementById("reserveForm");
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const tel = form.tel.value.trim();
    if (!name || !tel) {
      note.textContent = "お名前と電話番号をご入力ください。";
      note.style.color = "#ffd9a8";
      return;
    }
    note.textContent = `${name} 様、ご予約リクエストを承りました。折り返しご連絡いたします。（デモ送信）`;
    note.style.color = "var(--gold-soft)";
    form.reset();
  });
})();
