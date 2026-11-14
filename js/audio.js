// Banda sonora orixinal e efectos con Web Audio API.
// Estilo tarxeta FM/AdLib: onda cadrada suave, pad triangular, baixo discreto.

let ctx = null;
let master = null;
let musicGain = null;
let sfxGain = null;
let timer = null;
let currentTrack = null;
let step = 0;
let nextTime = 0;

const MIDI = (n) => 440 * Math.pow(2, (n - 69) / 12);

// Notas: número MIDI ou null (silencio). Cada paso = corchea.
// "aventura": tema principal, lento e melancólico-amable (Re maior / Si menor).
const TRACKS = {
  aventura: {
    bpm: 84,
    melody: [
      74, null, 76, 78, null, 76, 74, null, 71, null, 73, 74, null, null, null, null,
      74, null, 76, 78, null, 81, 78, null, 76, null, 74, 76, null, null, null, null,
      71, null, 74, 76, null, 74, 71, null, 69, null, 71, 73, null, 74, 76, null,
      78, null, 76, 74, null, 73, 71, null, 73, null, 74, null, null, null, null, null
    ],
    chords: [
      [62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64],
      [62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]
    ],
    bass: [38, 35, 43, 45, 38, 35, 43, 45]
  },
  // "final": máis luminoso e áxil para a revelación.
  final: {
    bpm: 118,
    melody: [
      74, 78, 81, null, 79, 78, 76, null, 78, 76, 74, null, 73, 74, 76, null,
      74, 78, 81, null, 83, 81, 79, 78, 76, 78, 79, 81, 78, null, null, null,
      79, 78, 76, null, 74, 76, 78, null, 76, 74, 73, null, 71, 73, 74, null,
      76, 78, 79, 81, 83, null, 81, 79, 78, null, 76, null, 74, null, null, null
    ],
    chords: [
      [62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62],
      [62, 66, 69], [57, 61, 64], [55, 59, 62], [57, 61, 64]
    ],
    bass: [38, 33, 35, 31, 38, 33, 31, 33]
  }
};

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.16;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    musicGain.connect(lp);
    lp.connect(master);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.22;
    sfxGain.connect(master);
  } catch (e) {
    console.warn("[tania40] Web Audio non dispoñible", e);
    ctx = null;
  }
  return ctx;
}

export function unlock() {
  const c = ensure();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

function tone(dest, { freq, start, dur, type = "square", vol = 0.3, attack = 0.01, release = 0.08, detune = 0 }) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(vol, start + attack);
  g.gain.setValueAtTime(vol, Math.max(start + attack, start + dur - release));
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(dest);
  o.start(start);
  o.stop(start + dur + 0.02);
}

function scheduleStep(track, i, t) {
  const eighth = 60 / track.bpm / 2;
  const n = track.melody[i % track.melody.length];
  if (n != null) {
    tone(musicGain, { freq: MIDI(n), start: t, dur: eighth * 1.7, type: "square", vol: 0.16, release: 0.12 });
    tone(musicGain, { freq: MIDI(n), start: t, dur: eighth * 1.7, type: "triangle", vol: 0.12, detune: 6 });
  }
  if (i % 8 === 0) {
    const bar = Math.floor(i / 8) % track.chords.length;
    track.chords[bar].forEach((c) =>
      tone(musicGain, { freq: MIDI(c), start: t, dur: eighth * 8, type: "triangle", vol: 0.07, attack: 0.25, release: 0.5 })
    );
    const b = track.bass[bar];
    tone(musicGain, { freq: MIDI(b), start: t, dur: eighth * 3, type: "triangle", vol: 0.28 });
    tone(musicGain, { freq: MIDI(b), start: t + eighth * 4, dur: eighth * 3, type: "triangle", vol: 0.22 });
  }
}

function tick() {
  if (!ctx || !currentTrack) return;
  const track = TRACKS[currentTrack];
  const eighth = 60 / track.bpm / 2;
  while (nextTime < ctx.currentTime + 0.25) {
    scheduleStep(track, step, nextTime);
    step = (step + 1) % track.melody.length;
    nextTime += eighth;
  }
}

export function playMusic(name = "aventura") {
  if (!ensure()) return;
  unlock();
  if (currentTrack === name && timer) return;
  stopMusic();
  currentTrack = name;
  step = 0;
  nextTime = ctx.currentTime + 0.1;
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setValueAtTime(0.16, ctx.currentTime);
  timer = setInterval(tick, 60);
  tick();
}

export function stopMusic(fade = false) {
  if (timer) clearInterval(timer);
  timer = null;
  currentTrack = null;
  if (ctx && musicGain && fade) {
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
  }
}

export function isPlaying() {
  return !!timer;
}

// ---------- Efectos ----------
const SFX = {
  click: [[72, 0, 0.05, "square", 0.25]],
  item: [[76, 0, 0.08], [81, 0.08, 0.08], [88, 0.16, 0.18]],
  error: [[52, 0, 0.12, "square", 0.3], [47, 0.12, 0.22, "square", 0.3]],
  success: [[72, 0, 0.1], [76, 0.1, 0.1], [79, 0.2, 0.1], [84, 0.3, 0.3]],
  lock: [[40, 0, 0.06, "square", 0.4], [64, 0.1, 0.06], [76, 0.22, 0.08], [83, 0.32, 0.25, "triangle", 0.35]],
  phase: [[67, 0, 0.12], [71, 0.12, 0.12], [74, 0.24, 0.12], [79, 0.36, 0.12], [83, 0.48, 0.4, "triangle"]],
  type: [[90, 0, 0.02, "square", 0.08]]
};

export function sfx(name) {
  if (!ensure() || ctx.state !== "running") return;
  const t0 = ctx.currentTime + 0.01;
  (SFX[name] || SFX.click).forEach(([n, t, d, type = "square", vol = 0.22]) =>
    tone(sfxGain, { freq: MIDI(n), start: t0 + t, dur: d, type, vol, release: Math.min(0.05, d / 2) })
  );
}
