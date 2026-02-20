let passages = {};
let currentText = "";
let timeLeft = 60;
let timer = null;
let started = false;
let errors = 0;
let totalTyped = 0;
let firstTest = !localStorage.getItem("bestScore");

const passageEl = document.getElementById("passage");
const inputEl = document.getElementById("input");
const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("accuracy");
const resultEl = document.getElementById("result");

const difficultyEl = document.getElementById("difficulty");
const timeModeEl = document.getElementById("timeMode");

fetch("data.json")
  .then(r => r.json())
  .then(data => {
    passages = data;
    loadPassage();
  });

function loadPassage() {
  const diff = difficultyEl.value;
  const list = passages[diff];
  currentText = list[Math.floor(Math.random() * list.length)];

  passageEl.innerHTML = currentText
    .split("")
    .map(c => `<span>${c}</span>`)
    .join("");

  inputEl.value = "";
  resetStats();
}

function resetStats() {
  clearInterval(timer);
  started = false;
  errors = 0;
  totalTyped = 0;
  timeLeft = parseInt(timeModeEl.value);
  timeEl.textContent = timeLeft;
  wpmEl.textContent = 0;
  accEl.textContent = 100;
  resultEl.textContent = "";
}

function startTest() {
  if (started) return;
  started = true;

  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) finishTest();
  }, 1000);
}

function finishTest() {
  clearInterval(timer);
  started = false;

  const wpm = parseInt(wpmEl.textContent);
  const best = parseInt(localStorage.getItem("bestScore") || 0);

  if (!best) {
    resultEl.textContent = "🎉 Baseline Established!";
    localStorage.setItem("bestScore", wpm);
  } else if (wpm > best) {
    resultEl.textContent = "🚀 High Score Smashed!";
    localStorage.setItem("bestScore", wpm);
    launchConfetti();
  } else {
    resultEl.textContent = "✅ Test Completed!";
  }
}

inputEl.addEventListener("input", () => {
  if (!started) startTest();

  const chars = passageEl.querySelectorAll("span");
  const typed = inputEl.value.split("");

  errors = 0;

  chars.forEach((char, index) => {
    const typedChar = typed[index];

    if (typedChar == null) {
      char.classList.remove("correct", "incorrect");
    } else if (typedChar === char.textContent) {
      char.classList.add("correct");
      char.classList.remove("incorrect");
    } else {
      char.classList.add("incorrect");
      char.classList.remove("correct");
      errors++;
    }
  });

  totalTyped = typed.length;

  // Accuracy
  const accuracy =
    totalTyped === 0
      ? 100
      : Math.max(0, Math.round(((totalTyped - errors) / totalTyped) * 100));
  accEl.textContent = accuracy;

  // WPM
  const words = (totalTyped - errors) / 5;
  const minutes = (parseInt(timeModeEl.value) - timeLeft) / 60;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
  wpmEl.textContent = wpm;
});

document.getElementById("startBtn").onclick = startTest;
document.getElementById("restartBtn").onclick = loadPassage;
difficultyEl.onchange = loadPassage;
timeModeEl.onchange = loadPassage;

// 🎉 Confetti
function launchConfetti() {
  for (let i = 0; i < 80; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.animationDuration = Math.random() * 3 + 2 + "s";
    document.body.appendChild(conf);

    setTimeout(() => conf.remove(), 4000);
  }
}