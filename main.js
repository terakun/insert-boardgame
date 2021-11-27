const BW = 6, BH = 6;
const WIN_NUM = 5;
const dirs = ['H', 'V', 'UR', 'UL'];

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getOpponent(piece) {
    return (piece === 'R') ? 'B' : 'R';
}

function posToIdx(pos) {
    return pos[0] * BW + pos[1];
}

function idxToPos(index) {
    let r = Math.floor(index / BW);
    let c = index % BW;
    return [r, c];
}

function checkValidPos(pos) {
    return 0 <= pos[0] && pos[0] < BH && 0 <= pos[1] && pos[1] < BW;
}

class Board {
    initBoard() {
        this.currentDir = ' ';
        this.currentPos = [-1, -1];
        for (let i = 0; i < BH; ++i) {
            for (let j = 0; j < BW; ++j) {
                this.pieceBoard[i][j] = ' ';
                if (!this.debug) {
                    this.vectorBoard[i][j] = getRandomInt(dirs.length);
                } else {
                    this.vectorBoard[i][j] = -1;
                }
            }
        }
    }

    constructor(debug = false) {
        this.pieceBoard = new Array(BH);
        this.vectorBoard = new Array(BH);
        for (let i = 0; i < BH; ++i) {
            this.previousPieceBoard = new Array(BH);
            this.pieceBoard[i] = new Array(BW);
            this.vectorBoard[i] = new Array(BW);
        }
        this.debug = debug;
        this.initBoard();
    }

    judgePos(r, c, piece) {
        let posDirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for (let dir of posDirs) {
            let p1 = [r + dir[0], c + dir[1]];
            let n1 = 0;
            while (checkValidPos(p1) && this.getPiece(p1) === piece) {
                p1 = [p1[0] + dir[0], p1[1] + dir[1]];
                n1++;
            }
            let p2 = [r - dir[0], c - dir[1]];
            let n2 = 0;
            while (checkValidPos(p2) && this.getPiece(p2) === piece) {
                p2 = [p2[0] - dir[0], p2[1] - dir[1]];
                n2++;
            }
            if (n1 + n2 >= WIN_NUM - 1) {
                return true;
            }
        }
    }
    judge() {
        for (let r = 0; r < BH; ++r) {
            for (let c = 0; c < BW; ++c) {
                let piece = this.getPiece([r, c]);
                if (piece !== ' ') {
                    if (this.judgePos(r, c, piece)) {
                        return piece;
                    }
                }
            }
        }
        return ' ';
    }

    getValidMoves() {
        if(this.judge() !== ' ') {
            return [];
        }

        let validmoves = [];
        for (let i = 0; i < BH; ++i) {
            for (let j = 0; j < BW; ++j) {
                let valid = false;
                switch (this.currentDir) {
                    case 0: // Horizontal
                        valid = (i === this.currentPos[0]);
                        break;
                    case 1: // Vertical 
                        valid = (j === this.currentPos[1]);
                        break;
                    case 2: // Upper right
                        valid = ((i + j) === (this.currentPos[0] + this.currentPos[1]));
                        break;
                    case 3: // Upper left
                        valid = ((i - j) === (this.currentPos[0] - this.currentPos[1]));
                        break;
                    default:
                        valid = true;
                        break;
                }
                if (valid && this.getPiece([i, j]) === ' ') {
                    validmoves.push(posToIdx([i, j]));
                }
            }
        }
        if (validmoves.length > 0) {
            return validmoves;
        }
        for (let i = 0; i < BH; ++i) {
            for (let j = 0; j < BW; ++j) {
                if (this.getPiece([i, j]) === ' ') {
                    validmoves.push(posToIdx([i, j]));
                }
            }
        }
        return validmoves;
    }

    copy() {
        let board = new Board(this.debug);
        for (let i = 0; i < BH; ++i) {
            for (let j = 0; j < BW; ++j) {
                board.pieceBoard[i][j] = this.pieceBoard[i][j];
                board.vectorBoard[i][j] = this.vectorBoard[i][j];
            }
        }
        board.currentDir = this.currentDir;
        board.currentPos = this.currentPos;
        return board;
    }
    getPiece(pos) {
        return this.pieceBoard[pos[0]][pos[1]];
    }

    setPiece(pos, piece) {
        this.pieceBoard[pos[0]][pos[1]] = piece;
    }

