importScripts('board.js');

class AI {
    constructor() {
        this.plyDepth = 7;
        this.piece = ' ';
    }

    randomSearch(board, piece) {
        let validIndices = board.getValidMoves();
        return validIndices[getRandomInt(validIndices.length)];
    }

    search(board, piece) {
        let numPiece = board.getNumPiece();
        if(numPiece < BW*BH/2) {
            this.plyDepth = 12;
            console.log('alphabeta'+this.plyDepth);
            return this.alphabetaSearch(board, piece);
        } else {
            console.log('perfect play');
            let bestMove = this.perfectPlayCore(board, piece);
            if(!bestMove[1]) {
                console.log('無理');
                return this.randomSearch(board, piece);
            } else {
                return bestMove[0];
            }
        }
    }

    perfectPlayCore(board, piece) {
        let validIndices = board.getValidMoves();
        if (validIndices.length === 0) {
            let judgeResult = board.judge();
            if (judgeResult === this.piece) {
                return [-1, true];
            } else if (judgeResult === getOpponent(this.piece)) {
                return [-1, false];
            } else {
                return [-1, false];
            }
        }

        let totalJudge = (piece !== this.piece);
        let bestMove = [-1, false];
        for (const index of validIndices) {
            board.step(idxToPos(index), piece)
            let res = this.perfectPlayCore(board, getOpponent(piece))
            board.undo();
            let judge = res[1];

            if(piece === this.piece) {
                totalJudge = totalJudge || judge;
            } else {
                totalJudge = totalJudge && judge;
            }
            if (judge) {
                bestMove[0] = index;
            }
        }
        bestMove[1] = totalJudge;
        return bestMove;
    }

    alphabetaSearch(board, piece) {
        this.piece = piece;
        let bestMove = this.alphabetaCore(board, this.plyDepth, piece, -100, 100);
        console.log("score:"+bestMove[1]);
        return bestMove[0];
    }

    alphabetaCore(board, plyDepth, piece, lowScore, highScore) {
        let bestMove = []; // [index, score]

        let validIndices = board.getValidMoves();
        if (plyDepth === 0 || validIndices.length === 0) {
            let judgeResult = board.judge();
            if (judgeResult === piece) {
                return [-1, 1];
            } else if (judgeResult === getOpponent(piece)) {
                return [-1, -1];
            } else {
                return [-1, 0];
            }
        }

        for (const index of validIndices) {
            board.step(idxToPos(index), piece);
            let res = this.alphabetaCore(board, plyDepth - 1, getOpponent(piece), -highScore, -lowScore);
            board.undo();
            let score = res[1];

            if (bestMove.length === 0||-score > bestMove[1]) {
                lowScore = -score;
                bestMove = [index, lowScore];
            }
            if(lowScore >= highScore) {
                return bestMove;
            }
        }
        return bestMove;
    }
}

onmessage = function(e) {
    let gameAI = new AI();
    let boarddict = e.data[0];
    let board = Board.create(boarddict.pieceBoard, boarddict.vectorBoard, boarddict.debug, boarddict.currentDir, boarddict.currentPos);
    let piece = e.data[1];
    let index = gameAI.search(board, piece);
    postMessage(index);
}