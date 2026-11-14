// Utilidades de interface: escena, diálogo, controis, inventario, avisos.
import * as audio from "./audio.js";

export const $ = (sel, root = document) => root.querySelector(sel);

export const reducedMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Crea elementos: h("button.btn", { onclick }, "texto", ...fillos)
export function h(tag, attrs = {}, ...children) {
  const [name, ...classes] = tag.split(".");
  const node = document.createElement(name || "div");
  if (classes.length) node.className = classes.join(" ");
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (k === "html") node.innerHTML = v;
    else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function btn(label, onClick, cls = "") {
  return h(`button.btn${cls ? "." + cls.split(" ").join(".") : ""}`, {
    type: "button",
    onclick: (e) => {
      audio.sfx("click");
      onClick && onClick(e);
    }
  }, label);
}

const els = {};
export function init() {
  els.stage = $("#stage");
  els.dialog = $("#dialog");
  els.controls = $("#controls");
  els.inventory = $("#inventory");
  els.toast = $("#toast");
  els.chapter = $("#chapter");
  els.modal = $("#modal-root");
  els.dialog.addEventListener("click", () => skipTyping());
}

export function stage(content, cls = "") {
  els.stage.className = "stage" + (cls ? " " + cls : "");
  els.stage.innerHTML = "";
  if (typeof content === "string") els.stage.innerHTML = content;
  else if (content) els.stage.append(content);
  return els.stage;
}

export function stageEl() {
  return els.stage;
}

export function chapter(text) {
  els.chapter.textContent = text || "";
}

export function controls(...nodes) {
  els.controls.innerHTML = "";
  nodes.flat().forEach((n) => n && els.controls.append(n));
  return els.controls;
}

export function controlsEl() {
  return els.controls;
}

// ---------- Diálogo con efecto máquina de escribir ----------
let typingToken = 0;
let finishTyping = null;

function skipTyping() {
  if (finishTyping) finishTyping();
}

// lines: string ou array de strings (cada unha un parágrafo).
export function say(lines, opts = {}) {
  const token = ++typingToken;
  const paragraphs = Array.isArray(lines) ? lines : [lines];
  els.dialog.innerHTML = "";
  els.dialog.className = "dialog" + (opts.cls ? " " + opts.cls : "");
  if (opts.speaker) els.dialog.append(h("div.speaker", {}, opts.speaker));
  const box = h("div.dialog-text");
  els.dialog.append(box);
  const full = paragraphs.join("\n\n");

  // Lectores de pantalla: texto completo de golpe.
  box.setAttribute("aria-label", full);

  if (reducedMotion() || opts.instant) {
    box.textContent = full;
    finishTyping = null;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let i = 0;
    const done = () => {
      if (token !== typingToken) return resolve();
      box.textContent = full;
      finishTyping = null;
      resolve();
    };
    finishTyping = done;
    const stepFn = () => {
      if (token !== typingToken) return resolve();
      if (finishTyping !== done) return;
      i += 2;
      box.textContent = full.slice(0, i);
      if (i % 8 === 0) audio.sfx("type");
      if (i >= full.length) done();
      else setTimeout(stepFn, 22);
    };
    stepFn();
  });
}

// ---------- Aviso "PARTIDA GARDADA" ----------
let toastTimer = null;
export function toast(text = "PARTIDA GARDADA", cls = "") {
  els.toast.textContent = text;
  els.toast.className = "toast show" + (cls ? " " + cls : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (els.toast.className = "toast"), 1600);
}

// ---------- Inventario ----------
const ICONS = {
  fragment: "◆",
  sheet: "▤",
  photo: "▣",
  moon: "☾",
  postal: "✉",
  shell: "◎",
  key: "⚿",
  family: "♥",
  clock: "⧗",
  lentil: "◉",
  ball: "●",
  house: "⌂"
};

