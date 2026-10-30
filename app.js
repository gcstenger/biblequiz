// Bible Quiz app shell. Plain JavaScript, no build step, so it runs on
// GitHub Pages as-is and can be wrapped into a phone app later.

const QUESTIONS_PER_QUIZ = 10;
const STORAGE_KEY = "biblequiz.scores.v1";

const LABELS = {
  OT: "Old Testament", NT: "New Testament", ALL: "Both Testaments",
  easy: "Easy", medium: "Medium", hard: "Hard",
};

const state = {
  allQuestions: [],
  quiz: [],
  index: 0,
  score: 0,
  player: "",
  category: "",
};

// Scores are saved on this device only:
// { lastPlayer, players: { name: { quizzes, correct, answered, best: { "OT-easy": 8 } } } }
function loadScores() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.players) return saved;
  } catch {}
  return { lastPlayer: "", players: {} };
}

function saveScores(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {}
}

const scores = loadScores();

const $ = (id) => document.getElementById(id);

function showScreen(name) {
  for (const s of document.querySelectorAll(".screen")) {
    s.hidden = s.id !== `screen-${name}`;
  }
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function loadQuestions() {
  const res = await fetch("data/questions.json");
  state.allQuestions = await res.json();
}

function cell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function renderHome() {
  const names = Object.keys(scores.players).sort();
  const input = $("player-name");
  if (!input.value) input.value = scores.lastPlayer;

  const chips = $("player-chips");
  chips.replaceChildren();
  for (const name of names) {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.classList.toggle("active", name === input.value.trim());
    btn.addEventListener("click", () => {
      input.value = name;
      renderHome();
    });
    chips.append(btn);
  }

  const rows = $("family-rows");
  rows.replaceChildren();
  for (const name of names) {
    const p = scores.players[name];
    const pct = p.answered ? Math.round((100 * p.correct) / p.answered) : 0;
    const tr = document.createElement("tr");
    tr.append(cell(name), cell(p.quizzes), cell(`${pct}%`));
    rows.append(tr);
  }
  $("family-board").hidden = names.length === 0;
  showScreen("home");
}

function recordResult() {
  const name = state.player;
  const p = (scores.players[name] ||= { quizzes: 0, correct: 0, answered: 0, best: {} });
  const previousBest = p.best[state.category];
  p.quizzes++;
  p.correct += state.score;
  p.answered += state.quiz.length;
  if (previousBest === undefined || state.score > previousBest) p.best[state.category] = state.score;
  scores.lastPlayer = name;
  saveScores(scores);
  return previousBest !== undefined && state.score > previousBest;
}

function renderResults(isNewBest) {
  const total = state.quiz.length;
  $("results-score").textContent = `${state.player}: ${state.score} / ${total}`;
  $("results-best").textContent = isNewBest ? "New personal best!" : "";

  const [testament, level] = state.category.split("-");
  $("board-title").textContent = `Best scores: ${LABELS[testament]}, ${LABELS[level]}`;
  const ranked = Object.entries(scores.players)
    .filter(([, p]) => p.best[state.category] !== undefined)
    .sort((a, b) => b[1].best[state.category] - a[1].best[state.category]);
  const rows = $("board-rows");
  rows.replaceChildren();
  for (const [name, p] of ranked) {
    const tr = document.createElement("tr");
    tr.append(cell(name), cell(`${p.best[state.category]} / ${total}`));
    rows.append(tr);
  }
  showScreen("results");
}

function startQuiz() {
  const testament = document.querySelector('input[name="testament"]:checked').value;
  const level = document.querySelector('input[name="level"]:checked').value;
  const pool = state.allQuestions.filter(
    (q) => q.level === level && (testament === "ALL" || q.testament === testament)
  );
  if (pool.length === 0) {
    alert("No questions for that choice yet.");
    return;
  }
  state.player = $("player-name").value.trim() || "Player";
  state.category = `${testament}-${level}`;
  state.quiz = shuffle(pool).slice(0, QUESTIONS_PER_QUIZ);
  state.index = 0;
  state.score = 0;
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const q = state.quiz[state.index];
  $("quiz-progress").textContent =
    `Question ${state.index + 1} of ${state.quiz.length} · Score ${state.score}`;
  $("question-text").textContent = q.question;
  $("feedback").hidden = true;

  const answers = $("answers");
  answers.replaceChildren();
  // Shuffle the choices but remember which one is correct.
  const choices = shuffle(q.choices.map((text, i) => ({ text, correct: i === q.answer })));
  for (const choice of choices) {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.dataset.correct = choice.correct;
    btn.addEventListener("click", () => answer(btn, choice.correct));
    answers.append(btn);
  }
}

function answer(picked, isCorrect) {
  const q = state.quiz[state.index];
  for (const btn of $("answers").children) {
    btn.disabled = true;
    if (btn.dataset.correct === "true") btn.classList.add("correct");
  }
  if (isCorrect) {
    state.score++;
  } else {
    picked.classList.add("wrong");
  }

  const result = $("feedback-result");
  result.textContent = isCorrect ? "Correct!" : "Not quite.";
  result.className = `result ${isCorrect ? "correct" : "wrong"}`;
  $("feedback-verse").textContent = q.verse;
  $("feedback-ref").textContent = `${q.reference} (NKJV)`;
  $("feedback-explanation").textContent = q.explanation;
  $("feedback").hidden = false;
  $("quiz-progress").textContent =
    `Question ${state.index + 1} of ${state.quiz.length} · Score ${state.score}`;
  $("next-btn").focus();
}

function next() {
  state.index++;
  if (state.index < state.quiz.length) {
    renderQuestion();
  } else {
    renderResults(recordResult());
  }
}

$("start-btn").addEventListener("click", startQuiz);
$("next-btn").addEventListener("click", next);
$("home-btn").addEventListener("click", renderHome);
$("player-name").addEventListener("input", () => {
  for (const btn of $("player-chips").children) {
    btn.classList.toggle("active", btn.textContent === $("player-name").value.trim());
  }
});

renderHome();

loadQuestions().catch(() => alert("Could not load questions."));

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
