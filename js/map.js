// MAPA DO TESOURO: cada capítulo completado descobre un anaco.
// O último anaco (a X) está dentro da caixa forte.
import { CONFIG } from "./config.js?v=20261114231458";
import { h } from "./ui.js?v=20261114231458";

const VS = "︎"; // forza símbolo de texto (non emoji) en iOS

/**
 * opts: { pieces: [{ icon, title }], revealed (número), highlight (índice novo), complete (bool) }
 */
export function renderMap({ pieces, revealed, highlight = -1, complete = false, big = false }) {
  const total = pieces.length;
  const cols = Math.ceil(total / 2);
  const grid = h("div.map-grid", { style: { gridTemplateColumns: `repeat(${cols}, 1fr)` } });

  // Camiño en serpe: fila 1 de esquerda a dereita, fila 2 de dereita a esquerda.
  const cells = new Array(total);
  pieces.forEach((p, i) => {
    const row = i < cols ? 0 : 1;
    const col = row === 0 ? i : cols - 1 - (i - cols);
    cells[row * cols + col] = { ...p, i, row, col };
  });

  for (let k = 0; k < cols * 2; k++) {
    const c = cells[k];
    if (!c) {
      grid.append(h("div.map-tile.empty", { "aria-hidden": "true" }));
      continue;
    }
    const isLast = c.i === total - 1;
    const shown = c.i < revealed || (isLast && complete);
    const dir = c.row === 0 ? (c.i === cols - 1 ? "down" : "right") : "left";
    grid.append(
      h("div.map-tile" + (shown ? ".shown" : ".fog") + (c.i === highlight ? ".new" : "") + (isLast ? ".x" : "") + (shown && !isLast ? ".path-" + dir : ""), {
        title: shown ? c.title : "?",
        "aria-label": shown ? `Anaco ${c.i + 1}: ${c.title}` : `Anaco ${c.i + 1}: descoñecido`
      },
      h("span.map-icon", { "aria-hidden": "true" }, shown ? (isLast ? "✕" + VS : c.icon + VS) : "?"))
    );
  }

  const count = Math.min(complete ? total : revealed, total);
  return h("div.treasure-map" + (big ? ".big" : ""), { role: "img", "aria-label": `Mapa do tesouro: ${count} de ${total} anacos` },
    h("div.map-title", {}, "MAPA DO TESOURO"),
    grid,
    h("div.map-foot", {}, complete
      ? h("span.map-location", {}, `✕${VS} ${CONFIG.TREASURE_LOCATION || "O segredo aínda non foi escrito."}`)
      : `Anacos: ${count} / ${total}`));
}
