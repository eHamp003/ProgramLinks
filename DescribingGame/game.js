const IMG_DIR = "./assets/nouns";
const EXEMPLARS = 3;

const NOUNS = [
  "apple","banana","orange","cookie","cracker",
  "cup","spoon","fork","plate","bottle",
  "ball","car","truck","bus","train","airplane",
  "shoes","socks","pants","shirt","hat","jacket","glasses",
  "book","pencil","crayon","phone",
  "chair","bed","door"
];

const grid = document.getElementById("grid");
const prompt = document.getElementById("prompt");
const feedback = document.getElementById("feedback");
const arraySizeSelect = document.getElementById("arraySize");
const newRoundBtn = document.getElementById("newRound");

let currentTarget = null;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function getRandomImage(noun) {
  const num = randomInt(1, EXEMPLARS);
  return `${IMG_DIR}/${noun}_${num}.png`;
}

function newRound() {
  feedback.textContent = "";

  const arraySize = parseInt(arraySizeSelect.value);
  const target = NOUNS[randomInt(0, NOUNS.length - 1)];
  currentTarget = target;

  prompt.textContent = `Find the ${target}.`;

  let options = [target];

  while (options.length < arraySize) {
    const randomNoun = NOUNS[randomInt(0, NOUNS.length - 1)];
    if (!options.includes(randomNoun)) {
      options.push(randomNoun);
    }
  }

  options = shuffle(options);
  renderOptions(options);
}

function renderOptions(options) {
  grid.innerHTML = "";

  options.forEach(noun => {
    const button = document.createElement("button");
    button.className = "option";

    const img = document.createElement("img");
    img.src = getRandomImage(noun);
    img.alt = noun;

    // IMAGE ERROR HANDLER
    img.onerror = function() {
      console.error("Missing image:", img.src);
      img.style.background = "#ddd";
    };

    button.appendChild(img);

    button.addEventListener("click", () => checkAnswer(noun));
    grid.appendChild(button);
  });
}

function checkAnswer(selected) {
  if (selected === currentTarget) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
    setTimeout(newRound, 800);
  } else {
    feedback.textContent = "❌ Try again.";
    feedback.style.color = "red";
  }
}

newRoundBtn.addEventListener("click", newRound);
arraySizeSelect.addEventListener("change", newRound);

newRound();
