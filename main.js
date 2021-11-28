let gameBoard = new Board();
const worker = new Worker('./ai.js');
let isWorking = false;
const divContainer = document.getElementsByClassName("game--container")[0];

for (let index = 0; index < BW * BH; ++index) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute('data-cell-index', index);
    canvas.setAttribute('width', 99);
    canvas.setAttribute('height', 100);
    canvas.classList.add('cell');
    divContainer.appendChild(canvas);
}

const divCells = document.getElementsByClassName('cell');
const statusDisplay = document.querySelector('.game--status');

let gameActive = false;
const undoButton = document.querySelector('.game--undo');
undoButton.disabled = true;
let currentPlayer = "R";
let userPiece = ' ';
let aiPiece = ' ';

const winningMessage = () => {
    if (userPiece === currentPlayer) {
        return "あなたの勝ちです！";
    } else {
        return "AIの勝ちです！";
    }
};

const drawMessage = () => "引き分け";
const currentPlayerTurn = () => {
    if (userPiece === currentPlayer) {
        return "あなたのターンです";
    } else {
        return "AIのターンです";
    }
};

function updateWindow() {
    for (let index = 0; index < BH * BW; ++index) {
        divCells[index].style.backgroundColor = '#ffffff';

        let context = divCells[index].getContext("2d");
        context.beginPath();
        context.clearRect(0, 0, divCells[index].width, divCells[index].height)

        if (!gameBoard.debug) {
            pos = idxToPos(index)
            drawVector(pos[0], pos[1]);
        }

        let piece = gameBoard.getPiece(idxToPos(index));
        if (piece === ' ') {
            continue;
        }

        // draw pieces
        context.beginPath();
        context.arc(50, 50, 40, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
        context.lineWidth = (posToIdx(gameBoard.currentPos) != index) ? 2 : 6;
        context.strokeStyle = (piece === 'R') ? "red" : "black";
        context.stroke();
    }
    // highlight valid moves
    gameBoard.getValidMoves().map(index => divCells[index].style.backgroundColor = '#87ceeb');
}

function handleUser(clickedCellIndex) {
    let validIndices = gameBoard.getValidMoves();
    if (!validIndices.includes(clickedCellIndex)) {
        return false;
    }
    let pos = idxToPos(clickedCellIndex);
    gameBoard.step(pos, currentPlayer);
    updateWindow();

    console.log('User');
    debugBoardInfo();

    return true;
}

function handlePlayerChange() {
    currentPlayer = getOpponent(currentPlayer);
    statusDisplay.innerHTML = currentPlayerTurn();
    statusDisplay.style.color = (currentPlayer === 'R')?'red':'black';
}

function handleEnd() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.style.backgroundColor = '#ffffff';
    });
    gameActive = false;
    // undoButton.disabled = true;
}

// return true if the game is over
function handleJudge() {
    let judgeResult = gameBoard.judge();
    let roundWon = judgeResult !== ' ';

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        statusDisplay.style.color = (currentPlayer === 'R')?'red':'black';
        handleEnd();
        return true;
    }

    // draw if there is no valid moves
    let roundDraw = (gameBoard.getValidMoves().length == 0);
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        statusDisplay.style.color = 'blue';
        handleEnd();
        return true;
    }

    handlePlayerChange();
    return false;
}

function debugBoardInfo() {
    console.log(boardToString());
    console.log(gameBoard.getNumPiece());
}

function boardToString() {
    let rowlist = []
    for(let r=0;r<BH;++r) {
        let row = gameBoard.pieceBoard[r];
        rowlist.push(row.join('.'));
    }
    return rowlist.join('\n');
}

worker.onmessage = function(e) {
    let index = e.data;
    gameBoard.step(idxToPos(index), currentPlayer);

    updateWindow();
    console.log('AI');
    debugBoardInfo();

    isWorking = false;
    if (handleJudge()) {
        return;
    }
};

function clickCell(clickedCellEvent) {
    if (!gameActive || currentPlayer !== userPiece) {
        return;
    }

    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (!handleUser(clickedCellIndex)) {
        return;
    }
    if (handleJudge()) {
        return;
    }
    worker.postMessage([gameBoard, currentPlayer]);
    isWorking = true;
}

// draw vector on piece
function drawVector(r, c) {
    let index = posToIdx([r, c]);
    let dir = gameBoard.vectorBoard[r][c];
    let context = divCells[index].getContext("2d");
    let strokes = [
        [25, 50, 75, 50],
        [50, 25, 50, 75],
        [25, 75, 75, 25],
        [25, 25, 75, 75],
    ];
    context.moveTo(strokes[dir][0], strokes[dir][1]);
    context.lineTo(strokes[dir][2], strokes[dir][3]);
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.stroke();
}

function startGame() {
    gameActive = true;
    undoButton.disabled = false;
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
    gameBoard.initBoard();

    for (let i = 0; i < BH; i++) {
        for (let j = 0; j < BW; j++) {
            let index = posToIdx([i, j]);
            let dir = gameBoard.vectorBoard[i][j];
            divCells[index].setAttribute('dir', dir);

            let context = divCells[index].getContext("2d");
            context.beginPath();
            context.clearRect(0, 0, divCells[index].width, divCells[index].height);

            if (!gameBoard.debug) {
                drawVector(i, j);
            }
        }
    }

    currentPlayer = "R";
    updateWindow();

    if (document.form_turn.turn[1].checked) {
        userPiece = 'B';
        aiPiece = 'R';
        worker.postMessage([gameBoard, currentPlayer]);
        isWorking = true;
    } else {
        userPiece = 'R';
        aiPiece = 'B';
    }
    statusDisplay.innerHTML = currentPlayerTurn();
    statusDisplay.style.color = (currentPlayer === 'R')?'red':'black';
}

function undoGame() {
    if(!gameActive) {
        gameActive = true;
        currentPlayer = getOpponent(currentPlayer);
    }
    if(currentPlayer === userPiece) {
        gameBoard.undo();
        gameBoard.undo();
    } else {
        if(isWorking){
            worker.terminate();
        }
        gameBoard.undo();
        currentPlayer = userPiece;
    }

    updateWindow();
    statusDisplay.innerHTML = currentPlayerTurn();
    statusDisplay.style.color = (currentPlayer === 'R')?'red':'black';
}

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', clickCell));
document.querySelector('.game--start').addEventListener('click', startGame);
document.querySelector('.game--undo').addEventListener('click', undoGame);