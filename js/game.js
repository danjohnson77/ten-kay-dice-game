const elements = {
  diceContainer: document.querySelector(".dice-container"),
  bankDice: document.querySelector(".bank-dice"),
  turnScore: document.querySelector(".turn-score"),
  rollBtn: document.getElementById("roll-btn"),
  endTurnBtn: document.getElementById("end-turn-btn"),
  keepSelectedBtn: document.getElementById("keep-selected-btn"),
  keepAllBtn: document.getElementById("keep-all-btn"),
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
  maxTotal: 0,
};

const initState = state;

const generateScoreboard = (players = 1) => {
  const { scoreboardContainer, gameInfoContainer } = elements;

  scoreboardContainer.replaceChildren();

  const scoreLimit = document.createElement("p");
  scoreLimit.textContent = `Playing to ${localStorage.getItem("limit")}`;
  scoreboardContainer.appendChild(scoreLimit);

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

  gameInfoContainer.querySelector(".current-player").textContent =
    getCurrentPlayer().querySelector(".player-name").textContent;
};

const getCurrentPlayer = () => {
  return document.getElementById(`player-${state.currentPlayer}`);
};

const getPlayerScoreCoords = () => {
  const coords = document
    .getElementById(`player-${state.currentPlayer}`)
    .querySelector(".player-score")
    .getBoundingClientRect();

  return { x: coords.x, y: coords.y };
};

const init = () => {
  generateScoreboard(localStorage.getItem("players"));
  resetBoard();
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
    rollBtn,
  } = elements;

  if (
    validateInput(playerNumberInput.value, 1, 4) &&
    validateInput(scoreLimitInput.value, 50, 10000)
  ) {
    localStorage.setItem("players", playerNumberInput.value);
    localStorage.setItem("limit", scoreLimitInput.value);

    modalContainer.style.display = "none";
    layoutContainer.style.display = "grid";
    rollBtn.disabled = false;
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

    diceContainer.appendChild(dieContainer);
  }
};

const handleRollClick = () => {
  const { rollBtn, endTurnBtn, diceContainer } = elements;
  diceContainer.style.opacity = 1;
  rollBtn.disabled = true;
  endTurnBtn.disabled = true;
  resetActionButtons();
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
    const stagger = 1;

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
  const forcedOn = false;
  const forcedRoll = [1, 1, 1, 1, 2, 4];

  return dice.map((die, index) => {
    const num = forcedOn ? forcedRoll[index] : getNumber(1, 6);

    die.dataset.roll = num;

    return { dieId: `die-${index + 1}`, value: num };
  });
};

const prepareForInput = (result) => {
  evaluateRoll(result);

  if (document.querySelectorAll(...[".selectable"]).length > 0) {
    activateListeners();
  } else {
    state.turnScore = 0;
    animateDiceOut();
  }
};

const activateListeners = () => {
  const selectable = document.querySelectorAll(...[".selectable"]);

  selectable.forEach((s) => {
    s.addEventListener("click", handleDieSelect, true);
  });
};

const evaluateRoll = (roll) => {
  const values = roll.map((v) => v.value);
  state.maxTotal = calculateSelectedTotal(values);

  updateKeepAllButtonText();

  const sixDiceCheck =
    values.length === 6 ? checkForSixDiceScore(values) : null;

  if (sixDiceCheck) {
    return roll.forEach(({ dieId }) => {
      makeDieSelectable(dieId);
    });
  }

  const onesAndFives = roll.filter((r) => r.value === 1 || r.value === 5);

  onesAndFives.forEach(({ dieId }) => {
    makeDieSelectable(dieId);
  });

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

  const notSelectable = document.querySelectorAll(
    ...[".single-die-container:not(.selectable)"]
  );

  notSelectable.forEach((el) => {
    showNotSelectable(el);
  });
};

const showNotSelectable = (el) => {
  el.style.transform = "scale(.8)";
  el.querySelectorAll(...[".die-side"]).forEach((side) => {
    side.style.background = "#a6a6a6";
  });
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

  updateSelectedTotal(calculateSelectedTotal(values));
  updateKeepSelectedButtonText(values.length);
};

