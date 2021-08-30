console.log("GAME IS ON");

const elements = {
  diceContainer: document.querySelector(".dice-container"),
  bankDice: document.querySelector(".bank-dice"),
  bankScore: document.querySelector(".bank-score"),
};
const state = {
  bankScore: 0,
};

const isOdd = (num) => {
  return num % 2;
};

const generateDie = (amount = 1) => {
  elements.diceContainer.replaceChildren();
  for (let i = 0; i < amount; i++) {
    const dieContainer = document.createElement("div");
    dieContainer.classList.add("single-die-container");
    dieContainer.setAttribute("id", `die-${i + 1}`);

    const outerList = document.createElement("ol");

    outerList.classList.add(
      "single-die",
      `${isOdd(i) ? "odd-roll" : "even-roll"}`
    );
    outerList.dataset.roll = "1";
    dieContainer.appendChild(outerList);

    for (let j = 0; j < 6; j++) {
      const side = document.createElement("li");
      side.classList.add("die-side");
      side.dataset.side = j + 1;
      outerList.appendChild(side);
      for (let k = 0; k <= j; k++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        side.appendChild(dot);
      }
    }

    elements.diceContainer.appendChild(dieContainer);
  }
};

generateDie(6);

const handleRollClick = () => {
  resetDice();
  const activeDice = [...document.getElementsByTagName("ol")];

  const result = rollDice(activeDice);

  prepareForInput(result);
};

const resetDice = () => {
  const containers = [...document.querySelectorAll(".single-die-container")];

  containers.forEach((c) => {
    c.style.borderBottom = "none";
  });

  containers.forEach((a, index) => {
    a.setAttribute("id", `die-${index + 1}`);
  });
};

const rollDice = (dice) => {
  return dice.map((die, index) => {
    die.classList.toggle("even-roll");
    die.classList.toggle("odd-roll");

    const num = getNumber(1, 6);

    die.dataset.roll = num;

    return { dieId: `die-${index + 1}`, value: num };
  });
};

const processLosingTurn = () => {
  state.bankScore = 0;
  elements.bankScore.innerHTML = state.bankScore;
  resetBoard();
};

const prepareForInput = (result) => {
  const scoringDie = evaluateRoll(result);

  if (scoringDie.length > 0) {
    highlightScoringDice(scoringDie);

    activateListeners(scoringDie);
  } else {
    processLosingTurn();
  }
};

const evaluateRoll = (roll) => {
  return roll.filter((r, index) => r.value === 1 || r.value === 5);
};

const highlightScoringDice = (scoringDie) => {
  scoringDie.forEach((die) => {
    const { dieId } = die;

    const current = document.getElementById(dieId);

    current.style.borderBottom = "2px solid green";
  });
};

const activateListeners = (scoringDie) => {
  scoringDie.forEach((die) => {
    const { dieId } = die;
    const current = document.getElementById(dieId);

    current.addEventListener("click", () => {
      diceAnimateOut(current);
      moveDice(die);
    });
  });
};

const diceAnimateOut = (el) => {
  el.style.transform = "scale(0)";
};

const moveDice = (die) => {
  const { dieId, value } = die;
  const el = document.getElementById(dieId);

  elements.diceContainer.removeChild(el);

  const dieForBank = createDieForBank(value);
  addScoreToBank(value);
  elements.bankDice.appendChild(dieForBank);

  elements.diceContainer.childNodes.length === 0 && resetBoard();
};

const createDieForBank = (value) => {
  const dieForBank = document.createElement("div");
  dieForBank.classList.add("die-side");

  dieForBank.dataset.side = value;

  for (let i = 0; i < value; i++) {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    dieForBank.appendChild(dot);
  }

  return dieForBank;
};

const addScoreToBank = (value) => {
  let score = 0;
  switch (value) {
    case 1:
      {
        score = 100;
      }
      break;
    case 5:
      {
        score = 50;
      }
      break;
    default: {
      score = 0;
    }
  }

  state.bankScore += score;
  elements.bankScore.innerHTML = state.bankScore;
};

const resetBoard = () => {
  elements.bankDice.replaceChildren();
  generateDie(6);
};

const getNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};
