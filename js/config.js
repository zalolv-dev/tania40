// =====================================================================
//  Tania e o segredo dos 40 · Configuración central
//  Todo o que Gonzalo pode querer cambiar está aquí (e en phases.js
//  para os textos de cada fase).
// =====================================================================

export const CONFIG = {
  VERSION: "v1",

  STORAGE_KEY: "tania40:game-state:v1",
  STATE_VERSION: 1,

  // Cando se desbloquea o seguinte capítulo:
  //  "midnight" → ás 00:00 do día seguinte (un capítulo por día de calendario)
  //  "24h"      → PHASE_LOCK_MS despois de completar o anterior
  UNLOCK_MODE: "midnight",
  PHASE_LOCK_MS: 24 * 60 * 60 * 1000,

  // O último capítulo (a caixa forte) nunca se abre antes desta data (hora local).
  // Pon null para desactivalo.
  FINAL_DATE: "2026-12-01",

  // Modo desenvolvemento: se está a true, o bloqueo dura DEV_PHASE_LOCK_MS.
  // ¡Lembra deixalo en false antes de facer push!
  // Alternativa sen tocar código: activar "modo desenvolvemento" na consola
  // de Gonzalo e abrir a páxina con ?dev=1
  DEV_MODE: false,
  DEV_PHASE_LOCK_MS: 5000,

  // Contrasinal para entrar no xogo (pídese cada vez que se abre a páxina).
  // Gárdase só o SHA-256:  echo -n "CONTRASINAL" | shasum -a 256
  // Pon null para desactivalo.
  ACCESS_PASSWORD_SHA256:
    "4c441f5ffcbdd3491389934a0396fd558e7c7c0a211fd6d06ec83821fca59fed",

  // Consola secreta: número de toques rápidos no rodapé.
  ADMIN_TAP_COUNT: 7,
  // SHA-256 do PIN da consola. PIN por defecto: 4040
  // Para cambialo:  echo -n "OTEU_PIN" | shasum -a 256
  ADMIN_PIN_SHA256:
    "b411746bdf09bde7f1fe70ddc8fa57241a0cb79d14d6e9c27e598635ca7dae4d",

  // Ligazón oficial da canción en Spotify (https://open.spotify.com/track/...).
  // Mentres sexa "TODO" úsase unha busca de Spotify como alternativa.
  SPOTIFY_URL: "TODO",
  SPOTIFY_FALLBACK_URL:
    "https://open.spotify.com/search/Con%20la%20luna%20llena%20Melendi",

  // Puzle fotográfico: substitúe o ficheiro por calquera outra foto.
  PHOTO_PUZZLE: "assets/images/puzzle.jpg",
  // Se cambias a foto e queres reiniciar o puzle a quen xa o empezou,
  // incrementa este número.
  PHOTO_PUZZLE_VERSION: 1,

  // Intentos fallidos necesarios para que aparezan as pistas 1 e 2.
  HINT_AFTER_ATTEMPTS: [2, 4],

  // Clave da caixa forte final. Só díxitos. A lonxitude da caixa adáptase.
  // Mentres sexa "TODO" a caixa usa 4 díxitos e non se pode abrir.
  FINAL_CODE: "TODO",

  // Fotos que aparecen na revelación final (opcional).
  // Exemplo: ["assets/images/final-1.jpg", "assets/images/final-2.jpg"]
  FINAL_PHOTOS: [],

  // Onde está escondido o regalo: aparece no mapa do tesouro ao abrir a caixa forte.
  // Ollo: se o repositorio é público, isto pódese ler. Ponlo pouco antes do final.
  TREASURE_LOCATION: "A estantería que hai enriba do ordenador",

  // O regalo. Se title e description están baleiros móstrase
  // "O segredo aínda non foi escrito."
  // image é opcional (ex: "assets/images/regalo.jpg").
  FINAL_GIFT: {
    title: "",
    description: "",
    image: ""
  }
};
