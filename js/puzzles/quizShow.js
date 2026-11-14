// Concurso de preguntas con vidas. Unha resposta errada custa unha vida e a
// pregunta volve ao final da cola. Sen vidas, o concurso comeza de novo.
import { h } from "../ui.js";
import * as audio from "../audio.js";

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * opts: { questions: [{ q, options, answer }], lives, pst, save, status (elemento), say(lines),
 *         texts: { right: [], wrong: [], gameOver: [] }, onWin() }
 * pst.quiz = { queue: [índices], correct, lives }
 */
export function createQuiz(opts) {
  const total = opts.questions.length;
  const lives = opts.lives || 3;
  const fresh = () => ({ queue: shuffle([...Array(total).keys()]), correct: 0, lives });
  if (!opts.pst.quiz || !Array.isArray(opts.pst.quiz.queue)) {
    opts.pst.quiz = fresh();
    opts.save({ silent: true });
  }
  const st = opts.pst.quiz;
  const el = h("div.quiz");
  let busy = false;
  let rightIdx = 0, wrongIdx = 0;

  const renderStatus = () => {
    if (!opts.status) return;
    opts.status.innerHTML = "";
    opts.status.append(
      h("div.quiz-lives", { "aria-label": `Vidas: ${st.lives}` }, "♥".repeat(st.lives) + "♡".repeat(lives - st.lives)),
      h("div.quiz-progress", {}, `${st.correct} / ${total}`)
    );
  };

  function render() {
    renderStatus();
    el.innerHTML = "";
    if (st.correct >= total) return;
    const q = opts.questions[st.queue[0]];
    el.append(h("div.quiz-q", {}, `PREGUNTA ${st.correct + 1}: ${q.q}`));
    const grid = h("div.quiz-options");
    q.options.forEach((opt) =>
      grid.append(h("button.btn.quiz-opt", { type: "button", onclick: (e) => answer(opt, e.currentTarget) }, opt))
    );
    el.append(grid);
  }

  function answer(opt, button) {
    if (busy) return;
    busy = true;
    const q = opts.questions[st.queue[0]];
    const ok = opt === q.answer;
    button.classList.add(ok ? "right" : "wrong");
    if (ok) {
      audio.sfx("item");
      st.queue.shift();
      st.correct++;
      opts.say([opts.texts.right[rightIdx++ % opts.texts.right.length]]);
    } else {
      audio.sfx("error");
      st.queue.push(st.queue.shift());
      st.lives--;
      opts.say([opts.texts.wrong[wrongIdx++ % opts.texts.wrong.length]]);
    }
    if (st.lives <= 0) {
      Object.assign(st, fresh());
      opts.say(opts.texts.gameOver);
      opts.onGameOver && opts.onGameOver();
    }
    opts.save();
    setTimeout(() => {
      busy = false;
      if (st.correct >= total) {
        renderStatus();
        el.innerHTML = "";
        opts.onWin && opts.onWin();
      } else render();
    }, 700);
  }

  render();
  return { el, done: () => st.correct >= total };
}
