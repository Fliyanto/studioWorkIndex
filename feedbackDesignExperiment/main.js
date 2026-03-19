// find elements to use
const warningDialog = document.getElementById("warningDialog");
const acknowledgedBtn = document.getElementById("acknowledgedBtn");

const resultDialog = document.getElementById("resultDialog");
const finalScoreText = document.getElementById("finalScoreText");
const playAgainBtn = document.getElementById("playAgainBtn");

const statusText = document.getElementById("statusText");
const countdownText = document.getElementById("countdownText");
const scoreText = document.getElementById("scoreText");
const gameArea = document.getElementById("gameArea");
const modeButtons = document.querySelectorAll(".modeBtn");

// added this to wake up the intro popup right away
warningDialog.showModal();

// added this so the intro popup closes cleanly and audio can start properly
acknowledgedBtn.addEventListener("click", closeDialog);

function closeDialog() {
  warningDialog.close();
  Tone.start();
}

// tone synth init
const synth = new Tone.Synth().toDestination();

// added this to give a soft sound when a dot is hit
function playHitSound() {
  synth.triggerAttackRelease("C5", "8n");
}

// added this to give a lower sound when a dot is missed
function playMissSound() {
  synth.triggerAttackRelease("C3", "8n");
}

// added this to give a tiny sound for the countdown
function playCountdownSound() {
  synth.triggerAttackRelease("G4", "16n");
}

// added this so the round ending feels a bit clearer
function playEndSound() {
  synth.triggerAttackRelease("E4", "8n");
}

// added this to store the game settings and current progress
let selectedMode = null;
let dotSize = 70;
let hitCount = 0;
let missedCount = 0;
let spawnedDots = 0;
let gameRunning = false;
let activeDot = null;
let activeDotTimeout = null;
let nextDotTimeout = null;

// added this so each mode changes the difficulty through dot size
const modeSettings = {
  easy: 90,
  medium: 65,
  hard: 42,
};

// added this so mode buttons actually start the game
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (gameRunning) return;

    selectedMode = button.dataset.mode;
    dotSize = modeSettings[selectedMode];
    startGame();
  });
});

// added this so the play again button resets everything nicely
playAgainBtn.addEventListener("click", () => {
  resultDialog.close();
  resetGame();
});

// added this to fully reset the board for a fresh round
function resetGame() {
  clearTimeout(activeDotTimeout);
  clearTimeout(nextDotTimeout);

  hitCount = 0;
  missedCount = 0;
  spawnedDots = 0;
  gameRunning = false;
  activeDot = null;

  gameArea.innerHTML = "";
  countdownText.textContent = "-";
  statusText.textContent = "Pick a mode to start.";
  updateScoreText();
}

// added this so the score line always stays updated
function updateScoreText() {
  scoreText.textContent = `Hit: ${hitCount} | Missed: ${missedCount} | Dot: ${spawnedDots} / 20`;
}

// added this so the player gets the 3 to 1 countdown before the first dot
async function startGame() {
  resetGame();
  gameRunning = true;

  statusText.textContent = `Mode locked in: ${selectedMode}. Get ready.`;

  const countdownSteps = ["3", "2", "1"];

  for (const step of countdownSteps) {
    countdownText.textContent = step;
    playCountdownSound();
    await wait(1000);
  }

  countdownText.textContent = "Go";
  await wait(400);
  countdownText.textContent = "-";

  statusText.textContent = "Click the dots before they turn red.";
  spawnNextDot();
}

// added this to help with the countdown timing without making things messy
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// added this to randomise the delay between each dot spawn
function getRandomDelay() {
  return Math.floor(Math.random() * 900) + 450;
}

// added this to create dots in random spots inside the game area
function createDot() {
  const dot = document.createElement("button");
  dot.className = "reactionDot";
  dot.type = "button";

  const areaRect = gameArea.getBoundingClientRect();
  const maxX = areaRect.width - dotSize;
  const maxY = areaRect.height - dotSize;

  const randomX = Math.max(0, Math.random() * maxX);
  const randomY = Math.max(0, Math.random() * maxY);

  dot.style.width = `${dotSize}px`;
  dot.style.height = `${dotSize}px`;
  dot.style.left = `${randomX}px`;
  dot.style.top = `${randomY}px`;

  return dot;
}

// added this so one dot appears at a time and stays on screen after the result
function spawnNextDot() {
  if (!gameRunning) return;

  if (spawnedDots >= 20) {
    endGame();
    return;
  }

  const dot = createDot();
  activeDot = dot;
  spawnedDots += 1;
  updateScoreText();

  gameArea.appendChild(dot);

  let dotResolved = false;

  // added this so clicking in time turns the dot blue
  dot.addEventListener("click", () => {
    if (dotResolved) return;

    dotResolved = true;
    dot.classList.add("hit");
    hitCount += 1;
    updateScoreText();
    playHitSound();

    clearTimeout(activeDotTimeout);
    activeDot = null;
    queueNextDot();
  });

  // added this so not clicking in 0.3 seconds turns the dot red
  activeDotTimeout = setTimeout(() => {
    if (dotResolved) return;

    dotResolved = true;
    dot.classList.add("missed");
    missedCount += 1;
    updateScoreText();
    playMissSound();

    activeDot = null;
    queueNextDot();
  }, 500);
}

// added this so each new dot shows up after a random gap
function queueNextDot() {
  if (spawnedDots >= 20) {
    endGame();
    return;
  }

  nextDotTimeout = setTimeout(() => {
    spawnNextDot();
  }, getRandomDelay());
}

// added this to finish the game cleanly and show the final feedback popup
function endGame() {
  clearTimeout(activeDotTimeout);
  clearTimeout(nextDotTimeout);

  gameRunning = false;
  activeDot = null;
  countdownText.textContent = "Done";
  statusText.textContent = "Round finished.";
  playEndSound();

  const accuracy = Math.round((hitCount / 20) * 100);

  finalScoreText.textContent = `You got ${hitCount} out of 20. Missed ${missedCount}. Accuracy: ${accuracy}%.`;
  resultDialog.showModal();
}

// added this so the score is correct even before the first round starts
updateScoreText();
