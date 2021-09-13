console.log("GAME IS ON");
!window.localStorage.getItem("score") &&
  window.localStorage.setItem("score", 0);

const elements = {
  diceContainer: document.querySelector(".dice-container"),
  bankDice: document.querySelector(".bank-dice"),
  turnScore: document.querySelector(".turn-score"),
  rollBtn: document.getElementById("roll-btn"),
  endTurnBtn: document.getElementById("end-turn-btn"),
  scoreText: document.getElementById("score"),
  scoreboardContainer: document.querySelector(".scoreboard-container"),
  gameInfoContainer: document.querySelector(".game-info-container"),
  layoutContainer: document.querySelector(".layout-container"),
  modalContainer: document.querySelector(".modal-container"),
  playerNumberInput: document.getElementById("numberOfPlayers"),
  scoreLimitInput: document.getElementById("scoreLimit"),
};
const state = {
  turnScore: 0,
  currentPlayer: 1,

  scoreLimit: 10000,
  winningScoreReached: false,
  winningPlayer: 1,
};

const generateScoreboard = (players = 1) => {
  const { scoreboardContainer, gameInfoContainer } = elements;

  for (let i = 0; i < players; i++) {
    const player = document.createElement("div");
    player.classList.add("player-score-container");
    player.setAttribute("id", `player-${i + 1}`);

    const playerName = document.createElement("span");
    playerName.classList.add("player-name");
    playerName.textContent = `Player ${i + 1}`;

    const score = document.createElement("span");
    score.textContent = 0;

    score.classList.add("player-score");

    player.appendChild(playerName);
    player.appendChild(score);
    scoreboardContainer.appendChild(player);
  }

  gameInfoContainer.querySelector(".current-player").textContent = document
    .getElementById(`player-${state.currentPlayer}`)
    .querySelector(".player-name").textContent;
};

const init = () => {
  // document.getElementById("score").textContent = state.totalScore;
  generateScoreboard(localStorage.getItem("players"));
};

const activateModal = () => {
  const { layoutContainer } = elements;

  layoutContainer.style.display = "none";
};

const startNewGame = () => {
  const {
    playerNumberInput,
    scoreLimitInput,
    layoutContainer,
    modalContainer,
  } = elements;

  if (
    validateInput(playerNumberInput.value, 1, 4) &&
    validateInput(scoreLimitInput.value, 50, 10000)
  ) {
    localStorage.setItem("players", playerNumberInput.value);
    localStorage.setItem("limit", scoreLimitInput.value);

    modalContainer.style.display = "none";
    layoutContainer.style.display = "grid";
    init();
  } else {
    console.log("BAD INPUT");
  }
};

const validateInput = (input, min, max) => {
  if (input < min || input > max) {
    alert(`Please enter a value between ${min} and ${max}`);
    return false;
  } else {
    return true;
  }
};

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
  processEndOfTurn();
};

const handleKeepSetButtonClick = (set, value) => {
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
  let finalVal = 0;
  if (value === 1) {
    finalVal = value * 1000;
  } else {
    finalVal = value * 100;
  }
  finalVal = length > 1 ? checkForMultiplier(finalVal, length) : finalVal;

  return finalVal;
};

const checkForMultiplier = (val, length) => {
  const offset = length - 2;

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
  const input = set.map((s) => s.value);
  const sorted = input.sort((a, b) => {
    return a - b;
  });
  const criteria = [1, 2, 3, 4, 5, 6];

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

const advanceCurrentPlayer = () => {
  const { gameInfoContainer } = elements;

  if (state.currentPlayer === parseInt(localStorage.getItem("players"))) {
    state.currentPlayer = 1;
  } else {
    state.currentPlayer = state.currentPlayer + 1;
  }

  gameInfoContainer.querySelector(".current-player").textContent = document
    .getElementById(`player-${state.currentPlayer}`)
    .querySelector(".player-name").textContent;
};

const processEndOfTurn = () => {
  const { turnScore } = elements;

  updateOverallScore();

  state.turnScore = 0;

  turnScore.textContent = state.turnScore;

  advanceCurrentPlayer();

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

const getNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const processLosingTurn = () => {
  alert("NO SCORE, END OF TURN");
  state.turnScore = 0;
  elements.turnScore.textContent = state.turnScore;
  advanceCurrentPlayer();
  resetBoard();
};

const prepareForInput = (result) => {
  const scoringDie = evaluateRoll(result);

  if (scoringDie.sets.length > 0 || scoringDie.singles.length > 0) {
    elements.rollBtn.disabled = true;
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
    button.textContent = "KEEP ONE";
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
  const { dieId, value } = die;
  const { bankDice, diceContainer, rollBtn } = elements;
  const el = document.getElementById(dieId);

  diceContainer.removeChild(el);

  const dieForBank = createDieForBank(value);

  bankDice.appendChild(dieForBank);
  rollBtn.disabled = false;
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
  const currentPlayer = `player-${state.currentPlayer}`;
  const scoreDisplay = document
    .getElementById(currentPlayer)
    .querySelector(".player-score");

  scoreDisplay.textContent =
    parseInt(scoreDisplay.textContent) + state.turnScore;
};

const clearActionButtons = () => {
  const buttons = [...document.querySelectorAll(".action-btn-container")];

  buttons.forEach((button) => button.replaceChildren());
};

const resetBoard = () => {
  const { bankDice, endTurnBtn, gameInfoContainer } = elements;

  bankDice.replaceChildren();
  endTurnBtn.disabled = true;
  clearActionButtons();
  generateDie(6);
};

const checkForWin = (score) => {
  const { scoreLimit } = state;
};
