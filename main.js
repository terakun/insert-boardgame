const BW = 6;
const BH = 6;
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
                    this.vectorBoard[i][j] = dirs[getRandomInt(dirs.length)];
                } else {
                    this.vectorBoard[i][j] = '*';
                }
            }
        }
    }

    constructor(debug = false) {
        this.pieceBoard = new Array(BH);
        this.vectorBoard = new Array(BH);
        for (let i = 0; i < BH; ++i) {
            this.pieceBoard[i] = new Array(BW);
            this.vectorBoard[i] = new Array(BW);
        }
        this.debus = debug;
        this.initBoard();
        console.log('constructor');
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
        switch(this.currentDir){
            case 'H': {
                let i = this.currentPos[0];
                for (let j = 0; j < BW; ++j) {
                    if (this.pieceBoard[i][j] === ' ') {
                        validmoves.push([i, j]);
                    }
                }
                break;
            }
            case 'V': {
                let j = this.currentPos[1];
                for (let i = 0; i < BH; ++i) {
                    if (this.pieceBoard[i][j] === ' ') {
                        validmoves.push([i, j]);
                    }
                }
                break;
            }
            case 'UR': {
                let i = this.currentPos[0], j = this.currentPos[1];
                let si = 0, sj = 0;
                if (BH-1-i < j) {
                    sj = j-(BH-1-i);
                } else {
                    si = (BH-1-i)-j;
                }
                let BD = BH - Math.max(si, sj);
                for (let di = 0; di < BD; ++di) {
                    if (this.pieceBoard[BH - 1 - (di + si)][di + sj] === ' ') {
                        validmoves.push([BH - 1 - (di + si), di + sj]);
                    }
                }
                break;
            }
            case 'UL': {
                let i = this.currentPos[0], j = this.currentPos[1];
                let si = 0, sj = 0;
                if (i < j) {
                    sj = j - i;
                } else {
                    si = i - j;
                }
                let BD = BH - Math.max(si, sj);
                for (let di = 0; di < BD; ++di) {
                    if (this.pieceBoard[di + si][di + sj] === ' ') {
                        validmoves.push([di + si, di + sj]);
                    }
                }
                break;
            }
            default:
                break;
        }

        if(validmoves.length == 0) {
            for(let i=0;i<BW;++i) {
                for(let j=0;j<BH;++j) { 
                    if(this.pieceBoard[i][j] == ' ') {
                        validmoves.push([i,j]);
                    }
                }
            }
        }
        return validmoves.map(pos => posToIdx(pos));
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
        this.currentPos = [r,c];

        // Insert process
        let pos_dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for(let dir of pos_dirs) {
            let p1 = [r+dir[0], c+dir[1]];
            let p2 = [r-dir[0], c-dir[1]];
            while(checkValidPos(p1) && this.getPiece(p1) === piece) {
                p1 = [p1[0]+dir[0], p1[1]+dir[1]];
            }
            console.log("p1 "+p1);
            if(!checkValidPos(p1) || this.getPiece(p1) === ' ') {
                continue;
            }
            while(checkValidPos(p2) && this.getPiece(p2) === piece) {
                p2 = [p2[0]-dir[0], p2[1]-dir[1]];
            }
            console.log("p2 "+p2);
            if(!checkValidPos(p2) || this.getPiece(p2) === ' ') {
                continue;
            }
            this.setPiece(p1, piece);
            this.setPiece(p2, piece);
        }
    }

}

class AI {
    constructor(depth) {
        this.piece = 'W';
        this.depth = depth;
    }

    search(board, piece) {
        let validindices = board.getValidMoves();
        return validindices[getRandomInt(validindices.length)];
    }
}


let gameBoard = new Board();
let gameAI = new AI(1);
const divContainer = document.getElementsByClassName("game--container")[0];

for (let i = 0; i < BH; i++) {
    for (let j = 0; j < BW; j++) {
        const div = document.createElement("div");
        div.setAttribute('data-cell-index', i * BW + j);
        div.classList.add('cell');
        divContainer.appendChild(div);
    }
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
    let validindices = gameBoard.getValidMoves();
    for(let idx=0;idx<BH*BW;++idx) {
        let piece = gameBoard.getPiece(idxToPos(idx));
        if(piece !== ' ') {
            divCells[idx].innerHTML = piece;
        }
        divCells[idx].style.backgroundColor = 'white';
    }
    for(const validindex of validindices) {
        divCells[validindex].style.backgroundColor = 'red';
    }
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

function handleJudge() {
    let judgeResult = gameBoard.judge();
    let roundWon = judgeResult !== ' ';

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false;
        return true;
    }

    let roundDraw = false;
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        return true;
    }

    handlePlayerChange();
    return false;
}

async function handleAI() {
    let index = gameAI.search(gameBoard, currentPlayer);
    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await _sleep(1000);

    gameBoard.step(idxToPos(index), currentPlayer);
    updateWindow();
    handleJudge();
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
            divCells[index].setAttribute('dir', gameBoard.vectorBoard[i][j]);
            divCells[index].innerHTML = gameBoard.vectorBoard[i][j];
        }
    }

    currentPlayer = "R";
    updateWindow();

    if(document.form.turn[1].checked) {
        userPiece = 'W';
        aiPiece = 'R';
        handleAI();
    } else {
        userPiece = 'R';
        aiPiece = 'W';
    }
    statusDisplay.innerHTML = currentPlayerTurn();
}

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', clickCell));
document.querySelector('.game--start').addEventListener('click', startGame);