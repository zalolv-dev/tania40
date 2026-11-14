// A REFORMA: puzle tipo "luces fóra" 3×3.
// Arranxar unha peza cambia tamén as do lado (coma nunha obra de verdade).
import { h, btn } from "../ui.js";
import * as audio from "../audio.js";

const N = 3;
const neighbours = (i) => {
  const r = Math.floor(i / N), c = i % N;
  const out = [i];
  if (r > 0) out.push(i - N);
  if (r < N - 1) out.push(i + N);
  if (c > 0) out.push(i - 1);
  if (c < N - 1) out.push(i + 1);
  return out;
};
const toggle = (grid, i) => neighbours(i).forEach((j) => (grid[j] = !grid[j]));

// Parte do estado resolto e aplica toques aleatorios: sempre ten solución.
function scrambled() {
  let grid;
  do {
    grid = new Array(N * N).fill(true);
    const taps = new Set();
    while (taps.size < 4) taps.add(Math.floor(Math.random() * N * N));
    taps.forEach((i) => toggle(grid, i));
  } while (grid.every(Boolean));
  return grid;
}

const LABELS = ["Tellado esquerdo", "Tellado central", "Tellado dereito", "Fiestra esquerda", "Porta de entrada", "Fiestra dereita", "Cociña", "Salón", "Baño"];

/**
 * opts: { pst, save, onSolved }
 * pst.reform = { initial: [...], grid: [...], moves }   (true = arranxado)
 */
export function createReform(opts) {
  if (!opts.pst.reform || !Array.isArray(opts.pst.reform.grid)) {
    const g = scrambled();
    opts.pst.reform = { initial: g.slice(), grid: g.slice(), moves: 0 };
    opts.save({ silent: true });
  }
  const st = opts.pst.reform;
  const board = h("div.reform-grid", { role: "grid", "aria-label": "A casa en obras, 3 por 3" });
  const counter = h("div.photo-moves", { "aria-live": "polite" });
  const resetBtn = btn("VOLVER A EMPEZAR A OBRA", () => {
    st.grid = st.initial.slice();
    st.moves = 0;
    opts.save();
    render();
  }, "small");

  const solved = () => st.grid.every(Boolean);

  function render() {
    board.innerHTML = "";
    st.grid.forEach((ok, i) => {
      board.append(h("button.reform-tile" + (ok ? ".fixed" : ".broken"), {
        type: "button",
        role: "gridcell",
        disabled: solved() ? true : null,
        "aria-label": `${LABELS[i]}: ${ok ? "arranxado" : "en obras"}`,
        onclick: () => tap(i)
      }, h("span.reform-icon", { "aria-hidden": "true" })));
    });
    counter.textContent = solved() ? `Obra rematada en ${st.moves} movementos.` : `Pezas arranxadas: ${st.grid.filter(Boolean).length}/9 · Movementos: ${st.moves}`;
    resetBtn.hidden = solved();
  }

  function tap(i) {
    if (solved()) return;
    toggle(st.grid, i);
    st.moves++;
    audio.sfx(st.grid[i] ? "item" : "click");
    opts.save();
    render();
    if (solved()) {
      board.classList.add("done");
      opts.onSolved && opts.onSolved();
    }
    opts.onMove && opts.onMove(st);
  }

  render();
  if (solved()) board.classList.add("done");
  return { el: h("div.reform", {}, h("div.reform-roof", { "aria-hidden": "true" }), board, counter, resetBtn), solved };
}
