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
  // document.getElementById("score").textContent = state.totalScore;
};

init();

const isOdd = (num) => {
  return num % 2;
};

const generateDie = (amount = 1) => {
  const { diceContainer } = elements;
  diceContainer.replaceChildren();
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
    const actionButtonContainer = document.createElement("div");
    actionButtonContainer.classList.add("action-btn-container");

    dieContainer.appendChild(actionButtonContainer);
    diceContainer.appendChild(dieContainer);
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

const handleKeepSetButtonClick = (set, value) => {
  console.log("keep set ", set, value);
  const valueToAdd =
    value === 0 ? calculateBankedValue(set[0].value, set.length) : value;

  set.forEach((s) => {
    moveDice(s);
  });
  addScoreToBank(valueToAdd);
};

const handleKeepSingleButtonClick = (die) => {
  const { value } = die;
  let finalVal = 0;
  switch (value) {
    case 1:
      finalVal = 100;
      break;
    case 5:
      finalVal = 50;
      break;
    default:
      finalVal = 0;
  }
  moveDice(die);
  addScoreToBank(finalVal);
};

const calculateBankedValue = (value, length = 1) => {
  console.log("banked", value);
  let finalVal = 0;
  if (value === 1) {
    finalVal = value * 1000;
  } else {
    finalVal = value * 100;
  }
  finalVal = length > 1 ? checkForMultiplier(finalVal, length) : finalVal;
  console.log("final", finalVal);
  return finalVal;
};

const checkForMultiplier = (val, length) => {
  const offset = length - 2;
  console.log("offset", offset);
  return offset > 0 ? val * offset : val;
};

const checkForSixDiceScore = (set) => {
  if (checkForStraight(set)) {
    return { set, value: 1500 };
  } else if (checkForThreePair(set)) {
    return { set, value: 1000 };
  } else {
    return false;
  }
};

const checkForStraight = (set) => {
  console.log("set", set);
  const input = set.map((s) => s.value);
  const sorted = input.sort((a, b) => {
    return a - b;
  });
  const criteria = [1, 2, 3, 4, 5, 6];
  console.log("sorted", sorted);

  return JSON.stringify(sorted) === JSON.stringify(criteria);
};

const checkForThreePair = (set) => {
  const input = set.map((s) => s.value);
  const sorted = input.sort((a, b) => {
    return a - b;
  });
  return (
    sorted[0] === sorted[1] &&
    sorted[2] === sorted[3] &&
    sorted[4] === sorted[5]
  );
};

const processEndOfTurn = () => {
  updateOverallScore();
  state.turnScore = 0;
  elements.turnScore.textContent = state.turnScore;
  resetBoard();
};

const resetDice = () => {
  clearActionButtons();
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
  //   { dieId: `die-1`, value: 6 },
  //   { dieId: `die-2`, value: 2 },
  //   { dieId: `die-3`, value: 3 },
  //   { dieId: `die-4`, value: 4 },
  //   { dieId: `die-5`, value: 5 },
  //   { dieId: `die-6`, value: 1 },
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
    addActionButtons(scoringDie);

    activateListeners(scoringDie);
  } else {
    processLosingTurn();
  }
};

const evaluateRoll = (roll) => {
  let matchedArray = [];
  const sixDiceCheck = roll.length === 6 ? checkForSixDiceScore(roll) : null;
  if (sixDiceCheck) {
    return { sets: [sixDiceCheck.set], value: sixDiceCheck.value, singles: [] };
  }

  const onesAndFives = roll.filter((r) => r.value === 1 || r.value === 5);

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

  return { sets: matchedArray, singles: onesAndFives };
};

const addActionButtons = (scoringDie) => {
  const { sets, singles } = scoringDie;
  singles.forEach((die) => {
    const { dieId } = die;

    const current = document.getElementById(dieId);
    const buttonContainer = current.querySelector(".action-btn-container");
    const button = document.createElement("button");
    button.classList.add("btn", "single-button");
    button.textContent = "KEEP SINGLE DIE";
    buttonContainer.appendChild(button);
  });
  sets.forEach((set) => {
    set.forEach((s) => {
      const { dieId } = s;

      const current = document.getElementById(dieId);
      const buttonContainer = current.querySelector(".action-btn-container");
      const button = document.createElement("button");
      button.classList.add("btn", "set-button");
      button.textContent = "KEEP SET";
      buttonContainer.appendChild(button);
    });
  });
};

const activateListeners = (scoringDie) => {
  const { singles, sets, value = 0 } = scoringDie;
  singles.length > 0 &&
    singles.forEach((die) => {
      const { dieId } = die;
      const current = document
        .getElementById(dieId)
        .querySelector(".single-button");

      current.addEventListener("click", () => {
        handleKeepSingleButtonClick(die);
      });
    });

  sets.length > 0 &&
    sets.forEach((set, index) => {
      set.forEach((s, i, self) => {
        const { dieId } = s;
        const current = document.getElementById(dieId);
        const button = current.querySelector(".set-button");

        button.addEventListener("click", () => {
          handleKeepSetButtonClick(self, value);
        });
      });
    });
};

const diceAnimateOut = (el) => {
  el.style.transform = "scale(0)";
};

const moveDice = (die) => {
  console.log("moveDice", die);
  const { dieId, value } = die;
  const { bankDice, diceContainer } = elements;
  const el = document.getElementById(dieId);

  diceContainer.removeChild(el);

  const dieForBank = createDieForBank(value);

  bankDice.appendChild(dieForBank);

  diceContainer.childNodes.length === 0 && resetBoard();
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
  const { turnScore, endTurnBtn } = elements;
  state.turnScore += value;
  turnScore.textContent = state.turnScore;

  endTurnBtn.disabled = false;
  endTurnBtn.addEventListener("click", handleEndTurnClick);
};

const updateOverallScore = () => {
  const currentScore = parseInt(window.localStorage.getItem("score"));

  const newScore = currentScore + state.turnScore;

  window.localStorage.setItem("score", newScore);
  state.scoreText = newScore;

  document.getElementById("score").textContent = state.scoreText;
};

const clearActionButtons = () => {
  const buttons = [...document.querySelectorAll(".action-btn-container")];

  buttons.forEach((button) => button.replaceChildren());
};

const resetBoard = () => {
  const { bankDice, endTurnBtn } = elements;
  bankDice.replaceChildren();
  endTurnBtn.disabled = true;
  clearActionButtons();
  generateDie(6);
};

const getNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};