const calculateSelectedTotal = (values) => {
  let total = 0;

  if (values.length === 0) {
    return total;
  }

  const sixDiceMatch = checkForSixDiceScore(values);
  if (values.length === 6 && sixDiceMatch) {
    total += sixDiceMatch;

    return total;
  }

  const matches = checkForMatches(values);
  if (matches.length > 0) {
    matches.forEach((set) => {
      total = set && total + calculateBankedValue(set[0], set.length);
    });

    values.forEach((v) => {
      if (
        (v !== matches[0][0] && values.length < 6) ||
        (v !== matches[0][0] && matches.length < 2)
      ) {
        total += convertOnesAndFives(v);
      }
    });
  } else {
    values.forEach((v) => {
      total += convertOnesAndFives(v);
    });
  }
  return total;
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

const updateKeepSelectedButtonText = (length = 0) => {
  const { keepSelectedBtn } = elements;

  if (state.selectedTotal > 0) {
    keepSelectedBtn.disabled = false;
    keepSelectedBtn.textContent = `KEEP ${length} DICE FOR ${state.selectedTotal} POINTS`;
  } else {
    resetKeepSelectedBtn();
  }
};

const updateKeepAllButtonText = (override = null) => {
  const { keepAllBtn } = elements;
  if (state.maxTotal > 0) {
    keepAllBtn.disabled = false;
    keepAllBtn.textContent = override
      ? override
      : `KEEP MAX (${state.maxTotal})`;
  } else {
    resetKeepAllBtn();
  }
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
  animateTurnScore();
};

const animateTurnScore = () => {
  console.log("coords", getPlayerScoreCoords());

  const { turnScore } = elements;

  const startingX = turnScore.getBoundingClientRect().x;
  const startingY = turnScore.getBoundingClientRect().y;

  console.log("starting", startingX, startingY);

  const x = getPlayerScoreCoords().x - startingX;
  const y = getPlayerScoreCoords().y - startingY;
  console.log("x", x);
  console.log("y", y);

  gsap.set(turnScore, { x: "", y: "" });

  gsap.to(
    turnScore,

    {
      duration: 0.3,
      opacity: 0,
      x,
      y,
      ease: "power1.in",
      onComplete: () => {
        animateDiceOut();
      },
    }
  );
};

const handleKeepSelectedClick = () => {
  updateKeepAllButtonText();
  const selected = Array.from(document.querySelectorAll(...[".selected"]));
  selected.forEach((s) =>
    moveDice(
      s.getAttribute("id"),
      s.getElementsByClassName("single-die")[0].dataset.roll
    )
  );

  const values = Array.from(
    document.querySelectorAll(...[".selectable:not(.selected)"])
  ).map((item) => {
    return parseInt(item.querySelector(".single-die").dataset.roll);
  });

  console.log("values", values);
  state.maxTotal = calculateSelectedTotal(values);
  console.log("maxTotal", state.maxTotal);
  updateKeepAllButtonText();
  addScoreToBank(state.selectedTotal);
  resetKeepSelectedBtn();
};

const handleKeepAllClick = () => {
  const selectable = Array.from(document.querySelectorAll(...[".selectable"]));
  selectable.forEach((s) =>
    moveDice(
      s.getAttribute("id"),
      s.getElementsByClassName("single-die")[0].dataset.roll
    )
  );
  addScoreToBank(state.maxTotal);
  resetKeepAllBtn();
};

const moveDice = (dieId, value) => {
  const { bankDice, diceContainer, rollBtn, endTurnBtn } = elements;
  const el = document.getElementById(dieId);
  const tl = gsap.timeline();
  const dieForBank = createDieForBank(value);

  tl.to(
    el,
    {
      scale: 0,
      ease: "power4.out",
      onComplete: () => {
        diceContainer.removeChild(el);

        bankDice.appendChild(dieForBank);
        dieForBank.style.transform = "";
      },
      duration: 1,
    },
    1
  ).from(
    dieForBank,
    {
      duration: 1,
      scale: 0,
      ease: "bounce",
      onComplete: () => {
        rollBtn.disabled = false;
        if (document.querySelectorAll(...[".selectable"]).length === 0) {
          resetActionButtons();
        }
        if (diceContainer.childNodes.length === 0) {
          resetBoard();
          endTurnBtn.disabled = false;
        }
      },
    },
    2
  );
};

const createDieForBank = (value) => {
  const dieForBank = document.createElement("div");
  dieForBank.classList.add("die-side");
  dieForBank.style.transform = "scale(0)";
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
  turnScore.textContent = `${state.turnScore}`;

  endTurnBtn.disabled = false;
  endTurnBtn.addEventListener("click", handleEndTurnClick);
};

const updateOverallScore = () => {
  const currentPlayer = getCurrentPlayer();
  const scoreDisplay = currentPlayer.querySelector(".player-score");

  const newScore = parseInt(scoreDisplay.textContent) + state.turnScore;

  scoreDisplay.textContent = newScore;
  console.log(
    "winning score reached",
    state.winningScoreReached,
    state.winningScore
  );
  if (state.winningScoreReached) {
    console.log("processLastChance called");
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
    return 1500;
  }
  if (checkForThreePair(set)) {
    return 1000;
  }
  return false;
};

const checkForStraight = (set) => {
  const sorted = set.sort((a, b) => {
    return a - b;
  });
  const criteria = [1, 2, 3, 4, 5, 6];

  return JSON.stringify(sorted) === JSON.stringify(criteria);
};

const checkForThreePair = (set) => {
  const sorted = set.sort((a, b) => {
    return a - b;
  });
  return (
    sorted.length === 6 &&
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

  gameInfoContainer.querySelector(".current-player").textContent =
    getCurrentPlayer().querySelector(".player-name").textContent;
};

const animateDiceOut = () => {
  const { diceContainer } = elements;
  const allDice = diceContainer.querySelectorAll(...[".single-die-container"]);

  gsap.to(allDice, {
    scale: 0,
    x: -window.innerWidth,
    stagger: 0.2,
    duration: 1.2,
    onComplete: () => {
      gsap.set(allDice, { x: "", scale: 1 });
      processEndOfTurn();
    },
  });
};

const processEndOfTurn = () => {
  const { turnScore } = elements;
  updateOverallScore();

  state.turnScore = 0;

  turnScore.textContent = state.turnScore;

  if (
    state.winningScoreReached &&
    state.winningPlayer !== state.currentPlayer
  ) {
    getCurrentPlayer().style.color = "#a6a6a6";
  }

  advanceCurrentPlayer();

  resetBoard();
};

const resetDice = () => {
  const containers = document.querySelectorAll(...[".single-die-container"]);

  containers.forEach((c, i) => {
    c.removeEventListener("click", handleDieSelect, true);
    c.style.transform = "";
    c.querySelectorAll(...[".die-side"]).forEach((side) => {
      side.style.background = "#fefefe";
    });
    c.classList.remove("selectable", "selected");
    c.setAttribute("id", `die-${i + 1}`);
  });
};

const resetKeepSelectedBtn = () => {
  const { keepSelectedBtn } = elements;

  keepSelectedBtn.textContent = "SELECT DICE TO KEEP";
  keepSelectedBtn.disabled = true;
};
const resetKeepAllBtn = () => {
  const { keepAllBtn } = elements;

  keepAllBtn.textContent = "KEEP MAX";
  keepAllBtn.disabled = true;
};

const resetActionButtons = () => {
  resetKeepAllBtn();
  resetKeepSelectedBtn();
};

const getNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const processLastChance = (score, player) => {
  if (score > state.winningScore) {
    updateWinner(score, player);
  }
  state.lastTurnTaken.push(state.currentPlayer);
  console.log("last Chance", state.lastTurnTaken);

  state.lastTurnTaken.forEach((item) => {
    const current = document.getElementById(`player-${item}`);
    current.style.color = item !== state.winningPlayer && "#a6a6a6";
  });

  if (
    state.lastTurnTaken.length === parseInt(localStorage.getItem("players"))
  ) {
    declareFinalWinner();
  }
};

const resetBoard = () => {
  const { bankDice, endTurnBtn, rollBtn, diceContainer, turnScore } = elements;

  resetActionButtons();
  bankDice.replaceChildren();
  turnScore.style = "";

  rollBtn.disabled = false;
  endTurnBtn.disabled = true;
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
  state.winningPlayer = state.currentPlayer;
  state.winningScore = score;

  getCurrentPlayer().style.color = "green";
};

const declareFinalWinner = () => {
  const player = document.getElementById(`player-${state.winningPlayer}`);

  const name = player.querySelector(".player-name").textContent;

  alert(`${name} has won the game!`);

  activateModal();
};
