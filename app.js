// Bible Quiz app shell. Plain JavaScript, no build step, so it runs on
// GitHub Pages as-is and can be wrapped into a phone app later.

const QUESTIONS_PER_QUIZ = 10;

const state = {
  allQuestions: [],
  quiz: [],
  index: 0,
  score: 0,
};

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
    $("results-score").textContent = `${state.score} / ${state.quiz.length}`;
    showScreen("results");
  }
}

$("start-btn").addEventListener("click", startQuiz);
$("next-btn").addEventListener("click", next);
$("home-btn").addEventListener("click", () => showScreen("home"));

loadQuestions().catch(() => alert("Could not load questions."));

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
