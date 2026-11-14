// Arranque e navegación entre pantallas.
import { CONFIG } from "./config.js";
import * as S from "./state.js";
import * as ui from "./ui.js";
import * as audio from "./audio.js";
import * as scenes from "./scenes.js";
import { PHASES, getPhase, CONTENT, numberGl } from "./phases.js";
import { initAdminTrigger } from "./admin.js";

const { h, btn } = ui;
let countdownTimer = null;
let musicSuppressed = false;
let currentScreen = "";

// ---------------------------------------------------------------------
//  Música
// ---------------------------------------------------------------------
const musicBtn = () => document.getElementById("music-btn");

function updateMusicButton() {
  const on = S.get().musicEnabled;
  const b = musicBtn();
  b.textContent = on ? "♫ SILENCIO" : "♫ MÚSICA";
  b.setAttribute("aria-pressed", on ? "true" : "false");
  b.setAttribute("aria-label", on ? "Silenciar a música" : "Activar a música");
}

function syncMusic() {
  const s = S.get();
  if (!s.musicEnabled || musicSuppressed) return audio.stopMusic(true);
  audio.playMusic(s.finalUnlocked ? "final" : "aventura");
}

function toggleMusic() {
  audio.unlock();
  const s = S.get();
  s.musicEnabled = !s.musicEnabled;
  musicSuppressed = false;
  S.save({ silent: true });
  updateMusicButton();
  syncMusic();
}

// ---------------------------------------------------------------------
//  Contexto que recibe cada fase
// ---------------------------------------------------------------------
function makeCtx(def) {
  const pst = S.phase(def.id);
  const ctx = {
    def,
    pst,
    S,
    ui,
    audio,
    app,
    save: (opts) => S.save(opts),
    attempt() {
      pst.attempts = (pst.attempts || 0) + 1;
      S.save({ silent: true });
    },
    addItem(item) {
      if (S.addItem(item)) {
        S.save({ silent: true });
        refreshInventory();
        ui.flashItem(item);
      }
    },
    complete() {
      if (def.reward) S.addItem(def.reward);
      S.completePhase(def.id);
      refreshInventory();
      showCompletion(def);
    }
  };
  return ctx;
}

function refreshInventory() {
  ui.renderInventory(S.get().inventory);
}

function stopCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;
}

// ---------------------------------------------------------------------
//  Router
// ---------------------------------------------------------------------
function render() {
  stopCountdown();
  ui.closeAllModals();
  const s = S.get();
  refreshInventory();
  updateMusicButton();
  document.getElementById("dev-badge").hidden = !S.isDev();

  try {
    if (S.clockTampered()) return showClockWarning();
    if (!s.introSeen) return showIntro();
    if (s.finalUnlocked || s.currentPhase > PHASES.length) return showEnding(false);
    if (S.remainingMs() > 0) return showLock();
    return playPhase(s.currentPhase);
  } catch (e) {
    console.error("[tania40] Erro ao debuxar a pantalla", e);
    showFriendlyError();
  }
}

function setScreen(name) {
  currentScreen = name;
  document.body.dataset.screen = name;
}

// ---------------------------------------------------------------------
//  Pantallas
// ---------------------------------------------------------------------
function showIntro() {
  setScreen("intro");
  ui.chapter("");
  const stage = ui.stage(h("div.scene", { html: scenes.title() }), "scene-stage title-stage");
  stage.append(h("div.title-overlay", {}, h("div.level", {}, "NIVEL"), h("div.level-num", {}, "40")));
  const steps = [
    ["Tania.", "Chegaches ata aquí.", "Pero o teu regalo segue bloqueado."],
    [`Para descubrilo terás que recuperar ${numberGl(PHASES.length)} fragmentos dunha historia que coñeces bastante ben.`]
  ];
  let i = 0;
  const next = () => {
    ui.say(steps[i]);
    if (i < steps.length - 1) {
      ui.controls(btn("SEGUINTE", () => {
        i++;
        next();
      }, "primary"));
    } else {
      ui.controls(btn("COMEZAR A AVENTURA", () => {
        audio.unlock();
        const st = S.get();
        st.introSeen = true;
        if (!st.startedAt) st.startedAt = Date.now();
        S.save();
        audio.sfx("phase");
        render();
      }, "primary big"),
      h("p.tip", {}, "Consello: activa ♫ MÚSICA arriba á dereita."));
    }
  };
  next();
}

function playPhase(id) {
  const def = getPhase(id);
  if (!def) return showEnding(false);
  setScreen("phase-" + id);
  ui.chapter(`CAPÍTULO ${id} · ${def.title.toUpperCase()}`);
  syncMusic();
  def.render(makeCtx(def));
}

