// Arranque e navegación entre pantallas.
import { CONFIG } from "./config.js?v=20261114231458";
import * as S from "./state.js?v=20261114231458";
import * as ui from "./ui.js?v=20261114231458";
import * as audio from "./audio.js?v=20261114231458";
import * as scenes from "./scenes.js?v=20261114231458";
import { PHASES, getPhase, CONTENT, numberGl } from "./phases.js?v=20261114231458";
import { initAdminTrigger, sha256 } from "./admin.js?v=20261114231458";
import { renderMap } from "./map.js?v=20261114231458";

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

// ---------- Mapa do tesouro ----------
function mapPieces() {
  return PHASES.map((p) => ({ icon: p.mapIcon || "◆", title: p.title }));
}
function mapRevealed() {
  return Math.min(S.get().completedPhases.filter((p) => p.id < PHASES.length).length, PHASES.length - 1);
}
function mapNode(opts = {}) {
  const s = S.get();
  return renderMap({ pieces: mapPieces(), revealed: mapRevealed(), complete: !!s.finalUnlocked, ...opts });
}
function openMap() {
  audio.sfx("click");
  const m = ui.modal(h("div", {}, mapNode({ big: true }),
    h("p.map-note", {}, S.get().finalUnlocked
      ? "O mapa está completo. Xa sabes onde buscar."
      : "Cada capítulo completado descobre un anaco. O último está gardado nunha caixa forte."),
    btn("PECHAR", () => m.close(), "primary")), { label: "Mapa do tesouro" });
}

// ---------- Álbum de fotos (só algúns capítulos teñen foto) ----------
function unlockedPhotos() {
  const done = new Set(S.get().completedPhases.map((p) => p.id));
  return PHASES.filter((p) => p.photo && done.has(p.id)).map((p) => ({ ...p.photo, title: p.title, id: p.id }));
}

function polaroid(photo, big = false) {
  const img = h("img.polaroid-img", { src: photo.src, alt: photo.caption, loading: big ? "eager" : "lazy" });
  const fig = h("figure.polaroid" + (big ? ".big" : ""), {}, img, h("figcaption", {}, photo.caption));
  img.addEventListener("error", () => {
    console.error(`[tania40] Non se atopou a foto: ${photo.src}`);
    fig.replaceWith(h("p.tip", {}, "Parece que esta foto se perdeu polo camiño."));
  });
  return fig;
}

function openAlbum() {
  audio.sfx("click");
  const photos = unlockedPhotos();
  const total = PHASES.filter((p) => p.photo).length;
  const m = ui.modal(h("div.album", {},
    h("h2", {}, `ÁLBUM · ${photos.length}/${total}`),
    h("p.map-note", {}, "Algúns capítulos gardan unha foto de verdade. Esta é a vosa colección."),
    h("div.album-grid", {}, ...photos.map((p) => polaroid(p))),
    btn("PECHAR", () => m.close(), "primary")), { label: "Álbum de fotos" });
}

