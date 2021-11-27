const BW = 6;
const BH = 6;
const dirs = ['H', 'V', 'UR', 'UL'];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

class Board {
    constructor() {
        this.board = new Array(BH);
        this.vectorboard = new Array(BH);

        this.current_dir = ' ';
        this.current_pos = [-1,-1];
        for (let i = 0; i < BH; ++i) {
            this.board[i] = new Array(BW);
            this.vectorboard[i] = new Array(BW);
            for (let j = 0; j < BW; ++j) {
                this.board[i][j] = ' ';
                this.vectorboard[i][j] = dirs[getRandomInt(dirs.length)]
            }
        }
        console.log('constructor')
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
                cnt = updateCnt(cnt, this.board[i][j]);
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
                cnt = updateCnt(cnt, this.board[i][j]);
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
                cnt = updateCnt(cnt, this.board[dj + Math.max(di, 0)][dj + Math.max(-di, 0)]);
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
                cnt = updateCnt(cnt, this.board[BH - 1 - (dj + Math.max(di, 0))][dj + Math.max(-di, 0)]);
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
        switch(this.current_dir){
            case 'H': {
                let i = this.current_pos[0];
                for (let j = 0; j < BW; ++j) {
                    if (this.board[i][j] === ' ') {
                        validmoves.push([i, j]);
                    }
                }
                break;
            }
            case 'V': {
                let j = this.current_pos[1];
                for (let i = 0; i < BH; ++i) {
                    if (this.board[i][j] === ' ') {
                        validmoves.push([i, j]);
                    }
                }
                break;
            }
            case 'UR': {
                let i = this.current_pos[0], j = this.current_pos[1];
                let si = 0, sj = 0;
                if (BH-1-i < j) {
                    sj = j-(BH-1-i);
                } else {
                    si = (BH-1-i)-j;
                }
                let BD = BH - Math.max(si, sj);
                for (let di = 0; di < BD; ++di) {
                    if (this.board[BH - 1 - (di + si)][di + sj] === ' ') {
                        validmoves.push([BH - 1 - (di + si), di + sj]);
                    }
                }
                break;
            }
            case 'UL': {
                let i = this.current_pos[0], j = this.current_pos[1];
                let si = 0, sj = 0;
                if (i < j) {
                    sj = j - i;
                } else {
                    si = i - j;
                }
                let BD = BH - Math.max(si, sj);
                for (let di = 0; di < BD; ++di) {
                    if (this.board[di + si][di + sj] === ' ') {
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
                    if(this.board[i][j] == ' ') {
                        validmoves.push([i,j]);
                    }
                }
            }
        }
        return validmoves;
    }

    step(r, c, piece) {
        this.board[r][c] = piece;
        this.current_dir = this.vectorboard[r][c];
        this.current_pos = [r,c];
    }

}

class AI {
    constructor(depth) {
        this.piece = 'R';
    }

    step(board) {

    }
}

class Game {
    constructor() {

    }

    init() {

    }

}

let board = new Board();
let game = new Game();

game.init();
const div_container = document.getElementsByClassName("game--container")[0];
const div_cells = document.getElementsByClassName('cell');
for (let i = 0; i < BH; i++) {
    for (let j = 0; j < BW; j++) {
        const div = document.createElement("div");
        div.setAttribute('data-cell-index', i * BW + j);
        div.setAttribute('dir', board.vectorboard[i][j]);
        div.innerHTML = board.vectorboard[i][j];
        div.classList.add('cell');
        div_container.appendChild(div);
    }
}

const statusDisplay = document.querySelector('.game--status');

let gameActive = true;
let currentPlayer = "R";
let currentDir = ' ';

const winningMessage = () => `Player ${currentPlayer} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;

statusDisplay.innerHTML = currentPlayerTurn();

function handleCellPlayed(clickedCell, clickedCellIndex) {
    clickedCell.innerHTML = currentPlayer;
    let r = Math.floor(clickedCellIndex / BW);
    let c = clickedCellIndex % BW;
    board.step(r, c, currentPlayer);
    let validmoves = board.getValidMoves();

    console.log(validmoves);

    for(let idx=0;idx<BH*BW;++idx) {
        div_cells[idx].style.backgroundColor = 'white';
    }
    for(const validmove of validmoves) {
        console.log(validmove);
        let idx = validmove[0]*BW+validmove[1];
        console.log(idx);
        div_cells[idx].style.backgroundColor = 'red';
    }
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "R" ? "W" : "R";
    statusDisplay.innerHTML = currentPlayerTurn();
}

function handleResultValidation() {
    console.log("judge:" + board.judge());
    let judge = board.judge();
    let roundWon = judge !== ' ';

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false;
        return;
    }

    let roundDraw = false;
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        return;
    }

    handlePlayerChange();
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (!gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
}

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.game--restart').addEventListener('click', handleRestartGame);

