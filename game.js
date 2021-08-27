console.log("GAME IS ON");

const handleRollClick = () => {
  resetDice();

  const dice = [...document.querySelectorAll(".active")];

  const result = rollDice(dice);

  console.log("RESULT:", result);

  processTurn(result);
};

const resetDice = () => {
  const containers = [...document.querySelectorAll(".single-die-container")];

  containers.forEach((c) => {
    c.style.borderBottom = "none";
  });
  const active = [...document.querySelectorAll("ol.active")];

  active.forEach((a, index) => {
    a.parentElement.setAttribute("id", `die-${index + 1}`);
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

const processTurn = async (result) => {
  const scoringDie = evaluateRoll(result);

  highlightScoringDice(scoringDie);

  activateListeners(scoringDie);
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
      console.log(current);
    });
  });
};

const diceAnimateOut = (el) => {
  el.style.transform = "scale(0)";
};

const moveDice = (die) => {
  const { dieId, value } = die;

  const bank = document.querySelector(".bank-dice");
  const el = document.getElementById(dieId);
  const dice = document.querySelector(".dice");

  dice.removeChild(el);

  const dieForBank = createDieForBank(value);

  bank.appendChild(dieForBank);
};

const createDieForBank = (value) => {
  console.log("value", value);
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

const getNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
};
