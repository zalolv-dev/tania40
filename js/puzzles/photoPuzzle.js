// Puzle fotográfico 3×3: tocar unha peza, tocar outra, intercámbianse.
// A foto cárgase dinamicamente: calquera puzzle.jpg serve (horizontal, vertical ou cadrada).
import { h } from "../ui.js?v=20261114231458";
import * as audio from "../audio.js?v=20261114231458";

const N = 3;

function shuffled() {
  const total = N * N;
  let order;
  do {
    order = Array.from({ length: total }, (_, i) => i);
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  } while (order.filter((v, i) => v === i).length > 2);
  return order;
}

export const isSolved = (order) => order.every((value, index) => value === index);

/**
 * opts: { src, version, pst, save, onSolved, onMove, onError }
 * pst.photoPuzzle = { imageVersion, order, moves, solved }
 */
export function createPhotoPuzzle(opts) {
  const wrap = h("div.photo-puzzle", {}, h("div.photo-loading", {}, "Cargando lembranza…"));
  const img = new Image();
  const url = opts.src + (opts.src.includes("?") ? "&" : "?") + "v=" + opts.version;

  img.onerror = () => {
    console.error(`[tania40] Non se atopou a foto do puzle: ${opts.src}`);
    wrap.innerHTML = "";
    wrap.append(
      h("div.missing-photo", { role: "alert" },
        h("strong", {}, "NON ATOPO A FOTO DO PUZLE"),
        h("p", {}, "O xogo esperaba:"),
        h("code", {}, opts.src))
    );
    opts.onError && opts.onError();
  };

  img.onload = () => {
    const w = img.naturalWidth || 1;
    const hgt = img.naturalHeight || 1;
    const ratio = w / hgt;

    if (!opts.pst.photoPuzzle || opts.pst.photoPuzzle.imageVersion !== opts.version || !Array.isArray(opts.pst.photoPuzzle.order) || opts.pst.photoPuzzle.order.length !== N * N) {
      opts.pst.photoPuzzle = { imageVersion: opts.version, order: shuffled(), moves: 0, solved: false };
      opts.save({ silent: true });
    }
    const ps = opts.pst.photoPuzzle;
    let selected = -1;

    const board = h("div.photo-board", { role: "grid", "aria-label": "Puzle fotográfico de 3 por 3" });
    board.style.setProperty("--ratio", String(ratio));
    board.style.aspectRatio = `${w} / ${hgt}`;
    const counter = h("div.photo-moves", { "aria-live": "polite" });

    const render = () => {
      board.innerHTML = "";
      board.classList.toggle("solved", ps.solved);
      ps.order.forEach((piece, pos) => {
        const col = piece % N;
        const row = Math.floor(piece / N);
        const tile = h("button.photo-tile" + (pos === selected ? ".selected" : "") + (piece === pos ? ".in-place" : ""), {
          type: "button",
          role: "gridcell",
          disabled: ps.solved ? true : null,
          "aria-label": `Peza na posición ${pos + 1}${pos === selected ? ", seleccionada" : ""}`,
          onclick: () => tap(pos),
          style: {
            backgroundImage: `url("${url}")`,
            backgroundSize: `${N * 100}% ${N * 100}%`,
            backgroundPosition: `${(col / (N - 1)) * 100}% ${(row / (N - 1)) * 100}%`
          }
        });
        board.append(tile);
      });
      counter.textContent = ps.solved ? `Resolto en ${ps.moves} movementos.` : `Movementos: ${ps.moves}`;
    };

    const tap = (pos) => {
      if (ps.solved) return;
      if (selected === -1) {
        selected = pos;
        audio.sfx("click");
      } else if (selected === pos) {
        selected = -1;
      } else {
        [ps.order[selected], ps.order[pos]] = [ps.order[pos], ps.order[selected]];
        ps.moves++;
        selected = -1;
        audio.sfx("item");
        if (isSolved(ps.order)) ps.solved = true;
        opts.save(); // gárdase despois de CADA movemento
        opts.onMove && opts.onMove(ps);
      }
      render();
      if (ps.solved) opts.onSolved && opts.onSolved(ps);
    };

    wrap.innerHTML = "";
    wrap.append(board, counter);
    render();
    opts.onReady && opts.onReady(ps);
  };

  img.src = url;
  return wrap;
}
