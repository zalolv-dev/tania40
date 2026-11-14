// CONSOLA DE GONZALO · acceso discreto (7 toques no rodapé) + PIN.
// Non é seguridade real: o código é visible. Só evita accesos accidentais.
import { CONFIG } from "./config.js";
import * as S from "./state.js";
import { h, btn, modal, toast } from "./ui.js";
import { PHASES, PHASE_ITEMS } from "./phases.js";

// ---------- SHA-256 (usa crypto.subtle se existe; se non, versión JS) ----------
function sha256Fallback(ascii) {
  const rightRotate = (v, a) => (v >>> a) | (v << (32 - a));
  const maxWord = Math.pow(2, 32);
  let result = "";
  const words = [];
  const asciiBitLength = ascii.length * 8;
  const hash = [], k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += "\x80";
  while ((ascii.length % 64) - 56) ascii += "\x00";
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  let H = hash.slice(0, 8);
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = H;
    H = H.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = H[0], e = H[4];
      const temp1 = H[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & H[5]) ^ (~e & H[6])) + k[i] +
        (w[i] = i < 16 ? w[i] : (w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & H[1]) ^ (a & H[2]) ^ (H[1] & H[2]));
      H = [(temp1 + temp2) | 0].concat(H);
      H[4] = (H[4] + temp1) | 0;
      H.length = 8;
    }
    for (let i = 0; i < 8; i++) H[i] = (H[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++) for (let j = 3; j + 1; j--) {
    const b = (H[i] >> (j * 8)) & 255;
    result += (b < 16 ? "0" : "") + b.toString(16);
  }
  return result;
}

export async function sha256(text) {
  try {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) {
    console.warn("[tania40] crypto.subtle non dispoñible, uso alternativa", e);
  }
  return sha256Fallback(unescape(encodeURIComponent(text)));
}

// ---------- Activador discreto ----------
export function initAdminTrigger(el, app) {
  let taps = 0;
  let last = 0;
  el.addEventListener("click", () => {
    const now = Date.now();
    taps = now - last < 700 ? taps + 1 : 1;
    last = now;
    if (taps >= CONFIG.ADMIN_TAP_COUNT) {
      taps = 0;
      openPinPrompt(app);
    }
  });
}

let unlockedThisSession = false;

function openPinPrompt(app) {
  if (unlockedThisSession) return openConsole(app);
  const input = h("input.text-input", { id: "admin-pin", type: "password", inputmode: "numeric", autocomplete: "off" });
  const msg = h("p.admin-msg", { "aria-live": "polite" });
  let m;
  const form = h("form.admin-pin", {
    onsubmit: async (e) => {
      e.preventDefault();
      const hash = await sha256(input.value.trim());
      if (hash === CONFIG.ADMIN_PIN_SHA256) {
        unlockedThisSession = true;
        m.close();
        openConsole(app);
      } else {
        msg.textContent = "PIN incorrecto.";
        input.value = "";
        input.focus();
      }
    }
  },
  h("h2", {}, "CONSOLA DE GONZALO"),
  h("label", { for: "admin-pin" }, "PIN"),
  input,
  msg,
  h("div.admin-row", {}, h("button.btn.primary", { type: "submit" }, "ENTRAR"), btn("PECHAR", () => m.close())));
  m = modal(form, { label: "Consola de Gonzalo" });
}

// ---------- Accións ----------
function gotoPhase(n) {
  const s = S.get();
  const now = Date.now();
  s.introSeen = true;
  if (!s.startedAt) s.startedAt = now;
  s.completedPhases = s.completedPhases.filter((p) => p.id < n);
  for (let i = 1; i < n; i++) if (!s.completedPhases.some((p) => p.id === i)) s.completedPhases.push({ id: i, completedAt: now });
  s.completedPhases.sort((a, b) => a.id - b.id);
  s.currentPhase = n;
  s.nextUnlockAt = 0;
  s.finalUnlocked = n > PHASES.length;
  Object.keys(s.phaseState).forEach((k) => Number(k) >= n && delete s.phaseState[k]);
  const later = new Set();
  for (let i = n; i <= PHASES.length; i++) (PHASE_ITEMS[i] || []).forEach((it) => later.add(it.id));
  s.inventory = s.inventory.filter((it) => !later.has(it.id));
  for (let i = 1; i < n; i++) (PHASE_ITEMS[i] || []).forEach((it) => S.addItem(it));
  S.forgiveClock();
  S.save({ silent: true });
}

