// Tableiro xenérico de fichas: tocar ficha → tocar oco. Sen arrastrar.
// Úsano o arquivo familiar (fase 8), as palabras das Maldivas (fase 3)
// e a liña temporal (fase 9).
import { h, btn } from "../ui.js?v=20261114231458";
import * as audio from "../audio.js?v=20261114231458";

/**
 * opts:
 *  groups:   [{ label, slots: [{ id, hint }], sep }]
 *  tokens:   [{ id, label }]
 *  placement: obxecto persistente { slotId: tokenId }
 *  save():   gardar estado
 *  onChange(placement)
 *  locked:   bool
 *  layout:   "rows" | "column"
 */
export function createTokenBoard(opts) {
  const root = h("div.token-board" + (opts.layout === "column" ? ".column" : ""));
  const live = h("div.sr-only", { "aria-live": "polite" });
  let selected = null; // tokenId
  const tokenById = Object.fromEntries(opts.tokens.map((t) => [t.id, t]));

  const slotOf = (tokenId) => Object.keys(opts.placement).find((s) => opts.placement[s] === tokenId);

  function place(tokenId, slotId) {
    const from = slotOf(tokenId);
    const occupant = opts.placement[slotId];
    if (from) delete opts.placement[from];
    if (occupant && occupant !== tokenId && from) opts.placement[from] = occupant;
    opts.placement[slotId] = tokenId;
    live.textContent = `${tokenById[tokenId].label} colocado.`;
    audio.sfx("item");
    commit();
  }

  function toPool(tokenId) {
    const from = slotOf(tokenId);
    if (from) delete opts.placement[from];
    live.textContent = `${tokenById[tokenId].label} devolto á bandexa.`;
    commit();
  }

  function commit() {
    selected = null;
    opts.save();
    render();
    opts.onChange && opts.onChange(opts.placement);
  }

  function tapSlot(slotId) {
    if (opts.locked) return;
    const occupant = opts.placement[slotId];
    if (selected) {
      if (selected === occupant) {
        selected = null;
        render();
      } else place(selected, slotId);
    } else if (occupant) {
      selected = occupant;
      audio.sfx("click");
      render();
    }
  }

  function tapToken(tokenId) {
    if (opts.locked) return;
    selected = selected === tokenId ? null : tokenId;
    audio.sfx("click");
    render();
  }

  function render() {
    root.innerHTML = "";
    const files = h("div.token-groups");
    opts.groups.forEach((g) => {
      const row = h("div.token-group");
      if (g.label) row.append(h("div.token-group-label", {}, g.label));
      const slotsRow = h("div.token-slots");
      g.slots.forEach((s, i) => {
        if (i > 0 && g.sep) slotsRow.append(h("span.token-sep", { "aria-hidden": "true" }, g.sep));
        const tid = opts.placement[s.id];
        const t = tid ? tokenById[tid] : null;
        slotsRow.append(
          h("button.token-slot" + (t ? ".filled" : "") + (tid && tid === selected ? ".selected" : "") + (selected && !t ? ".target" : ""), {
            type: "button",
            disabled: opts.locked ? true : null,
            "aria-label": `${g.label ? g.label + ", " : ""}oco ${i + 1}${s.hint ? " (" + s.hint + ")" : ""}: ${t ? t.label : "baleiro"}`,
            onclick: () => tapSlot(s.id)
          }, t ? t.label : s.hint || "??")
        );
      });
      row.append(slotsRow);
      files.append(row);
    });
    root.append(files);

    const pool = h("div.token-pool", { role: "group", "aria-label": "Fichas dispoñibles" });
    const free = opts.tokens.filter((t) => !slotOf(t.id));
    free.forEach((t) =>
      pool.append(
        h("button.token" + (selected === t.id ? ".selected" : ""), {
          type: "button",
          disabled: opts.locked ? true : null,
          "aria-pressed": selected === t.id ? "true" : "false",
          onclick: () => tapToken(t.id)
        }, t.label)
      )
    );
    if (!free.length) pool.append(h("span.token-pool-empty", {}, "Todas as fichas están colocadas."));
    root.append(pool);

    if (selected && slotOf(selected) && !opts.locked) {
      root.append(btn("DEVOLVER Á BANDEXA", () => toPool(selected), "small"));
    }
    root.append(live);
  }

  render();
  return {
    el: root,
    lock() {
      opts.locked = true;
      render();
    },
    refresh: render
  };
}

// Comproba que cada oco ten a ficha coa etiqueta esperada.
export function placementMatches(placement, tokens, expected) {
  const label = (tid) => (tokens.find((t) => t.id === tid) || {}).label;
  return Object.entries(expected).every(([slot, lab]) => label(placement[slot]) === lab);
}
