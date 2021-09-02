console.log("GAME IS ON");
!window.localStorage.getItem("score") &&
  window.localStorage.setItem("score", 0);

const elements = {
  diceContainer: document.querySelector(".dice-container"),
  bankDice: document.querySelector(".bank-dice"),
  turnScore: document.querySelector(".turn-score"),
  endTurnBtn: document.getElementById("end-turn-btn"),
  scoreText: document.getElementById("score"),
};
const state = {
  turnScore: 0,
  totalScore: window.localStorage.getItem("score"),
  scoreText: 0,
};

const init = () => {
  document.getElementById("score").textContent = state.totalScore;
};

init();

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

const handleEndTurnClick = () => {
  console.log("end turn click");
  processEndOfTurn();
};

const processEndOfTurn = () => {
  updateOverallScore();
  state.turnScore = 0;
  elements.turnScore.textContent = state.turnScore;
  resetBoard();
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
  // return [
  //   { dieId: `die-1`, value: 2 },
  //   { dieId: `die-2`, value: 2 },
  //   { dieId: `die-3`, value: 4 },
  //   { dieId: `die-4`, value: 4 },
  //   { dieId: `die-5`, value: 4 },
  //   { dieId: `die-6`, value: 4 },
  // ];
};

const processLosingTurn = () => {
  alert("NO SCORE, END OF TURN");
  state.turnScore = 0;
  elements.turnScore.textContent = state.turnScore;
  resetBoard();
};

const prepareForInput = (result) => {
  const scoringDie = evaluateRoll(result);
  console.log("scoring", scoringDie);
  if (scoringDie.sets.length > 0 || scoringDie.singles.length > 0) {
    highlightScoringDice(scoringDie);

    activateListeners(scoringDie);
  } else {
    processLosingTurn();
  }
};

const evaluateRoll = (roll) => {
  const onesAndFives = roll.filter((r) => r.value === 1 || r.value === 5);

  let matchedArray = [];
  roll.forEach((r) => {
    const matched = roll.filter((current) => {
      return current.value === r.value;
    });
    if (matched.length > 2) {
      matchedArray.push(matched);
    }
  });

  matchedArray = matchedArray.filter(
    (thing, index, self) =>
      index === self.findIndex((t) => t[0].value === thing[0].value)
  );

  console.log(matchedArray);

  return { sets: matchedArray, singles: onesAndFives };
};

const highlightScoringDice = (scoringDie) => {
  const { sets, singles } = scoringDie;
  singles.forEach((die) => {
    const { dieId } = die;

    const current = document.getElementById(dieId);

    current.style.borderBottom = "2px solid green";
  });
  sets.forEach((set) => {
    set.forEach((s) => {
      const { dieId } = s;

      const current = document.getElementById(dieId);

      current.style.borderTop = "2px solid blue";
    });
  });
};

const activateListeners = (scoringDie) => {
  const { singles, sets } = scoringDie;
  singles.length > 0 &&
    singles.forEach((die) => {
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

  state.turnScore += score;
  elements.turnScore.textContent = state.turnScore;

  elements.endTurnBtn.disabled = false;
  elements.endTurnBtn.addEventListener("click", handleEndTurnClick);
};

const updateOverallScore = () => {
  const currentScore = parseInt(window.localStorage.getItem("score"));

  const newScore = currentScore + state.turnScore;

  window.localStorage.setItem("score", newScore);
  state.scoreText = newScore;

  document.getElementById("score").textContent = state.scoreText;
};

const resetBoard = () => {
  elements.bankDice.replaceChildren();
  elements.endTurnBtn.disabled = true;
  generateDie(6);
};

const getNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};
