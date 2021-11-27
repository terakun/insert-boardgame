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

    static create(pieceBoard, vectorBoard, debug, currentDir, currentPos) {
        let board = new Board(debug);
        board.pieceBoard = pieceBoard;
        board.vectorBoard = vectorBoard;
        board.currentDir = currentDir;
        board.currentPos = currentPos;
        return board;
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