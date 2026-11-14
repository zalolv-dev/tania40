// Validadores de respostas libres. Non se esixe coincidencia exacta.

export function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tiles
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s]/g, " ") // signos
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(norm, list) {
  const padded = ` ${norm} `;
  return list.some((w) => padded.includes(` ${normalize(w)} `) || (w.endsWith("*") && padded.includes(` ${normalize(w.slice(0, -1))}`)));
}

// ---------- FASE 1 · A frase da Torre ----------
const KISS = [
  "besar", "besarnos", "besarme", "besarte", "beso", "besos", "besamos", "besemos", "besas", "besame", "besandonos",
  "bicar", "bicarnos", "bicarme", "bicarte", "bico", "bicos", "bicamos", "biquemos", "bicas", "bicame", "bicandonos",
  "bes*", "bic*"
];
const TALK = [
  "seguir hablando", "seguir falando", "sigues hablando", "segues falando", "seguimos hablando", "seguimos falando",
  "hablando", "falando", "hablar", "falar", "charlando", "conversando", "parlando", "rollo"
];
const WASTE_TIME = [
  "perder el tiempo", "perdiendo el tiempo", "perder o tempo", "perdendo o tempo",
  "perdemos el tiempo", "perdemos o tempo", "perder tiempo", "perder tempo", "perdiendo tiempo", "perdendo tempo"
];

export function validateTowerPhrase(input) {
  const n = normalize(input);
  if (!n) return { ok: false, code: "empty" };
  const kiss = containsAny(n, KISS);
  const talk = containsAny(n, TALK);
  const waste = containsAny(n, WASTE_TIME) || (/\bperd/.test(n) && /\b(tiempo|tempo)\b/.test(n));
  const second = talk || waste;
  if (kiss && second) return { ok: true, variant: waste ? "tempo" : "falar" };
  if (kiss) return { ok: false, code: "kiss-only" };
  if (second) return { ok: false, code: "second-only" };
  return { ok: false, code: "none" };
}

// ---------- FASE 5 · Quen manchou a saba ----------
// Resposta correcta: Gonzalo (o mesmo que foi queixarse á recepción).
export function validateSheetCulprit(input) {
  const n = normalize(input);
  if (!n) return { ok: false, code: "empty" };
  const gonzalo = /\b(gonzalo|gonza|marido|home|esposo|reclamante)\b/.test(n);
  const tania = /\b(tania|ela|ella|eu|yo|min|mi)\b/.test(n);
  const us = ["nos", "nosotros", "nosoutros", "nosoutras", "nosotras", "os dous", "os dos", "los dos", "ambos", "ambos dous",
    "fomos nos", "fuimos nosotros", "nosa", "nuestra"];
  if ((gonzalo && /\btania\b/.test(n)) || containsAny(n, us)) return { ok: false, code: "us" };
  if (gonzalo) return { ok: true };
  if (/\b(hotel|limpeza|limpieza|camareira|camarera|recepcion|servizo|servicio|lavanderia)\b/.test(n)) return { ok: false, code: "hotel" };
  if (/\b(fantasma|pantasma|espirito|espiritu|alien|extraterrestre)\b/.test(n)) return { ok: false, code: "ghost" };
  if (tania) return { ok: false, code: "tania" };
  return { ok: false, code: "none" };
}

// ---------- FASE 6 · A canción ----------
export function validateSong(input) {
  const n = normalize(input);
  if (!n) return { ok: false, code: "empty" };
  const moon = /\b(luna|lua)\b/.test(n);
  const full = /\b(llena|chea|llenita)\b/.test(n);
  if (moon && full) return { ok: true };
  if (/\bmelendi\b/.test(n)) return { ok: false, code: "artist" };
  if (moon) return { ok: false, code: "moon" };
  return { ok: false, code: "none" };
}

// ---------- Xenérico ----------
export function matchesAny(input, accepted) {
  const n = normalize(input);
  return accepted.some((a) => normalize(a) === n);
}
