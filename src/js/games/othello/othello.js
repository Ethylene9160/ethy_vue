export class Othello {
  static WHITE = 0;
  static BLACK = 1;
  static VALID = 2;
  static EMPTY = -1;
  static MODE_AI = 1;
  static MODE_PP = 0;

  constructor(currentPieceColor) {
    this.currentPieceColor = currentPieceColor;
    this.board = Array.from({ length: 8 }, () => Array(8).fill(Othello.EMPTY));
    this.count = 0;
    this.board[3][3] = Othello.WHITE;
    this.board[3][4] = Othello.BLACK;
    this.board[4][3] = Othello.BLACK;
    this.board[4][4] = Othello.WHITE;
    this.mode = Othello.MODE_PP;

    this.board[2][4] = Othello.VALID;
    this.board[3][5] = Othello.VALID;
    this.board[4][2] = Othello.VALID;
    this.board[5][3] = Othello.VALID;

    // size: 60 * 64, init value is the default value of array.
    this.steps = Array.from({ length: 60 }, () => Array(64).fill(0));
    // size: 60
    this.recorder = Array(60);
  }

  init_board() {
    this.count = 0;
    this.board = Array.from({ length: 8 }, () => Array(8).fill(Othello.EMPTY));
    this.board[3][3] = Othello.WHITE;
    this.board[3][4] = Othello.BLACK;
    this.board[4][3] = Othello.BLACK;
    this.board[4][4] = Othello.WHITE;

    this.board[2][4] = Othello.VALID;
    this.board[3][5] = Othello.VALID;
    this.board[4][2] = Othello.VALID;
    this.board[5][3] = Othello.VALID;
  }

  checkValidMove(row, col, color) {
    if (this.board[row][col] === Othello.WHITE || this.board[row][col] === Othello.BLACK) {
      return false;
    }

    const opponentColor = color === Othello.WHITE ? Othello.BLACK : Othello.WHITE;
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // 横竖四个方向
      [-1, -1], [-1, 1], [1, -1], [1, 1] // 对角线四个方向
    ];

    let valid = false;

    for (let [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      let foundOpponent = false;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (this.board[x][y] === opponentColor) {
          foundOpponent = true;
        } else if (this.board[x][y] === color && foundOpponent) {
          valid = true;
          break;
        } else {
          break;
        }
        x += dx;
        y += dy;
      }
    }

    return valid;
  }

  getValidMoves(color) {
    let moves = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.checkValidMove(i, j, color)) {
          moves.push({ row: i, col: j });
        }
      }
    }
    return moves;
  }

  flipDiscs(row, col, color) {
    this.recorder[this.count] = color;
    // copy the board array
    this.steps[this.count] = this.board.map(arr => arr.slice());
    this.count += 1;
    this.board[row][col] = color;
    const opponentColor = color === Othello.WHITE ? Othello.BLACK : Othello.WHITE;
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // 横竖四个方向
      [-1, -1], [-1, 1], [1, -1], [1, 1] // 对角线四个方向
    ];

    for (let [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      let flipPositions = [];

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (this.board[x][y] === opponentColor) {
          flipPositions.push([x, y]);
        } else if (this.board[x][y] === color) {
          flipPositions.forEach(([fx, fy]) => {
            this.board[fx][fy] = color;
          });
          break;
        } else {
          break;
        }
        x += dx;
        y += dy;
      }
    }

    // 清除上一轮的可行棋标志
    this.board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === Othello.VALID) {
          this.board[rowIndex][colIndex] = Othello.EMPTY;
        }
      });
    });

    // 标记新的可行棋位置
    let validMoves = this.getValidMoves(color === Othello.WHITE ? Othello.BLACK : Othello.WHITE);
    validMoves.forEach(move => {
        if (this.board[move.row][move.col] === Othello.EMPTY) {
          this.board[move.row][move.col] = Othello.VALID;
        }
      });
  }

  isOver() {
    // case 1: full.
    return this.count >= 60;
    // case 2: 
  }

  regret(){;
    if (this.count <= 0) {
      return Othello.EMPTY;
    }
    this.count -= 1;
    // copy the record board
    this.board = this.steps[this.count].map(arr => arr.slice());
    return this.recorder[this.count];
  }

  switchMode(){
    this.mode = 1 - this.mode; 
  }

  randomAIMove(personColor){
    // sleep 0.5 seconds
    
    let validMoves = this.getValidMoves(1 - personColor);
    if(validMoves.length === 0){
      return 1;
    }
    let randomIndex = Math.floor(Math.random() * validMoves.length);
    // move directly
    this.flipDiscs(validMoves[randomIndex].row, validMoves[randomIndex].col, 1 - personColor);
    return 0;
  }
}