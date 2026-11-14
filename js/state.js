// Estado persistente da partida (localStorage).
import { CONFIG } from "./config.js?v=20261114231458";

const DEV_FLAG_KEY = "tania40:dev-allowed";
const CLOCK_TOLERANCE_MS = 2 * 60 * 1000; // pequenos axustes de reloxo non contan

export let TOTAL_PHASES = 13;
export function setTotalPhases(n) {
  TOTAL_PHASES = n;
}

export function freshState() {
  const now = Date.now();
  return {
    version: CONFIG.STATE_VERSION,
    startedAt: 0,
    introSeen: false,
    currentPhase: 1,
    completedPhases: [],
    nextUnlockAt: 0,
    lastSeenAt: now,
    inventory: [],
    phaseState: {},
    musicEnabled: false,
    finalUnlocked: false
  };
}

let state = null;
let saveListeners = [];

function storageAvailable() {
  try {
    const k = "__tania40_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}

export const hasStorage = storageAvailable();

// Normaliza/migra un obxecto de estado (tamén se usa ao importar).
export function sanitize(raw) {
  const base = freshState();
  if (!raw || typeof raw !== "object") return base;
  const s = Object.assign(base, raw);
  if (!Array.isArray(s.completedPhases)) s.completedPhases = [];
  if (!Array.isArray(s.inventory)) s.inventory = [];
  if (!s.phaseState || typeof s.phaseState !== "object") s.phaseState = {};
  s.currentPhase = Math.min(Math.max(parseInt(s.currentPhase, 10) || 1, 1), TOTAL_PHASES + 1);
  s.nextUnlockAt = Number(s.nextUnlockAt) || 0;
  s.lastSeenAt = Number(s.lastSeenAt) || 0;

  // Migracións futuras: if (s.version < 2) { ... }
  s.version = CONFIG.STATE_VERSION;

  // Se cambiou a foto do puzle, reiníciase só ese puzle.
  Object.values(s.phaseState).forEach((ps) => {
    if (ps && ps.photoPuzzle && ps.photoPuzzle.imageVersion !== CONFIG.PHOTO_PUZZLE_VERSION && !ps.photoPuzzle.solved) {
      delete ps.photoPuzzle;
    }
  });
  return s;
}

export function load() {
  let raw = null;
  if (hasStorage) {
    try {
      raw = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || "null");
    } catch (e) {
      console.error("[tania40] Estado corrupto, comézase de novo", e);
      raw = null;
    }
  }
  state = sanitize(raw);
  return state;
}

export function get() {
  return state || load();
}

export function save(opts = {}) {
  const s = get();
  s.lastSeenAt = Math.max(s.lastSeenAt || 0, Date.now());
  if (hasStorage) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.error("[tania40] Non se puido gardar", e);
    }
  }
  if (!opts.silent) saveListeners.forEach((fn) => fn());
}

export function onSave(fn) {
  saveListeners.push(fn);
}

export function replace(newState) {
  state = sanitize(newState);
  state.lastSeenAt = Date.now();
  save({ silent: true });
  return state;
}

export function reset() {
  state = freshState();
  save({ silent: true });
  return state;
}

// ---- Estado de cada fase ----
export function phase(id) {
  const s = get();
  if (!s.phaseState[id]) s.phaseState[id] = { attempts: 0, hints: 0 };
  return s.phaseState[id];
}

// ---- Inventario ----
export function hasItem(id) {
  return get().inventory.some((i) => i.id === id);
}

export function addItem(item) {
  const s = get();
  if (hasItem(item.id)) return false;
  s.inventory.push({ id: item.id, name: item.name, desc: item.desc || "", icon: item.icon || "fragment", at: Date.now() });
  return true;
}

// ---- Tempo e bloqueos ----
export function devAllowed() {
  try {
    return localStorage.getItem(DEV_FLAG_KEY) === "1";
  } catch (e) {
    return false;
  }
}

export function setDevAllowed(on) {
  try {
    if (on) localStorage.setItem(DEV_FLAG_KEY, "1");
    else localStorage.removeItem(DEV_FLAG_KEY);
  } catch (e) {
    /* sen almacenamento */
  }
}

export function isDev() {
  if (CONFIG.DEV_MODE) return true;
  const params = new URLSearchParams(location.search);
  return params.get("dev") === "1" && devAllowed();
}

export function lockMs() {
  return isDev() ? CONFIG.DEV_PHASE_LOCK_MS : CONFIG.PHASE_LOCK_MS;
}

export function finalDateMs() {
  if (!CONFIG.FINAL_DATE) return 0;
  const [y, m, d] = String(CONFIG.FINAL_DATE).split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime() || 0;
}

function nextMidnight(from = Date.now()) {
  const d = new Date(from);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

// Momento no que se desbloquea o capítulo seguinte ao completado.
export function unlockTimeAfter(completedId, now = Date.now()) {
  if (isDev()) return now + CONFIG.DEV_PHASE_LOCK_MS;
  let t = CONFIG.UNLOCK_MODE === "24h" ? now + CONFIG.PHASE_LOCK_MS : nextMidnight(now);
  if (completedId + 1 === TOTAL_PHASES) t = Math.max(t, finalDateMs());
  return t;
}

// True se o bloqueo actual é a espera pola data do final.
export function waitingFinalDate() {
  const s = get();
  return s.currentPhase === TOTAL_PHASES && finalDateMs() > 0 && s.nextUnlockAt >= finalDateMs() && remainingMs() > 0;
}

export function remainingMs() {
  return Math.max(0, get().nextUnlockAt - Date.now());
}

export function clockTampered() {
  return Date.now() + CLOCK_TOLERANCE_MS < get().lastSeenAt;
}

export function forgiveClock() {
  get().lastSeenAt = Date.now();
  save({ silent: true });
}

export function touch() {
  // Actualiza lastSeenAt só se o reloxo non retrocedeu.
  if (!clockTampered()) save({ silent: true });
}

export function isCompleted(id) {
  return get().completedPhases.some((p) => p.id === id);
}

export function completePhase(id) {
  const s = get();
  if (!isCompleted(id)) s.completedPhases.push({ id, completedAt: Date.now() });
  s.currentPhase = Math.min(id + 1, TOTAL_PHASES + 1);
  if (id >= TOTAL_PHASES) {
    s.finalUnlocked = true;
    s.nextUnlockAt = 0;
  } else {
    s.nextUnlockAt = unlockTimeAfter(id);
  }
  save();
}