function showCompletion(def) {
  setScreen("complete");
  audio.sfx("phase");
  const s = S.get();
  const isLast = def.id >= PHASES.length;
  const card = h("div.complete-card", {},
    h("div.complete-title", {}, `CAPÍTULO ${def.id} COMPLETADO`),
    def.reward ? h("div.complete-item", {}, h("span.big-icon", { "aria-hidden": "true" }, "◆"), def.reward.name) : null,
    h("div.complete-count", {}, `Fragmentos: ${Math.min(s.completedPhases.length, PHASES.length - 1)} / ${PHASES.length}`)
  );
  const stage = ui.stageEl();
  stage.append(h("div.stage-overlay.complete-overlay", {}, card));
  ui.say(def.reward ? [`Recuperaches: ${def.reward.name}.`, def.reward.desc] : ["Fragmento recuperado."]);
  ui.controls(btn(isLast ? "CONTINUAR" : "CONTINUAR", () => render(), "primary"));
}

function showLock() {
  setScreen("lock");
  const s = S.get();
  const last = s.completedPhases.length ? s.completedPhases[s.completedPhases.length - 1].id : 0;
  ui.chapter(`CAPÍTULO ${s.currentPhase} · BLOQUEADO`);
  const timeEl = h("div.countdown", { role: "timer", "aria-live": "off" }, ui.formatCountdown(S.remainingMs()));
  const finalWait = S.waitingFinalDate();
  const stage = ui.stage(h("div.scene", { html: scenes.title() }), "scene-stage lock-screen");
  stage.append(
    h("div.stage-overlay", {},
      h("div.lock-card", {},
        h("div.lock-title", {}, finalWait ? "A CAIXA FORTE AGARDA" : "SEGUINTE CAPÍTULO BLOQUEADO"),
        timeEl,
        h("div.lock-sub", {}, `Fragmentos: ${Math.min(last, PHASES.length - 1)} / ${PHASES.length}`)))
  );
  ui.say(finalWait
    ? ["Chegaches antes do previsto.", `A caixa forte só se abrirá o ${finalDateText()}.`, "Ata entón, a partida queda gardada."]
    : ["A aventura continuará cando chegue o momento.", "Podes pechar esta páxina.", "A partida queda gardada."], { instant: true });
  ui.controls(h("p.tip", {}, "Mentres agardas, podes revisar o inventario."));
  syncMusic();
  countdownTimer = setInterval(() => {
    if (S.clockTampered()) return render();
    S.touch();
    const r = S.remainingMs();
    timeEl.textContent = ui.formatCountdown(r);
    if (r <= 0) {
      stopCountdown();
      audio.sfx("phase");
      ui.toast("NOVO CAPÍTULO DISPOÑIBLE");
      render();
    }
  }, 1000);
}

const MONTHS_GL = ["xaneiro", "febreiro", "marzo", "abril", "maio", "xuño", "xullo", "agosto", "setembro", "outubro", "novembro", "decembro"];
function finalDateText() {
  const d = new Date(S.finalDateMs());
  return `${d.getDate()} de ${MONTHS_GL[d.getMonth()]}`;
}

function showClockWarning() {
  setScreen("clock");
  ui.chapter("");
  ui.stage(h("div.scene", { html: scenes.title() }), "scene-stage");
  ui.say(["O reloxo parece ter viaxado no tempo.", "Isto é unha aventura gráfica, non Regreso ao futuro."], { instant: true });
  ui.controls(
    h("p.tip", {}, "Pon o reloxo do teléfono na hora correcta e volve tentalo."),
    btn("TENTAR DE NOVO", () => render(), "primary")
  );
}

function showFriendlyError() {
  setScreen("error");
  ui.say(["Parece que este recordo se perdeu polo camiño."], { instant: true });
  ui.controls(btn("TENTAR DE NOVO", () => location.reload(), "primary"));
}

// ---------------------------------------------------------------------
//  Revelación final
// ---------------------------------------------------------------------
function confetti(container) {
  if (ui.reducedMotion()) return;
  const layer = h("div.confetti", { "aria-hidden": "true" });
  const colors = ["#ff6f91", "#ffd86b", "#7ad1a8", "#9fd0ff", "#f4c430", "#ffffff"];
  for (let i = 0; i < 70; i++) {
    layer.append(h("i", {
      style: {
        left: Math.random() * 100 + "%",
        background: colors[i % colors.length],
        animationDelay: (Math.random() * 1.8).toFixed(2) + "s",
        animationDuration: (2.2 + Math.random() * 2).toFixed(2) + "s"
      }
    }));
  }
  container.append(layer);
  setTimeout(() => layer.remove(), 6000);
}