    step(pos, piece) {
        let r = pos[0], c = pos[1];
        this.setPiece([r, c], piece);
        this.currentDir = this.vectorBoard[r][c];
        this.currentPos = pos;

        // Insert process
        let posDirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for (let dir of posDirs) {
            let p1 = [r + dir[0], c + dir[1]];
            let p2 = [r - dir[0], c - dir[1]];
            while (checkValidPos(p1) && this.getPiece(p1) === piece) {
                p1 = [p1[0] + dir[0], p1[1] + dir[1]];
            }
            if (!checkValidPos(p1) || this.getPiece(p1) === ' ') {
                continue;
            }
            while (checkValidPos(p2) && this.getPiece(p2) === piece) {
                p2 = [p2[0] - dir[0], p2[1] - dir[1]];
            }
            if (!checkValidPos(p2) || this.getPiece(p2) === ' ') {
                continue;
            }
            this.setPiece(p1, piece);
            this.setPiece(p2, piece);
        }
    }
}

class AI {
    constructor(depth) {
        this.plyDepth = depth;
        this.piece = ' ';
    }

    randomSearch(board, piece) {
        let validIndices = board.getValidMoves();
        return validIndices[getRandomInt(validIndices.length)];
    }

    minmaxSearch(board, piece) {
        this.piece = piece;
        let bestMove = this.minmaxCore(board, this.plyDepth, piece);
        return bestMove[0];
    }

    minmaxCore(board, plyDepth, piece) {
        let bestMove = []; // [index, score]

        let validIndices = board.getValidMoves();
        if (plyDepth === 0 || validIndices.length === 0) {
            let judgeResult = board.judge();
            if (judgeResult === this.piece) {
                return [-1, 1];
            } else if (judgeResult === getOpponent(this.piece)) {
                return [-1, -1];
            } else {
                return [-1, 0];
            }
        }

        for (const index of validIndices) {
            let nextBoard = board.copy();
            nextBoard.step(idxToPos(index), piece)
            let res = this.minmaxCore(nextBoard, plyDepth - 1, getOpponent(piece))
            let score = res[1];

            if (piece === this.piece) {
                if (score > bestMove[0] || bestMove.length == 0) {
                    bestMove = [index, score];
                }
            } else {
                if (score < bestMove[0] || bestMove.length == 0) {
                    bestMove = [index, score];
                }
            }
        }
        return bestMove;
    }
}


let gameBoard = new Board();
let gameAI = new AI(9);
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

let gameActive = true;
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

function handleCellPlayed(clickedCellIndex) {
    let validIndices = gameBoard.getValidMoves();
    if (!validIndices.includes(clickedCellIndex)) {
        return false;
    }
    let pos = idxToPos(clickedCellIndex);
    gameBoard.step(pos, currentPlayer);
    updateWindow();
    console.log('User');
    for(let r=0;r<BH;++r) {
        let row = gameBoard.pieceBoard[r];
        row.join(' ');
        console.log(row);
    }

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
}

// return true if the game is over
function handleJudge() {
    let judgeResult = gameBoard.judge();
    let roundWon = judgeResult !== ' ';

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        handleEnd();
        return true;
    }

    // draw if there is no valid moves
    let roundDraw = (gameBoard.getValidMoves().length == 0);
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        handleEnd();
        return true;
    }

    handlePlayerChange();
    return false;
}

function handleAI() {
    let index = gameAI.minmaxSearch(gameBoard, currentPlayer);

    gameBoard.step(idxToPos(index), currentPlayer);
    updateWindow();
    console.log('AI');
    for(let r=0;r<BH;++r) {
        let row = gameBoard.pieceBoard[r];
        row.join(' ');
        console.log(row);
    }

    if (handleJudge()) {
        return;
    }
}

function clickCell(clickedCellEvent) {
    if (!gameActive || currentPlayer !== userPiece) {
        return;
    }

    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (!handleCellPlayed(clickedCellIndex)) {
        return;
    }
    if (handleJudge()) {
        return;
    }
    handleAI();
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
        handleAI();
    } else {
        userPiece = 'R';
        aiPiece = 'B';
    }
    statusDisplay.innerHTML = currentPlayerTurn();
}

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', clickCell));
document.querySelector('.game--start').addEventListener('click', startGame);