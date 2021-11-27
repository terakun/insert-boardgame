const BW = 6, BH = 6;
const dirs = ['H', 'V', 'UR', 'UL'];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getOpponent(piece) {
    return (piece === 'R') ? 'W' : 'R';
}

function posToIdx(pos) {
    return pos[0]*BW + pos[1];
}

function idxToPos(idx) {
    let r = Math.floor(idx / BW);
    let c = idx % BW;
    return [r, c];
}

function checkValidPos(pos) {
    return 0 <= pos[0] && pos[0] < BH && 0 <= pos[1] && pos[1] < BW;
}

class Board {
    initBoard() {
        this.currentDir = ' ';
        this.currentPos = [-1,-1];
        for (let i = 0; i < BH; ++i) {
            for (let j = 0; j < BW; ++j) {
                this.pieceBoard[i][j] = ' ';
                if(!this.debug) {
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
        this.pieceHistory = [];
        for (let i = 0; i < BH; ++i) {
            this.pieceBoard[i] = new Array(BW);
            this.vectorBoard[i] = new Array(BW);
        }
        this.debus = debug;
        this.initBoard();
    }

    judge() {
        const WIN_NUM = 5;
        const updateCnt = (cnt, piece) => {
            if (piece === 'R') {
                return cnt + 1;
            } else if (piece === 'W') {
                return cnt - 1;
            } else {
                return 0;
            }
        };

        // Horizontal Check
        for (let i = 0; i < BH; ++i) {
            let cnt = 0;
            for (let j = 0; j < BW; ++j) {
                cnt = updateCnt(cnt, this.pieceBoard[i][j]);
                if (cnt >= WIN_NUM) {
                    return 'R';
                } else if (cnt <= -WIN_NUM) {
                    return 'W';
                }
            }
        }

        // Vertical Check
        for (let j = 0; j < BW; ++j) {
            let cnt = 0;
            for (let i = 0; i < BH; ++i) {
                cnt = updateCnt(cnt, this.pieceBoard[i][j]);
                if (cnt >= WIN_NUM) {
                    return 'R';
                } else if (cnt <= -WIN_NUM) {
                    return 'W';
                }
            }
        }

        // Upper Left Check
        for (let di = -1; di <= 1; ++di) {
            let cnt = 0;
            for (let dj = 0; dj < BH - Math.abs(di); ++dj) {
                cnt = updateCnt(cnt, this.pieceBoard[dj + Math.max(di, 0)][dj + Math.max(-di, 0)]);
                if (cnt >= WIN_NUM) {
                    return 'R';
                } else if (cnt <= -WIN_NUM) {
                    return 'W';
                }
            }
        }

        // Upper Right Check
        for (let di = -1; di <= 1; ++di) {
            let cnt = 0;
            for (let dj = 0; dj < BH - Math.abs(di); ++dj) {
                cnt = updateCnt(cnt, this.pieceBoard[BH - 1 - (dj + Math.max(di, 0))][dj + Math.max(-di, 0)]);
                if (cnt >= WIN_NUM) {
                    return 'R';
                } else if (cnt <= -WIN_NUM) {
                    return 'W';
                }
            }
        }
        return ' ';
    }

    getValidMoves() {
        let validmoves = [];

        for (let i = 0; i < BH; ++i) {
            for (let j = 0; j < BW; ++j) {
                let valid = false;
                switch(this.currentDir) {
                    case 0: // Horizontal
                        valid = (i===this.currentPos[0]);
                        break;
                    case 1: // Vertical 
                        valid = (j===this.currentPos[1]);
                        break;
                    case 2: // Upper right
                        valid = ((BH-1-i-j) === (BH-1-this.currentPos[0]-this.currentPos[1]));
                        break;
                    case 3: // Upper left
                        valid = ((i-j) === (this.currentPos[0]-this.currentPos[1]));
                        break;
                    default:
                        valid = true;
                        break;
                }
                if(valid && this.getPiece([i, j]) === ' '){
                    validmoves.push(posToIdx([i,j]));
                }
            }
        }
        if(validmoves.length > 0) {
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

    getPiece(pos) {
        return this.pieceBoard[pos[0]][pos[1]];
    }

    setPiece(pos, piece) {
        this.pieceBoard[pos[0]][pos[1]] = piece;
    }

    step(pos, piece) {
        let r = pos[0], c = pos[1];
        this.setPiece([r,c], piece);
        this.currentDir = this.vectorBoard[r][c];
        this.currentPos = pos;

        // Insert process
        let posDirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for(let dir of posDirs) {
            let p1 = [r+dir[0], c+dir[1]];
            let p2 = [r-dir[0], c-dir[1]];
            while(checkValidPos(p1) && this.getPiece(p1) === piece) {
                p1 = [p1[0]+dir[0], p1[1]+dir[1]];
            }
            if(!checkValidPos(p1) || this.getPiece(p1) === ' ') {
                continue;
            }
            while(checkValidPos(p2) && this.getPiece(p2) === piece) {
                p2 = [p2[0]-dir[0], p2[1]-dir[1]];
            }
            if(!checkValidPos(p2) || this.getPiece(p2) === ' ') {
                continue;
            }
            this.setPiece(p1, piece);
            this.setPiece(p2, piece);
        }
        this.pieceHistory.push(this.pieceBoard);
    }

    undo() {
        

    }

}

class AI {
    constructor(depth) {
        this.piece = 'W';
        this.depth = depth;
    }

    randomSearch(board, piece) {
        let validindices = board.getValidMoves();
        return validindices[getRandomInt(validindices.length)];
    }

    dfsSearch(board, piece) {
        const queue = [];
        queue.push(board);
        while (queue.length > 0) {
            const b = queue.shift();
            if (b.judge() === 'piece') {
                break;
            }
            let validindices = board.getValidMoves();
            for(const index of validindices) {

            }
        }
        return validindices[getRandomInt(validindices.length)];
    }
}


let gameBoard = new Board();
let gameAI = new AI(1);
const divContainer = document.getElementsByClassName("game--container")[0];

for (let index = 0; index < BW*BH; ++index) {
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
let currentDir = ' ';

const winningMessage = () => {
    if(userPiece === currentPlayer) {
        return "あなたの勝ちです！";
    } else {
        return "AIの勝ちです！";
    }
};

const drawMessage = () => "引き分け";
const currentPlayerTurn = () => {
    if(userPiece === currentPlayer) {
        return "あなたのターンです";
    } else {
        return "AIのターンです";
    }
};

function updateWindow() {
    for(let idx=0;idx<BH*BW;++idx) {
        divCells[idx].style.backgroundColor = '#ffffff';

        let piece = gameBoard.getPiece(idxToPos(idx));
        if(piece === ' ') {
            continue;
        }

        let context = divCells[idx].getContext("2d");
        context.clearRect(0, 0, divCells[idx].width, divCells[idx].height)
        context.beginPath();
        // draw pieces
        context.arc(50, 50, 40, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
        if (posToIdx(gameBoard.currentPos) != idx) {
            context.lineWidth = 2;
        } else {
            context.lineWidth = 6;
        }

        context.strokeStyle = (piece === 'R')?"red":"black";
        context.stroke();

        console.log("hoge");
    }

    gameBoard.getValidMoves().map(index => divCells[index].style.backgroundColor = '#87ceeb');
}

function handleCellPlayed(clickedCellIndex) {
    let validindices = gameBoard.getValidMoves();
    if(!validindices.includes(clickedCellIndex)) {
        return false;
    }
    let pos = idxToPos(clickedCellIndex);
    gameBoard.step(pos, currentPlayer);
    updateWindow();
    return true;
}

function handlePlayerChange() {
    currentPlayer = getOpponent(currentPlayer);
    statusDisplay.innerHTML = currentPlayerTurn();
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

async function handleAI() {
    let index = gameAI.randomSearch(gameBoard, currentPlayer);
    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(1000);

    gameBoard.step(idxToPos(index), currentPlayer);
    updateWindow();
    if(handleJudge()) {
        return;
    }
}

function clickCell(clickedCellEvent) {
    if (!gameActive || currentPlayer !== userPiece) {
        return;
    }

    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if(!handleCellPlayed(clickedCellIndex)){
        return;
    }
    if(handleJudge()) {
        return;
    }

    handleAI();
}

function startGame() {
    gameActive = true;
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
    gameBoard.initBoard();

    for (let i = 0; i < BH; i++) {
        for (let j = 0; j < BW; j++) {
            let index = posToIdx([i,j]);
            let dir = gameBoard.vectorBoard[i][j];
            divCells[index].setAttribute('dir', dir);

            // draw vector on piece
            let context = divCells[index].getContext("2d") ;
            context.beginPath();
            context.clearRect(0, 0, divCells[index].width, divCells[index].height);
            let strokes = [
                [25,50,75,50],
                [50,25,50,75],
                [25,75,75,25],
                [25,25,75,75],
            ];
            context.moveTo(strokes[dir][0], strokes[dir][1]);
            context.lineTo(strokes[dir][2], strokes[dir][3]);
            context.strokeStyle = "black";
            context.lineWidth = 2;
            context.stroke();
            divCells[index].innerHTML = gameBoard.vectorBoard[i][j];
        }
    }

    currentPlayer = "R";
    updateWindow();

    if(document.form_turn.turn[1].checked) {
        userPiece = 'W';
        aiPiece = 'R';
        handleAI();
    } else {
        userPiece = 'R';
        aiPiece = 'W';
    }
    statusDisplay.innerHTML = currentPlayerTurn();
}

function handleUndo() {
    gameBoard.undo();
    if(currentPlayer === userPiece) {
        gameBoard.undo();
    }
    updateWindow();
}

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', clickCell));
document.querySelector('.game--start').addEventListener('click', startGame);
document.querySelector('.game--undo').addEventListener('click', undoStep);