function finalReveal() {
  const def = getPhase(PHASES.length);
  S.completePhase(def.id);
  setScreen("reveal");
  musicSuppressed = false;
  audio.stopMusic();
  if (S.get().musicEnabled) audio.playMusic("final");
  audio.sfx("success");
  ui.chapter("A CAIXA FORTE · ABERTA");
  const stage = ui.stageEl();
  stage.append(h("div.stage-banner.big", {}, "ACCESO CONCEDIDO"));
  confetti(stage);
  ui.say(["ACCESO CONCEDIDO"]);
  ui.controls(btn("SEGUINTE", () => showEnding(true), "primary"));
}

function photoStrip() {
  if (!CONFIG.FINAL_PHOTOS.length) return null;
  const strip = h("div.photo-strip");
  CONFIG.FINAL_PHOTOS.forEach((src, i) => {
    const img = h("img", { src, alt: `Lembranza ${i + 1}`, loading: "lazy" });
    img.addEventListener("error", () => {
      console.error(`[tania40] Non se atopou a foto final: ${src}`);
      img.remove();
    });
    strip.append(img);
  });
  return strip;
}

function showEnding(animated) {
  setScreen("ending");
  ui.chapter("FINAL");
  musicSuppressed = false;
  syncMusic();
  const C = CONTENT.caixa;
  const stage = ui.stage(h("div.scene", { html: scenes.title() }), "scene-stage ending-stage");
  const strip = photoStrip();
  stage.append(h("div.stage-overlay", {}, h("div.ending-card", {}, h("div.level-num.small", {}, "40"), strip)));
  if (animated) confetti(stage);
  ui.say(C.reveal, { instant: !animated });
  ui.controls(
    btn("DESCUBRIR O REGALO", showGift, "primary big"),
    btn("VER A REVELACIÓN DE NOVO", () => {
      confetti(ui.stageEl());
      ui.say(C.reveal);
    }, "small")
  );
}

function showGift() {
  const g = CONFIG.FINAL_GIFT || {};
  audio.sfx("item");
  const empty = !g.title && !g.description;
  const content = h("div.gift", {},
    empty ? h("p.gift-empty", {}, CONTENT.caixa.emptyGift) : null,
    g.title ? h("h2.gift-title", {}, g.title) : null,
    g.image ? h("img.gift-img", { src: g.image, alt: g.title || "O regalo" }) : null,
    g.description ? h("p.gift-desc", {}, g.description) : null
  );
  const m = ui.modal(h("div", {}, content, btn("PECHAR", () => m.close(), "primary")), { label: "O regalo" });
  if (!empty) confetti(m.el);
}

// ---------------------------------------------------------------------
//  API para outros módulos
// ---------------------------------------------------------------------
const app = {
  render,
  suppressMusic() {
    musicSuppressed = true;
    audio.stopMusic(true);
  },
  finalReveal
};

// ---------------------------------------------------------------------
//  Arranque
// ---------------------------------------------------------------------
function boot() {
  ui.init();
  S.setTotalPhases(PHASES.length);
  S.load();
  if (!S.hasStorage) ui.toast("ESTE NAVEGADOR NON GARDA A PARTIDA", "error");

  document.getElementById("footer-tag").textContent = `Tania e o segredo dos 40 · ${CONFIG.VERSION}`;
  musicBtn().addEventListener("click", toggleMusic);
  initAdminTrigger(document.getElementById("footer-tag"), app);

  S.onSave(() => ui.toast("PARTIDA GARDADA"));

  // Os navegadores móbiles bloquean o audio ata o primeiro toque.
  const firstGesture = () => {
    audio.unlock();
    if (S.get().musicEnabled && currentScreen !== "complete") syncMusic();
    window.removeEventListener("pointerdown", firstGesture);
    window.removeEventListener("keydown", firstGesture);
  };
  window.addEventListener("pointerdown", firstGesture);
  window.addEventListener("keydown", firstGesture);

  // Ao volver á pestana, revisar bloqueos.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && (currentScreen === "lock" || currentScreen === "clock")) render();
  });

  render();
}

window.addEventListener("error", (e) => {
  console.error("[tania40] Erro non controlado:", e.error || e.message);
  try {
    ui.toast("Parece que este recordo se perdeu polo camiño.", "error");
  } catch (_) {
    /* nada */
  }
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[tania40] Promesa rexeitada:", e.reason);
});

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
