// Candado / caixa forte con teclado numérico propio (sen depender do teclado do móbil).
import { h, wait } from "../ui.js";
import * as audio from "../audio.js";

const PADLOCK_SVG = `
<svg class="lock-svg" viewBox="0 0 64 80" shape-rendering="crispEdges" aria-hidden="true">
  <g class="shackle">
    <path d="M16 38 V18 h4 v-4 h4 v-4 h16 v4 h4 v4 h4 V38 h-8 V20 h-2 v-2 h-12 v2 h-2 V38 z" fill="#c9ced6"/>
    <path d="M20 38 V20 h2 v-2 h2 v20 z M44 38 V20 h-2 v-2 h-2 v20z" fill="#8a93a3"/>
  </g>
  <g class="lock-body">
    <rect x="8" y="36" width="48" height="40" fill="#d9a521"/>
    <rect x="8" y="36" width="48" height="4" fill="#f5cf5a"/>
    <rect x="8" y="72" width="48" height="4" fill="#9c7212"/>
    <rect x="52" y="40" width="4" height="32" fill="#b8860b"/>
    <rect x="28" y="48" width="8" height="8" fill="#3a2a08"/>
    <rect x="30" y="56" width="4" height="10" fill="#3a2a08"/>
    <rect class="lock-glow" x="8" y="36" width="48" height="40" fill="#fff6c4" opacity="0"/>
  </g>
</svg>`;

const SAFE_SVG = `
<svg class="safe-svg" viewBox="0 0 120 100" shape-rendering="crispEdges" aria-hidden="true">
  <rect x="6" y="6" width="108" height="88" fill="#3b3f4a"/>
  <rect x="6" y="6" width="108" height="4" fill="#5d6373"/>
  <rect x="6" y="90" width="108" height="4" fill="#23262d"/>
  <rect x="14" y="14" width="92" height="72" fill="#1b0f05"/>
  <g class="safe-inside">
    <rect x="40" y="40" width="40" height="30" fill="#f5cf5a"/>
    <rect x="58" y="40" width="4" height="30" fill="#c0392b"/>
    <rect x="40" y="53" width="40" height="4" fill="#c0392b"/>
    <rect x="52" y="32" width="8" height="8" fill="#c0392b"/>
    <rect x="60" y="32" width="8" height="8" fill="#c0392b"/>
  </g>
  <g class="safe-door">
    <rect x="14" y="14" width="92" height="72" fill="#6b7180"/>
    <rect x="14" y="14" width="92" height="4" fill="#8d94a5"/>
    <rect x="102" y="14" width="4" height="72" fill="#4a4f5b"/>
    <rect x="18" y="26" width="6" height="12" fill="#2b2e36"/>
    <rect x="18" y="62" width="6" height="12" fill="#2b2e36"/>
    <g class="safe-dial">
      <rect x="52" y="34" width="32" height="32" fill="#c9ced6"/>
      <rect x="56" y="38" width="24" height="24" fill="#9aa1af"/>
      <rect x="66" y="38" width="4" height="8" fill="#2b2e36"/>
      <rect x="64" y="48" width="8" height="4" fill="#2b2e36"/>
    </g>
    <rect x="88" y="44" width="10" height="12" fill="#d9a521"/>
    <rect class="lock-glow" x="14" y="14" width="92" height="72" fill="#fff6c4" opacity="0"/>
  </g>
</svg>`;

/**
 * opts: { length, kind: "padlock"|"safe", label, onSubmit(code) => ({ ok, message }) }
 */
export function createCodeLock(opts) {
  const length = opts.length || 4;
  let value = "";
  let busy = false;
  const visual = h("div.lock-visual." + (opts.kind || "padlock"), { html: opts.kind === "safe" ? SAFE_SVG : PADLOCK_SVG });
  const slots = h("div.code-slots", { role: "group", "aria-label": opts.label || "Código" });
  const live = h("div.sr-only", { "aria-live": "polite" });

  const renderSlots = () => {
    slots.innerHTML = "";
    for (let i = 0; i < length; i++) {
      slots.append(h("span.code-slot" + (i < value.length ? ".filled" : "") + (i === value.length ? ".cursor" : ""), {}, value[i] || "_"));
    }
    live.textContent = value.length ? `Introducido: ${value.split("").join(" ")}` : "";
  };

  const press = (d) => {
    if (busy || value.length >= length) return;
    value += d;
    audio.sfx("click");
    renderSlots();
  };
  const del = () => {
    if (busy) return;
    value = value.slice(0, -1);
    renderSlots();
  };
  const submit = async () => {
    if (busy) return;
    if (value.length < length) {
      shake();
      return;
    }
    busy = true;
    const res = await opts.onSubmit(value);
    if (!res || !res.ok) {
      shake();
      value = "";
      renderSlots();
    }
    busy = false;
  };

  const keys = h("div.keypad");
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"].forEach((d) =>
    keys.append(h("button.key", { type: "button", onclick: () => press(d), "aria-label": `Díxito ${d}` }, d))
  );
  keys.append(h("button.key.key-del", { type: "button", onclick: del, "aria-label": "Borrar" }, "⌫"));
  keys.append(h("button.key", { type: "button", onclick: () => press("0"), "aria-label": "Díxito 0" }, "0"));
  keys.append(h("button.key.key-ok", { type: "button", onclick: submit, "aria-label": "Abrir" }, "ABRIR"));

  const top = h("div.code-lock-top", {}, visual, slots, live);
  const el = h("div.code-lock", {}, top, keys);
  // Teclado físico (escritorio): só mentres o candado está na páxina.
  const onKey = (e) => {
    if (!document.body.contains(top)) {
      document.removeEventListener("keydown", onKey);
      return;
    }
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (document.querySelector(".modal-backdrop")) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === "Backspace") del();
    else if (e.key === "Enter" && !(e.target && e.target.tagName === "BUTTON")) submit();
  };
  document.addEventListener("keydown", onKey);

  function shake() {
    visual.classList.remove("shake");
    void visual.offsetWidth;
    visual.classList.add("shake");
    audio.sfx("error");
  }

  async function open() {
    busy = true;
    audio.sfx("lock");
    visual.classList.add("unlocking");
    await wait(450);
    visual.classList.add("open");
    keys.classList.add("disabled");
    keys.querySelectorAll("button").forEach((b) => (b.disabled = true));
    await wait(900);
  }

  renderSlots();
  return { el, top, keys, open, shake, visual };
}

