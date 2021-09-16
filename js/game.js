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
let state = {
  turnScore: 0,
  currentPlayer: 1,

  winningScoreReached: false,
  winningScore: 0,
  winningPlayer: 1,
  lastTurnTaken: [],
  selectedTotal: 0,
};

const initState = {
  turnScore: 0,
  currentPlayer: 1,

  winningScoreReached: false,
  winningScore: 0,
  winningPlayer: 1,
  lastTurnTaken: [],
  selectedTotal: 0,
};

const generateScoreboard = (players = 1) => {
  const { scoreboardContainer, gameInfoContainer } = elements;

  scoreboardContainer.replaceChildren();

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
  generateScoreboard(localStorage.getItem("players"));
  generateDie(6);
};

const activateModal = () => {
  const { layoutContainer, modalContainer } = elements;

  layoutContainer.style.display = "none";
  modalContainer.style.display = "flex";
};

const startNewGame = () => {
  localStorage.clear();
  document.querySelector(".turn-score").textContent = "";
  document.querySelector(".bank-dice").replaceChildren();
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
    state = { ...initState, lastTurnTaken: [] };

    init();
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
    // const actionButtonContainer = document.createElement("div");
    // actionButtonContainer.classList.add("action-btn-container");

    // dieContainer.appendChild(actionButtonContainer);
    diceContainer.appendChild(dieContainer);
  }
};

const handleRollClick = () => {
  resetDice();
  const activeDice = [...document.getElementsByTagName("ol")];

  const result = rollDice(activeDice);

  animateRoll(result);
};

const animateRoll = (result) => {
  result.forEach((r, index, self) => {
    const { dieId, value } = r;

    const die = document.getElementById(dieId).querySelector(".single-die");

    die.classList.toggle("even-roll");
    die.classList.toggle("odd-roll");

    const oddEven = die.classList.contains("odd-roll") ? "odd" : "even";

    const { x, y, z } = getRotation(value, oddEven);

    const tl = new TimelineMax();

    tl.from(die, 1, { yPercent: -200, duration: 1, ease: "bounce.out" }, 0);

    tl.to(
      die,
      2,
      {
        duration: 1,
        rotateX: `${x}deg`,
        rotateY: `${y}deg`,
        rotateZ: `${z}deg`,
        ease: "power4.out",
        onComplete: () => {
          index === self.length - 1 && prepareForInput(self);
        },
      },
      0
    );
  });
};

const getRotation = (value, oddEven) => {
  const rotations = {
    odd: [
      { x: -360, y: -720, z: -360 },
      { x: -270, y: -720, z: -360 },
      { x: -360, y: -810, z: -360 },
      { x: -360, y: -630, z: -360 },
      { x: -450, y: -720, z: -360 },
      { x: -360, y: -900, z: -360 },
    ],
    even: [
      { x: 360, y: 720, z: 360 },
      { x: 450, y: 720, z: 360 },
      { x: 360, y: 630, z: 360 },
      { x: 360, y: 810, z: 360 },
      { x: 270, y: 720, z: 360 },
      { x: 360, y: 900, z: 360 },
    ],
  };

  return rotations[oddEven][value - 1];
};

const rollDice = (dice) => {
  const forcedOn = true;
  const forcedRoll = [1, 1, 1, 5, 5, 5];

  return dice.map((die, index) => {
    const num = forcedOn ? forcedRoll[index] : getNumber(1, 6);

    die.dataset.roll = num;

    return { dieId: `die-${index + 1}`, value: num };
  });
};

const prepareForInput = (result) => {
  const { rollBtn } = elements;
  const scoringDie = evaluateRoll(result);
  console.log("prepareForInput", scoringDie);
  if (document.querySelectorAll(...[".selectable"]).length > 0) {
    //rollBtn.disabled = true;
    //addActionButtons(scoringDie);
    activateListeners();
  } else {
    // processLosingTurn();
  }
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
    buttonContainer.style.opacity = "1";
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
      buttonContainer.style.opacity = "1";
    });
  });
};

const activateListeners = () => {
  const selectable = document.querySelectorAll(...[".selectable"]);

  selectable.forEach((s) => {
    s.addEventListener("click", handleDieSelect, true);
  });
};

const evaluateRoll = (roll) => {
  document
    .querySelectorAll(...[".selectable"])
    .forEach((s) => s.classList.remove("selectable", "selected"));

  let matchedArray = [];
  const scoringArray = [];
  const sixDiceCheck = roll.length === 6 ? checkForSixDiceScore(roll) : null;
  if (sixDiceCheck) {
    return { sets: [sixDiceCheck.set], value: sixDiceCheck.value, singles: [] };
  }

  const onesAndFives = roll.filter((r) => r.value === 1 || r.value === 5);
  onesAndFives.forEach(({ dieId }) => {
    makeDieSelectable(dieId);
  });

  scoringArray.push(onesAndFives);

  roll.forEach((r) => {
    const matched = roll.filter((current) => {
      return current.value === r.value;
    });
    if (matched.length > 2) {
      matched.forEach(({ dieId }) => {
        makeDieSelectable(dieId);
      });
    }
  });

  matchedArray = matchedArray.filter(
    (thing, index, self) =>
      index === self.findIndex((t) => t[0].value === thing[0].value)
  );

  scoringArray.push(...matchedArray);

  console.log("scoringArray", scoringArray);

  return [...matchedArray, ...onesAndFives];
};

