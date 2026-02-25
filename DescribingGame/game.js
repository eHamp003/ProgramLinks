// Noun list (your exact targets)
const NOUNS = [
  "apple","banana","orange","cookie","cracker",
  "cup","spoon","fork","plate","bottle",
  "ball","car","truck","bus","train","airplane",
  "shoes","socks","pants","shirt","hat","jacket","glasses",
  "book","pencil","crayon","phone",
  "chair","bed","door"
];

const IMG_DIR = "assets/nouns";
const EXEMPLARS_PER_NOUN = 3;

const els = {
  grid: document.getElementById("grid"),
  promptText: document.getElementById("promptText"),
  targetPreview: document.getElementById("targetPreview"),
  feedback: document.getElementById("feedback"),
  arraySize: document.getElementById("arraySize"),
  mode: document.getElementById("mode"),
  newRoundBtn: document.getElementById("newRoundBtn"),
  resetBtn: document.getElementById("resetBtn"),
  trials: document.getElementById("trials"),
  correct: document.getElementById("correct"),
  incorrect: document.getElementById("incorrect"),
  accuracy: document.getElementById("accuracy"),
  logList: document.getElementById("logList"),
};

let state = {
  currentTargetNoun: null,
  currentTargetImg: null,
  options: [], // {noun, img}
  locked: false,
  data: {
    trials: 0,
    correct: 0,
    incorrect: 0,
    log: []
  }
};

function randInt(min, maxInclusive) {
  return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}

function sampleOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nounToImage(noun) {
  const idx = randInt(1, EXEMPLARS_PER_NOUN);
  return `${IMG_DIR}/${noun}_${idx}.png`;
}

function pickUniqueNouns(count, targetNoun = null) {
  const pool = [...NOUNS];
  let chosen = [];

  if (targetNoun) {
    chosen.push(targetNoun);
    const ti = pool.indexOf(targetNoun);
    if (ti >= 0) pool.splice(ti, 1);
  }

  while (chosen.length < count && pool.length > 0) {
    const n = sampleOne(pool);
    chosen.push(n);
    pool.splice(pool.indexOf(n), 1);
  }

  return chosen;
}

function setPrompt(targetNoun) {
  const mode = els.mode.value;
  if (mode === "receptive") {
    els.promptText.textContent = `Find the ${targetNoun}.`;
    els.targetPreview.textContent = `Therapist note: learner selects picture of "${targetNoun}".`;
  } else {
    els.promptText.textContent = `What is it?`;
    els.targetPreview.textContent = `Therapist note: correct label is "${targetNoun}".`;
  }
}

function renderOptions() {
  els.grid.innerHTML = "";

  // Make grid columns adapt to array size (nice for 6/8)
  const size = Number(els.arraySize.value);
  const cols = size <= 4 ? 4 : (size === 6 ? 3 : 4);
  els.grid.style.gridTemplateColumns = `repeat(${cols}, minmax(140px, 1fr))`;

  state.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.type = "button";
    btn.dataset.noun = opt.noun;
    btn.dataset.idx = String(idx);

    const img = document.createElement("img");
    img.alt = opt.noun;
    img.src = opt.img;

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = opt.noun;

    btn.appendChild(img);
    btn.appendChild(label);

    btn.addEventListener("click", () => onSelect(opt.noun, btn));
    els.grid.appendChild(btn);
  });
}

function updateDataUI() {
  const { trials, correct, incorrect } = state.data;
  els.trials.textContent = String(trials);
  els.correct.textContent = String(correct);
  els.incorrect.textContent = String(incorrect);

  const acc = trials === 0 ? 0 : Math.round((correct / trials) * 100);
  els.accuracy.textContent = `${acc}%`;
}

function addLogEntry(entry) {
  state.data.log.push(entry);

  const li = document.createElement("li");
  li.textContent = entry;
  els.logList.appendChild(li);
}

function clearFeedback() {
  els.feedback.textContent = "";
  els.feedback.style.color = "";
}

function setFeedback(text, kind) {
  els.feedback.textContent = text;
  els.feedback.style.color = (kind === "good") ? "var(--good)" : "var(--bad)";
}

function lockOptions(lock) {
  state.locked = lock;
  [...els.grid.querySelectorAll("button.option")].forEach(b => (b.disabled = lock));
}

function markCorrectButton() {
  const buttons = [...els.grid.querySelectorAll("button.option")];
  for (const b of buttons) {
    if (b.dataset.noun === state.currentTargetNoun) {
      b.classList.add("correct");
      break;
    }
  }
}

function onSelect(chosenNoun, btnEl) {
  if (state.locked) return;

  const target = state.currentTargetNoun;
  state.data.trials += 1;

  if (chosenNoun === target) {
    state.data.correct += 1;
    btnEl.classList.add("correct");
    setFeedback("✅ Correct!", "good");
    addLogEntry(`✅ Correct — Target: ${target} | Chosen: ${chosenNoun}`);
    updateDataUI();

    lockOptions(true);
    // Auto-advance after a short delay
    setTimeout(() => newRound(), 650);
  } else {
    state.data.incorrect += 1;
    btnEl.classList.add("wrong");
    setFeedback("❌ Try again.", "bad");
    addLogEntry(`❌ Incorrect — Target: ${target} | Chosen: ${chosenNoun}`);
    updateDataUI();

    // Error correction: show correct answer briefly, then repeat SAME round (no advance)
    lockOptions(true);
    markCorrectButton();
    setTimeout(() => {
      lockOptions(false);
      clearFeedback();
      // remove wrong/correct highlights but keep the same target/options
      [...els.grid.querySelectorAll("button.option")].forEach(b => b.classList.remove("wrong","correct"));
    }, 900);
  }
}

function newRound() {
  clearFeedback();
  lockOptions(false);

  const size = Number(els.arraySize.value);

  // Pick a target noun and build the array (target + distractors)
  const targetNoun = sampleOne(NOUNS);
  const nouns = pickUniqueNouns(size, targetNoun);

  const options = nouns.map(noun => ({
    noun,
    img: nounToImage(noun)
  }));

  state.currentTargetNoun = targetNoun;
  state.currentTargetImg = options.find(o => o.noun === targetNoun)?.img ?? nounToImage(targetNoun);
  state.options = shuffle(options);

  setPrompt(targetNoun);
  renderOptions();
}

function resetData() {
  state.data = { trials: 0, correct: 0, incorrect: 0, log: [] };
  els.logList.innerHTML = "";
  updateDataUI();
  clearFeedback();
}

els.newRoundBtn.addEventListener("click", newRound);
els.resetBtn.addEventListener("click", resetData);
els.arraySize.addEventListener("change", newRound);
els.mode.addEventListener("change", newRound);

// Start
resetData();
newRound();
