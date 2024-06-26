const setupDialog = document.getElementById("setupDialog");
const startButton = document.getElementById("startBtn");
const gameOverDialog = document.getElementById("gameOverDialog");
const restartButton = document.getElementById("restartBtn");
const setupButton = document.getElementById("setupBtn");

let boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const winnerElement = document.getElementById("winner");
const resetButton = document.getElementById("resetBtn");

let boardSize = 3;
let currentPlayer = "X";
let board = [];
let gameStatus = "active";
let timerDuration = 20;

const playerXTimerElement = document.getElementById("playerXTimer");
const playerOTimerElement = document.getElementById("playerOTimer");
let timerX;
let timerO;

setupDialog.showModal();

startButton.addEventListener("click", () => {
  boardSize = parseInt(document.getElementById("boardSize").value);
  timerDuration = parseInt(document.getElementById("timer").value);
  initializeBoard();
  if (boardSize === 4) {
    boardElement.classList.add("board4");
  } else if (boardSize === 5) {
    boardElement.classList.add("board5");
  } else {
    boardElement.classList.add("board");
  }
  renderBoard();
  showStatus(`Player ${currentPlayer}'s Turn`);
  setupDialog.close();
  startTimers();
});

restartButton.addEventListener("click", () => {
  resetGame();
  gameOverDialog.close();
  setupDialog.showModal();
});

setupButton.addEventListener("click", () => {
  gameOverDialog.close();
  window.location.reload();
});

class Timer {
  constructor(duration, onUpdate, onTimeout) {
    this.duration = duration;
    this.onUpdate = onUpdate;
    this.onTimeout = onTimeout;
    this.timerInterval = null;
    this.startTime = 0;
    this.pauseStart = 0;
    this.pausedTime = 0;
    this.isPaused = false;
  }

  start() {
    if (this.isPaused) {
      const pausedDuration = new Date().getTime() - this.pauseStart;
      this.pausedTime += pausedDuration;
    } else {
      this.startTime = new Date().getTime();
      this.pausedTime = 0;
    }

    this.isPaused = false;
    this.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = now - this.startTime - this.pausedTime;
      const remaining = Math.max(0, this.duration - Math.floor(elapsed / 1000));
      this.onUpdate(remaining);
      if (remaining <= 0) {
        this.stop();
        this.onTimeout();
      }
    }, 1000);
  }

  pause() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.isPaused = true;
      this.pauseStart = new Date().getTime();
    }
  }

  resume() {
    if (this.isPaused) {
      this.start();
    }
  }

  stop() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isPaused = false;
    this.startTime = 0;
    this.pauseStart = 0;
    this.pausedTime = 0;
  }
}

function startTimers() {
  timerX = new Timer(timerDuration, updateTimerX, handleTimeoutX);
  timerO = new Timer(timerDuration, updateTimerO, handleTimeoutO);
  timerX.start();
}

function updateTimerX(timeLeft) {
  playerXTimerElement.textContent = `Player X's Timer: ${timeLeft} seconds`;
}

function updateTimerO(timeLeft) {
  playerOTimerElement.textContent = `Player O's Timer: ${timeLeft} seconds`;
}

function handleTimeoutX() {
  if (gameStatus === "active") {
    currentPlayer = "O";
    showStatus(`Player O's Turn (Time's up!)`);
    timerX.pause();
    timerO.resume();
  }
}

function handleTimeoutO() {
  if (gameStatus === "active") {
    currentPlayer = "X";
    showStatus(`Player X's Turn (Time's up!)`);
    timerO.pause();
    timerX.resume();
  }
}

function initializeBoard() {
  board = [];
  for (let i = 0; i < boardSize; i++) {
    board.push(new Array(boardSize).fill(""));
  }
}

function renderBoard() {
  boardElement.innerHTML = "";
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.textContent = board[i][j];
      cell.addEventListener("click", handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

function handleCellClick(event) {
  if (gameStatus !== "active") return;
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);
  if (board[row][col] === "") {
    board[row][col] = currentPlayer;
    event.target.textContent = currentPlayer;
    if (checkWin(row, col)) {
      gameStatus = "won";
      showStatus(`Player ${currentPlayer} wins!`);
      showGameOverDialog(`Player ${currentPlayer} wins!`);
      timerX.stop();
      timerO.stop();
    } else if (checkDraw()) {
      gameStatus = "draw";
      showStatus(`It's a draw!`);
      showGameOverDialog(`It's a draw!`);
      timerX.stop();
      timerO.stop();
    } else {
      switchPlayerTurn();
    }
  }
}

function switchPlayerTurn() {
  if (currentPlayer === "X") {
    currentPlayer = "O";
    timerX.pause(); // Pause Player X's timer
    timerO.start(); // Resume Player O's timer
  } else {
    currentPlayer = "X";
    timerO.pause(); // Pause Player O's timer
    timerX.start(); // Resume Player X's timer
  }
  updateCurrentPlayerTimer();
  showStatus(`Player ${currentPlayer}'s Turn`);
}

function checkWin(row, col) {
  const symbol = board[row][col];
  let win = true;
  for (let i = 0; i < boardSize; i++) {
    if (board[row][i] !== symbol) {
      win = false;
      break;
    }
  }
  if (win) return true;

  win = true;
  for (let i = 0; i < boardSize; i++) {
    if (board[i][col] !== symbol) {
      win = false;
      break;
    }
  }
  if (win) return true;

  if (row === col) {
    win = true;
    for (let i = 0; i < boardSize; i++) {
      if (board[i][i] !== symbol) {
        win = false;
        break;
      }
    }
    if (win) return true;
  }

  if (row + col === boardSize - 1) {
    win = true;
    for (let i = 0; i < boardSize; i++) {
      if (board[i][boardSize - 1 - i] !== symbol) {
        win = false;
        break;
      }
    }
    if (win) return true;
  }

  return false;
}

function checkDraw() {
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (board[row][col] === "") {
          return false; 
        }
      }
    }
    return true; 
  }
  

function showStatus(message) {
  statusElement.querySelector(".turn").textContent = message;
}

function showGameOverDialog(message) {
  document.getElementById("gameOverMessage").textContent = message;
  gameOverDialog.showModal();
}

function resetGame() {
  window.location.reload();
}

resetButton.addEventListener("click", resetGame);

function updateCurrentPlayerTimer() {
  if (currentPlayer === "X") {
    currentPlayerTimerElement = playerXTimerElement;
  } else {
    currentPlayerTimerElement = playerOTimerElement;
  }
}