const makeDieSelectable = (dieId) => {
  document.getElementById(dieId).classList.add("selectable");
};

const handleDieSelect = (e) => {
  const target = e.currentTarget;

  target.classList.toggle("selected");

  evaluateSelectedDice();
};

const evaluateSelectedDice = () => {
  const selected = Array.from(document.querySelectorAll(...[".selected"]));

  const values = selected.map((s) => {
    return parseInt(s.children[0].dataset.roll);
  });

  console.log("values", values);
  calculateSelectedTotal(values);
};

const calculateSelectedTotal = (values) => {
  let total = 0;
  updateSelectedTotal(total);

  const matches = checkForMatches(values);
  if (matches.length > 0) {
    matches.forEach((set) => {
      total = set && total + calculateBankedValue(set[0], set.length);
    });

    values.forEach((v) => {
      if (v !== matches[0][0] && values.length < 6) {
        total += convertOnesAndFives(v);
      }
    });
  } else {
    values.forEach((v) => {
      total += convertOnesAndFives(v);
    });
  }
  updateSelectedTotal(total);
};

const convertOnesAndFives = (value) => {
  switch (value) {
    case 1:
      return 100;
    case 5:
      return 50;
    default:
      return 0;
  }
};

const updateSelectedTotal = (newTotal) => {
  state.selectedTotal = newTotal;
};

const checkForMatches = (values) => {
  const matchArr = [];
  values.forEach((r) => {
    const matched = values.filter((current) => {
      return current === r;
    });

    matched.length > 2 && matchArr.push(matched);
  });

  return removeDuplicates(matchArr);
};

const removeDuplicates = (values) => {
  const filtered = values.filter(
    (thing, index, self) => index === self.findIndex((t) => t[0] === thing[0])
  );
  return filtered;
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

const moveDice = (die) => {
  const { dieId, value } = die;
  const { bankDice, diceContainer, rollBtn } = elements;
  const el = document.getElementById(dieId);
  const dieToAnimate = el.querySelector(".single-die");

  gsap.to(dieToAnimate, {
    duration: 0.2,
    scale: 0,
    onComplete: () => {
      diceContainer.removeChild(el);

      const dieForBank = createDieForBank(value);

      bankDice.appendChild(dieForBank);
      rollBtn.disabled = false;
      diceContainer.childNodes.length === 0 && resetBoard();
    },
  });
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
  turnScore.textContent = `(${state.turnScore})`;

  endTurnBtn.disabled = false;
  endTurnBtn.addEventListener("click", handleEndTurnClick);
};

const updateOverallScore = () => {
  const currentPlayer = document.getElementById(
    `player-${state.currentPlayer}`
  );
  const scoreDisplay = currentPlayer.querySelector(".player-score");

  const newScore = parseInt(scoreDisplay.textContent) + state.turnScore;

  scoreDisplay.textContent = newScore;

  if (state.winningScoreReached) {
    processLastChance(newScore, currentPlayer);
  }

  if (checkForWin(newScore) && state.winningScoreReached === false) {
    processWin(newScore);
  }
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
  const containers = document.querySelectorAll(...[".single-die-container"]);

  containers.forEach((c, i) => {
    c.removeEventListener("click", handleDieSelect);
    c.setAttribute("id", `die-${i + 1}`);
  });
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

const processLastChance = (score, player) => {
  if (score > state.winningScore) {
    updateWinner(score, player);
  }
  state.lastTurnTaken.push(state.currentPlayer);

  if (
    state.lastTurnTaken.length === parseInt(localStorage.getItem("players"))
  ) {
    declareFinalWinner();
  }
};

const resetBoard = () => {
  const { bankDice, endTurnBtn, gameInfoContainer } = elements;

  bankDice.replaceChildren();
  endTurnBtn.disabled = true;
  clearActionButtons();
  generateDie(6);
};

const checkForWin = (score) => {
  const limit = parseInt(localStorage.getItem("limit"));

  return score >= limit;
};

const processWin = (score) => {
  state.lastTurnTaken.push(state.currentPlayer);

  state.winningScoreReached = true;
  updateWinner(score);
};

const updateWinner = (score) => {
  const playerId = `player-${state.currentPlayer}`;
  const playerDisplay = document.getElementById(playerId);

  state.winningPlayer = state.currentPlayer;
  state.winningScore = score;

  const otherPlayers = document.querySelectorAll(
    `.player-score-container:not(#${playerId})`
  );

  otherPlayers.forEach((player) => {
    player.style.color = "white";
  });

  playerDisplay.style.color = "green";
};

const declareFinalWinner = () => {
  const player = document.getElementById(`player-${state.winningPlayer}`);

  const name = player.querySelector(".player-name").textContent;

  alert(`${name} has won the game!`);
};
