// O ARQUIVO FAMILIAR: primeira parte (datas) co tableiro de fichas.
import { createTokenBoard, placementMatches } from "./tokenBoard.js?v=20261114231458";

/**
 * opts: { content (FAMILY de phases.js), pst, save, onSolved }
 */
export function createFamilyArchive(opts) {
  const c = opts.content;
  if (!opts.pst.placement) opts.pst.placement = {};
  const tokens = c.tokens.map((label, i) => ({ id: "t" + i, label }));
  const groups = c.children.map((child, ci) => ({
    label: child.name.toUpperCase(),
    sep: "/",
    slots: child.date.map((_, di) => ({ id: `c${ci}d${di}`, hint: di === 2 ? "????" : "??" }))
  }));
  const expected = {};
  c.children.forEach((child, ci) => child.date.forEach((v, di) => (expected[`c${ci}d${di}`] = v)));

  const board = createTokenBoard({
    groups,
    tokens,
    placement: opts.pst.placement,
    save: opts.save,
    locked: !!opts.pst.datesSolved,
    onChange: (pl) => {
      if (placementMatches(pl, tokens, expected)) {
        opts.pst.datesSolved = true;
        opts.save();
        board.lock();
        opts.onSolved && opts.onSolved();
      } else if (Object.keys(expected).every((k) => pl[k])) {
        opts.onWrong && opts.onWrong();
      }
    }
  });
  board.el.classList.add("family-archive");
  return board;
}
