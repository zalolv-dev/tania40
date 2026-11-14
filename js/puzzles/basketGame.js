// Minixogo de tiros libres: un indicador vai e vén; toca LANZAR cando estea na zona verde.
import { h, reducedMotion } from "../ui.js?v=20261114231458";
import * as audio from "../audio.js?v=20261114231458";

/**
 * opts: { goal, pst, save, ball (elemento da escena para animar), onScore(n), onMiss(), onDone() }
 * pst.baskets = número de canastras conseguidas
 */
export function createFreeThrows(opts) {
  const goal = opts.goal || 3;
  opts.pst.baskets = opts.pst.baskets || 0;
  const ZONE = { from: 40, to: 60 };
  const period = reducedMotion() ? 3200 : 1700; // ms por ida e volta
  let raf = 0;
  let busy = false;
  const start = performance.now();

  const marker = h("div.meter-marker", { "aria-hidden": "true" });
  const meter = h("div.meter", { "aria-hidden": "true" },
    h("div.meter-zone", { style: { left: ZONE.from + "%", width: ZONE.to - ZONE.from + "%" } }),
    marker);
  const score = h("div.basket-score", { "aria-live": "polite" });
  const shootBtn = h("button.btn.primary.big", { type: "button", onclick: () => shoot() }, "LANZAR");
  const el = h("div.free-throws", {}, score, meter, shootBtn);

  const pos = () => {
    const t = ((performance.now() - start) % period) / period; // 0..1
    return (t < 0.5 ? t * 2 : 2 - t * 2) * 100; // triángulo 0..100..0
  };

  const renderScore = () => {
    score.textContent = `CANASTRAS: ${"●".repeat(opts.pst.baskets)}${"○".repeat(Math.max(0, goal - opts.pst.baskets))}  (${opts.pst.baskets}/${goal})`;
  };

  const loop = () => {
    if (!document.body.contains(el)) return cancelAnimationFrame(raf);
    marker.style.left = pos() + "%";
    raf = requestAnimationFrame(loop);
  };

  async function shoot() {
    if (busy || opts.pst.baskets >= goal) return;
    busy = true;
    // Avalíase onde se VE o indicador (o que Tania ve é o que conta).
    const shown = parseFloat(marker.style.left);
    const p = Number.isFinite(shown) ? shown : pos();
    const inZone = p >= ZONE.from && p <= ZONE.to;
    const ball = opts.ball;
    if (ball) {
      ball.classList.remove("shot-in", "shot-miss");
      void ball.getBoundingClientRect();
      ball.classList.add(inZone ? "shot-in" : "shot-miss");
    }
    audio.sfx("click");
    await new Promise((r) => setTimeout(r, reducedMotion() ? 100 : 800));
    if (inZone) {
      opts.pst.baskets++;
      audio.sfx("item");
      opts.save();
      renderScore();
      opts.onScore && opts.onScore(opts.pst.baskets);
      if (opts.pst.baskets >= goal) {
        cancelAnimationFrame(raf);
        shootBtn.disabled = true;
        opts.onDone && opts.onDone();
      }
    } else {
      audio.sfx("error");
      opts.onMiss && opts.onMiss(p < ZONE.from ? "short" : "long");
    }
    if (ball) setTimeout(() => ball.classList.remove("shot-in", "shot-miss"), 300);
    busy = false;
  }

  renderScore();
  raf = requestAnimationFrame(loop);
  return { el };
}