export function renderInventory(items, onPick) {
  els.inventory.innerHTML = "";
  els.inventory.append(h("div.inv-title", {}, "INVENTARIO"));
  const list = h("div.inv-list", { role: "list" });
  if (!items.length) {
    list.append(h("div.inv-empty", {}, "Aínda baleiro."));
  }
  items.forEach((it) => {
    list.append(
      h("button.inv-item", {
        type: "button",
        role: "listitem",
        title: it.name,
        "aria-label": `Inventario: ${it.name}`,
        onclick: () => {
          audio.sfx("click");
          onPick ? onPick(it) : say([it.name.toUpperCase(), it.desc]);
        }
      },
      h("span.inv-icon", { "aria-hidden": "true" }, ICONS[it.icon] || ICONS.fragment),
      h("span.inv-name", {}, it.name))
    );
  });
  els.inventory.append(list);
}

export function flashItem(item) {
  audio.sfx("item");
  toast(`OBXECTO: ${item.name.toUpperCase()}`, "item");
}

// ---------- Puntos interactivos sobre a escena ----------
// spots: [{ label, x, y, w, h (en %), onTap }]
export function hotspots(spots) {
  const layer = h("div.hotspots");
  spots.forEach((s) => {
    const b = h("button.hotspot", {
      type: "button",
      "aria-label": s.label,
      style: { left: s.x + "%", top: s.y + "%", width: s.w + "%", height: s.h + "%" },
      onclick: () => {
        audio.sfx("click");
        s.onTap(b);
      }
    }, h("span.hotspot-mark", { "aria-hidden": "true" }), h("span.hotspot-label", {}, s.label));
    if (s.done) b.classList.add("done");
    layer.append(b);
  });
  els.stage.append(layer);
  return layer;
}

// ---------- Modal ----------
export function modal(content, { onClose, label = "Diálogo" } = {}) {
  const close = () => {
    wrap.remove();
    document.removeEventListener("keydown", onKey);
    onClose && onClose();
  };
  const onKey = (e) => e.key === "Escape" && close();
  const wrap = h("div.modal-backdrop", { role: "dialog", "aria-modal": "true", "aria-label": label },
    h("div.modal-box", {}, content));
  els.modal.append(wrap);
  document.addEventListener("keydown", onKey);
  const first = wrap.querySelector("button, input, textarea");
  if (first) setTimeout(() => first.focus(), 30);
  return { close, el: wrap };
}

export function closeAllModals() {
  els.modal.innerHTML = "";
}

// ---------- Formulario de resposta libre ----------
export function answerForm({ label, placeholder = "Escribe aquí…", submit = "RESPONDER", onSubmit }) {
  const id = "ans-" + Math.random().toString(36).slice(2, 8);
  const input = h("input.text-input", { id, type: "text", autocomplete: "off", autocapitalize: "sentences", spellcheck: "false", placeholder });
  const form = h("form.answer-form", {
    onsubmit: (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (!v) {
        input.focus();
        return;
      }
      audio.sfx("click");
      onSubmit(v, input);
    }
  },
  h("label.answer-label", { for: id }, label),
  input,
  h("button.btn.primary", { type: "submit" }, submit));
  return form;
}

// ---------- Pistas graduais ----------
// pst: estado da fase (attempts, hints). hints: [texto1, texto2]
export function hintButton(pst, hints, thresholds, save) {
  const wrap = h("div.hint-row");
  const render = () => {
    wrap.innerHTML = "";
    const shown = pst.hints || 0;
    for (let i = 0; i < shown && i < hints.length; i++) {
      wrap.append(h("div.hint-text", {}, h("strong", {}, `PISTA ${i + 1}: `), hints[i]));
    }
    if (shown < hints.length && (pst.attempts || 0) >= thresholds[shown]) {
      wrap.append(btn(`VER PISTA ${shown + 1}`, () => {
        pst.hints = shown + 1;
        save();
        render();
      }, "small"));
    }
  };
  render();
  wrap.refresh = render;
  return wrap;
}

export function wait(ms) {
  return new Promise((r) => setTimeout(r, reducedMotion() ? Math.min(ms, 150) : ms));
}

export function formatCountdown(ms) {
  const total = Math.ceil(ms / 1000);
  const days = Math.floor(total / 86400);
  const hh = Math.floor((total % 86400) / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  const clock = [hh, mm, ss].map((n) => String(n).padStart(2, "0")).join(":");
  return days > 0 ? `${days} ${days === 1 ? "día" : "días"} · ${clock}` : clock;
}
