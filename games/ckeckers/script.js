import { DraughtsPlayer, DraughtsStatus } from './node_modules/rapid-draughts/dist/index.js';
import {
  EnglishDraughts as Draughts,
  EnglishDraughtsComputerFactory as ComputerFactory,
} from './node_modules/rapid-draughts/dist/english.js';

const boardElement = document.getElementById('board');
const turnLabel = document.getElementById('turnLabel');
const moveLabel = document.getElementById('moveLabel');
const hintText = document.getElementById('hint');
const resetBtn = document.getElementById('resetBtn');

let game = Draughts.setup({ player: DraughtsPlayer.LIGHT });
const ai = ComputerFactory.random();

let selectedSquare = null;

function labelForPiece(piece) {
  if (!piece) return '';
  return piece.player === DraughtsPlayer.LIGHT ? '●' : '○';
}

function classForPiece(piece) {
  if (!piece) return '';
  return piece.player === DraughtsPlayer.LIGHT ? 'white' : 'black';
}

function squareIndexToRowCol(index) {
  return { row: Math.floor(index / 8), col: index % 8 };
}

function statusLabel() {
  switch (game.status) {
    case DraughtsStatus.LIGHT_WON:
      return 'Les blancs ont gagné !';
    case DraughtsStatus.DARK_WON:
      return 'Les noirs ont gagné !';
    case DraughtsStatus.DRAW:
      return 'Partie nulle !';
    default:
      return 'Partie en cours.';
  }
}

function positionToBoardIndex(position) {
  return game.board.findIndex((square) => square.dark && square.position === position);
}

function destinationSetForSelection() {
  if (selectedSquare === null) return new Set();

  return new Set(
    game.moves
      .filter((move) => positionToBoardIndex(move.origin) === selectedSquare)
      .map((move) => positionToBoardIndex(move.destination))
      .filter((index) => index !== -1)
  );
}

function renderBoard() {
  boardElement.innerHTML = '';
  const possibleDestinations = destinationSetForSelection();

  game.board.forEach((square, index) => {
    const { row, col } = squareIndexToRowCol(index);
    const squareElement = document.createElement('button');
    squareElement.type = 'button';
    squareElement.className = `square ${square.dark ? 'dark' : 'light'}`;
    squareElement.dataset.index = String(index);
    squareElement.setAttribute('aria-label', `Case ${row + 1}-${col + 1}`);

    if (selectedSquare === index) {
      squareElement.classList.add('selected');
    }

    if (possibleDestinations.has(index) && square.dark) {
      squareElement.classList.add('highlight');
    }

    if (square.piece) {
      const pieceElement = document.createElement('span');
      pieceElement.className = `piece ${classForPiece(square.piece)}${square.piece.king ? ' king' : ''}`;
      pieceElement.textContent = labelForPiece(square.piece);
      pieceElement.title = square.piece.player === DraughtsPlayer.LIGHT ? 'Pion blanc' : 'Pion noir';
      squareElement.appendChild(pieceElement);
    }

    boardElement.appendChild(squareElement);
  });

  const playerLabel = game.player === DraughtsPlayer.LIGHT ? 'Blanc' : 'Noir';
  turnLabel.textContent = `Joueur : ${playerLabel}`;
  moveLabel.textContent = selectedSquare !== null
    ? `Pièce sélectionnée : case ${selectedSquare + 1}`
    : game.status === DraughtsStatus.PLAYING
      ? 'Clique sur une pièce blanche pour jouer.'
      : 'La partie est terminée.';

  if (game.status !== DraughtsStatus.PLAYING) {
    hintText.textContent = statusLabel();
  }
}

function selectPiece(index) {
  if (game.status !== DraughtsStatus.PLAYING) {
    hintText.textContent = statusLabel();
    return;
  }

  const piece = game.board[index]?.piece;
  if (!piece || piece.player !== DraughtsPlayer.LIGHT) {
    selectedSquare = null;
    renderBoard();
    return;
  }

  selectedSquare = index;
  renderBoard();
  hintText.textContent = 'Pièce blanche sélectionnée. Cliquez sur une case de destination valide.';
}

function applyHumanMove(index) {
  if (selectedSquare === null) return;

  const move = game.moves.find(
    (candidate) =>
      positionToBoardIndex(candidate.origin) === selectedSquare &&
      positionToBoardIndex(candidate.destination) === index
  );

  if (!move) {
    hintText.textContent = 'Ce déplacement n’est pas valide avec le moteur installé.';
    return;
  }

  try {
    game.move(move);
    selectedSquare = null;

    if (game.status !== DraughtsStatus.PLAYING) {
      renderBoard();
      hintText.textContent = statusLabel();
      return;
    }

    renderBoard();

    if (game.player === DraughtsPlayer.DARK) {
      hintText.textContent = 'Les noirs jouent avec le moteur rapid-draughts…';
      playAiMove();
    } else {
      hintText.textContent = 'Mouvement appliqué par le moteur rapid-draughts.';
    }
  } catch (error) {
    console.error(error);
    hintText.textContent = 'Ce mouvement est refusé par la logique du moteur.';
  }
}

async function playAiMove() {
  if (game.status !== DraughtsStatus.PLAYING) {
    renderBoard();
    hintText.textContent = statusLabel();
    return;
  }

  const move = await ai(game);
  if (!move) return;

  try {
    game.move(move);
    renderBoard();

    if (game.status !== DraughtsStatus.PLAYING) {
      hintText.textContent = statusLabel();
    } else {
      hintText.textContent = 'L’adversaire noir a joué avec la logique du moteur.';
    }
  } catch (error) {
    console.error(error);
    hintText.textContent = 'Le moteur n’a pas pu jouer ce coup.';
  }
}

boardElement.addEventListener('click', (event) => {
  const targetSquare = event.target.closest('.square');
  if (!targetSquare) return;

  const index = Number(targetSquare.dataset.index);

  if (selectedSquare === index) {
    selectedSquare = null;
    renderBoard();
    return;
  }

  if (selectedSquare !== null) {
    applyHumanMove(index);
  } else {
    selectPiece(index);
  }
});

resetBtn.addEventListener('click', () => {
  selectedSquare = null;
  game = Draughts.setup({ player: DraughtsPlayer.LIGHT });
  renderBoard();
  hintText.textContent = 'Le plateau a été réinitialisé avec le moteur rapid-draughts.';
});

renderBoard();