function exportSave() {
  const data = JSON.stringify(S.get(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = h("a", { href: URL.createObjectURL(blob), download: "tania40-save.json" });
  document.body.append(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
  toast("PARTIDA EXPORTADA");
}

function importSave(app, onDone) {
  const input = h("input", { type: "file", accept: "application/json,.json", style: { display: "none" } });
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== "object" || !("currentPhase" in data)) throw new Error("Formato descoñecido");
        S.replace(data);
        toast("PARTIDA IMPORTADA");
        onDone && onDone();
        app.render();
      } catch (e) {
        console.error("[tania40] Importación fallida", e);
        toast("ESE FICHEIRO NON PARECE UNHA PARTIDA", "error");
      }
      input.remove();
    };
    reader.readAsText(file);
  });
  document.body.append(input);
  input.click();
}

function openConsole(app) {
  let m;
  const s = S.get();
  const close = () => m && m.close();
  const act = (fn, msg) => () => {
    fn();
    if (msg) toast(msg);
    close();
    app.render();
  };

  const status = h("div.admin-status", {},
    h("div", {}, `Fase actual: ${s.currentPhase > PHASES.length ? "FINAL" : s.currentPhase}`),
    h("div", {}, `Completadas: ${s.completedPhases.map((p) => p.id).join(", ") || "ningunha"}`),
    h("div", {}, `Bloqueo restante: ${Math.ceil(S.remainingMs() / 1000)} s`),
    h("div", {}, `Desbloqueo: ${S.isDev() ? `${S.lockMs() / 1000} s (MODO DESENVOLVEMENTO)` : CONFIG.UNLOCK_MODE === "24h" ? "24 h" : "á medianoite"}`),
    h("div", {}, `Final non antes de: ${CONFIG.FINAL_DATE || "sen data"}${S.isDev() ? " (ignorado en desenvolvemento)" : ""}`),
    S.clockTampered() ? h("div.warn", {}, "Detectouse reloxo cara atrás.") : null
  );

  const phaseButtons = h("div.admin-grid");
  PHASES.forEach((p) => phaseButtons.append(btn(`IR Á FASE ${p.id}`, act(() => gotoPhase(p.id), `FASE ${p.id}`), "small")));
  phaseButtons.append(btn("IR AO FINAL", act(() => gotoPhase(PHASES.length + 1), "FINAL"), "small"));

  let resetArmed = false;
  const resetBtn = btn("REINICIAR PARTIDA", () => {
    if (!resetArmed) {
      resetArmed = true;
      resetBtn.textContent = "CONFIRMAR: BORRAR TODO";
      resetBtn.classList.add("danger");
      return;
    }
    S.reset();
    toast("PARTIDA REINICIADA");
    close();
    app.render();
  }, "small");

  const jsonBox = h("pre.admin-json", { hidden: true });
  const devOn = S.devAllowed();

  const content = h("div.admin-console", {},
    h("h2", {}, "CONSOLA DE GONZALO"),
    status,
    h("div.admin-grid", {},
      btn("DESBLOQUEAR AGORA", act(() => { S.get().nextUnlockAt = 0; S.forgiveClock(); S.save({ silent: true }); }, "DESBLOQUEADO"), "small primary"),
      btn("COMPLETAR FASE ACTUAL", act(() => {
        const cur = S.get().currentPhase;
        if (cur > PHASES.length) return;
        (PHASE_ITEMS[cur] || []).forEach((it) => S.addItem(it));
        S.completePhase(cur);
      }, "FASE COMPLETADA"), "small"),
      btn("IGNORAR RELOXO", act(() => S.forgiveClock(), "RELOXO AXUSTADO"), "small")
    ),
    h("h3", {}, "SALTAR A UNHA FASE"),
    phaseButtons,
    h("h3", {}, "PARTIDA"),
    h("div.admin-grid", {},
      btn("EXPORTAR PARTIDA", exportSave, "small"),
      btn("IMPORTAR PARTIDA", () => importSave(app, close), "small"),
      btn("VER ESTADO JSON", () => {
        jsonBox.hidden = !jsonBox.hidden;
        jsonBox.textContent = JSON.stringify(S.get(), null, 2);
      }, "small"),
      resetBtn
    ),
    jsonBox,
    h("h3", {}, "MODO DESENVOLVEMENTO"),
    h("p.admin-note", {}, devOn
      ? "Permitido. Abre a páxina con ?dev=1 para que o bloqueo dure 5 segundos."
      : "Desactivado. O seguinte capítulo ábrese á medianoite."),
    h("div.admin-grid", {},
      btn(devOn ? "DESACTIVAR MODO DESENVOLVEMENTO" : "PERMITIR MODO DESENVOLVEMENTO", act(() => S.setDevAllowed(!devOn), devOn ? "MODO NORMAL" : "?dev=1 PERMITIDO"), "small")
    ),
    h("div.admin-row", {}, btn("PECHAR CONSOLA", close, "primary"))
  );
  m = modal(content, { label: "Consola de Gonzalo" });
}