function refreshInventory() {
  const photos = unlockedPhotos();
  const albumBtn = photos.length ? h("button.inv-item.inv-map", { type: "button", role: "listitem", "aria-label": "Inventario: Álbum de fotos", onclick: openAlbum },
    h("span.inv-icon", { "aria-hidden": "true" }, "▣"),
    h("span.inv-name", {}, `Álbum (${photos.length})`)) : null;
  const mapBtn = h("button.inv-item.inv-map", { type: "button", role: "listitem", "aria-label": "Inventario: Mapa do tesouro", onclick: openMap },
    h("span.inv-icon", { "aria-hidden": "true" }, "▦"),
    h("span.inv-name", {}, `Mapa (${S.get().finalUnlocked ? PHASES.length : mapRevealed()}/${PHASES.length})`));
  ui.renderInventory(S.get().inventory, null, [mapBtn, albumBtn].filter(Boolean));
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
    if (!isAuthed()) return showGate();
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
  stage.append(h("div.title-couple", { html: scenes.coupleSprite() }));
  const steps = [
    ["Tania.", "Chegaches ata aquí.", "Pero o teu regalo segue escondido."],
    ["Alguén o agochou nun lugar secreto. E só hai unha maneira de atopalo: un mapa do tesouro.",
      `O problema é que o mapa rompeu en ${numberGl(PHASES.length)} anacos, espallados polos recordos dunha historia que coñeces bastante ben.`],
    ["Cada capítulo que superes descubrirá un anaco do mapa.", "Ánimo, exploradora. O tesouro agarda."]
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
    mapNode({ highlight: def.id - 1 }),
    h("div.complete-count", {}, "NOVO ANACO DO MAPA!")
  );
  const stage = ui.stageEl();
  stage.append(h("div.stage-overlay.complete-overlay", {}, card));
  const left = PHASES.length - mapRevealed();
  ui.say([
    ...(def.reward ? [`Recuperaches: ${def.reward.name}.`] : []),
    "E, escondido nese recordo, un novo anaco do mapa do tesouro.",
    left > 1 ? `Faltan ${left} anacos. O tesouro está cada vez máis preto.` : "Só falta un anaco... e está gardado nunha caixa forte."
  ]);
  if (def.photo) {
    // Primeiro o mapa; despois, unha foto de verdade.
    ui.controls(btn("VER A LEMBRANZA", () => {
      audio.sfx("item");
      ui.say(["Entre as páxinas do mapa aparece unha foto de verdade.", "Gárdase no álbum do inventario."]);
      const pic = polaroid(def.photo, true);
      ui.controls(pic, btn("CONTINUAR", () => render(), "primary"));
      setTimeout(() => pic.scrollIntoView && pic.scrollIntoView({ behavior: ui.reducedMotion() ? "auto" : "smooth", block: "center" }), 150);
    }, "primary"));
  } else {
    ui.controls(btn("CONTINUAR", () => render(), "primary"));
  }
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
        h("div.lock-sub", {}, `Mapa do tesouro: ${mapRevealed()} / ${PHASES.length} anacos`)))
  );
  ui.say(finalWait
    ? ["Chegaches antes do previsto.", `A caixa forte só se abrirá o ${finalDateText()}.`, "Ata entón, a partida queda gardada."]
    : ["A aventura continuará cando chegue o momento.", "Podes pechar esta páxina.", "A partida queda gardada."], { instant: true });
  ui.controls(btn("VER O MAPA DO TESOURO", openMap, "small"), h("p.tip", {}, "Mentres agardas, podes revisar o mapa e o inventario."));
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
  ui.say(["ACCESO CONCEDIDO", "Dentro da caixa forte hai un papel vello e dobrado...", "É o último anaco do mapa do tesouro."]);
  refreshInventory();
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
  stage.append(h("div.stage-overlay", {}, h("div.ending-card", {}, mapNode({ complete: true, highlight: animated ? PHASES.length - 1 : -1 }), strip)));
  if (animated) confetti(stage);
  const where = CONFIG.TREASURE_LOCATION;
  ui.say([...C.reveal, where ? `O mapa está completo. O tesouro agarda en: ${where.charAt(0).toLowerCase() + where.slice(1)}.` : C.emptyGift], { instant: !animated });
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
    mapNode({ complete: true, big: true }),
    empty ? h("p.gift-empty", {}, CONFIG.TREASURE_LOCATION ? "Segue o mapa. O teu regalo está agardando alí." : CONTENT.caixa.emptyGift) : null,
    g.title ? h("h2.gift-title", {}, g.title) : null,
    g.image ? h("img.gift-img", { src: g.image, alt: g.title || "O regalo" }) : null,
    g.description ? h("p.gift-desc", {}, g.description) : null
  );
  const m = ui.modal(h("div", {}, content, btn("PECHAR", () => m.close(), "primary")), { label: "O regalo" });
  if (!empty) confetti(m.el);
}

// ---------------------------------------------------------------------
//  Contrasinal de acceso (non é seguridade real: o código é visible)
// ---------------------------------------------------------------------
const AUTH_KEY = "tania40:auth";
function isAuthed() {
  if (!CONFIG.ACCESS_PASSWORD_SHA256) return true;
  try {
    return sessionStorage.getItem(AUTH_KEY) === CONFIG.ACCESS_PASSWORD_SHA256;
  } catch (e) {
    return authedInMemory;
  }
}
let authedInMemory = false;

function showGate() {
  setScreen("gate");
  ui.chapter("");
  const stage = ui.stage(h("div.scene", { html: scenes.title() }), "scene-stage title-stage");
  stage.append(h("div.title-overlay", {}, h("div.level", {}, "NIVEL"), h("div.level-num", {}, "40")));
  stage.append(h("div.title-couple", { html: scenes.coupleSprite() }));
  ui.say(["Esta aventura é privada.", "Introduce o contrasinal para continuar."], { instant: true });
  const input = h("input.text-input", { id: "gate-pass", type: "password", autocomplete: "current-password", autocapitalize: "off", autocorrect: "off", spellcheck: "false" });
  const msg = h("p.admin-msg", { "aria-live": "polite" });
  const form = h("form.answer-form", {
    onsubmit: async (e) => {
      e.preventDefault();
      audio.unlock();
      const hash = await sha256(input.value);
      if (hash === CONFIG.ACCESS_PASSWORD_SHA256) {
        try {
          sessionStorage.setItem(AUTH_KEY, hash);
        } catch (err) {
          /* sen almacenamento de sesión */
        }
        authedInMemory = true;
        audio.sfx("success");
        render();
      } else {
        audio.sfx("error");
        msg.textContent = "Contrasinal incorrecto. Ollo coas maiúsculas e os números.";
        input.value = "";
        input.focus();
      }
    }
  },
  h("label.answer-label", { for: "gate-pass" }, "CONTRASINAL"),
  input,
  msg,
  h("button.btn.primary", { type: "submit" }, "ENTRAR"));
  ui.controls(form);
}

// ---------------------------------------------------------------------
//  API para outros módulos
// ---------------------------------------------------------------------
// Completar o capítulo actual desde a consola, coa mesma pantalla final que xogando.
function completeCurrent() {
  const s = S.get();
  const def = getPhase(s.currentPhase);
  if (!def || s.finalUnlocked) return render();
  if (S.remainingMs() > 0) {
    s.nextUnlockAt = 0;
    S.forgiveClock();
    S.save({ silent: true });
  }
  if (currentScreen !== "phase-" + def.id) playPhase(def.id);
  if (def.id === PHASES.length) return finalReveal();
  (def.items || []).forEach((it) => S.addItem(it));
  makeCtx(def).complete();
}

const app = {
  render,
  completeCurrent,
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
