importScripts('board.js');

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

onmessage = function(e) {
    let gameAI = new AI(9);
    let boarddict = e.data[0];
    let board = Board.create(boarddict.pieceBoard, boarddict.vectorBoard, boarddict.debug, boarddict.currentDir, boarddict.currentPos);
    let piece = e.data[1];
    let index = gameAI.minmaxSearch(board, piece);
    postMessage(index);
}