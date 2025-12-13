export class Othello {
  static WHITE = 0;
  static BLACK = 1;
  static VALID = 2;
  static EMPTY = -1;
  static MODE_AI = 1;
  static MODE_PP = 0;
  static power_mat = [
    [20, -3, 11, 8, 8, 11, -3, 20],
    [-3, -7, -4, 1, 1, -4, -7, -3],
    [11, -4, 2, 2, 2, 2, -4, 11],
    [8, 1, 2, -3, -3, 2, 1, 8],
    [8, 1, 2, -3, -3, 2, 1, 8],
    [11, -4, 2, 2, 2, 2, -4, 11],
    [-3, -7, -4, 1, 1, -4, -7, -3],
    [20, -3, 11, 8, 8, 11, -3, 20]
  ];

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
    this.moves = Array.from({ length: 61 }, () => Array(2).fill(-1));
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

        // size: 60 * 64, init value is the default value of array.
    this.steps = Array.from({ length: 60 }, () => Array(64).fill(0));
    // size: 60
    this.recorder = Array(60);
    this.moves = Array.from({ length: 61 }, () => Array(2).fill(-1));
  }

  checkValidMove(row, col, color, board = this.board){
    if (board[row][col] === Othello.WHITE || board[row][col] === Othello.BLACK) {
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
        if (board[x][y] === opponentColor) {
          foundOpponent = true;
        } else if (board[x][y] === color && foundOpponent) {
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

  searchValid(color, board){
    let moves = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.checkValidMove(i, j, color, board)) {
          moves.push({ row: i, col: j });
        }
      }
    }
    return moves;
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

  setValidMoves(color) {
    var count = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.checkValidMove(i, j, color)) {
          this.board[i][j] = Othello.VALID;
          count += 1;
        }
      }
    }
    return count;
  }

  flipWithoutRecord(row, col, color, board) {
    board[row][col] = color;
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
        if (board[x][y] === opponentColor) {
          flipPositions.push([x, y]);
        } else if (board[x][y] === color) {
          flipPositions.forEach(([fx, fy]) => {
            board[fx][fy] = color;
          });
          break;
        } else {
          break;
        }
        x += dx;
        y += dy;
      }
    }
  }

  flipDiscs(row, col, color, board = this.board) {
    this.recorder[this.count] = color;
    // copy the board array
    this.steps[this.count] = board.map(arr => arr.slice());
    this.moves[this.count+1][0] = row;
    this.moves[this.count+1][1] = col;
    this.count += 1;
    board[row][col] = color;
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
        if (board[x][y] === opponentColor) {
          flipPositions.push([x, y]);
        } else if (board[x][y] === color) {
          flipPositions.forEach(([fx, fy]) => {
            board[fx][fy] = color;
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
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === Othello.VALID) {
          board[rowIndex][colIndex] = Othello.EMPTY;
        }
      });
    });

    // 标记新的可行棋位置
    let validMoves = this.getValidMoves(color === Othello.WHITE ? Othello.BLACK : Othello.WHITE);
    validMoves.forEach(move => {
        if (board[move.row][move.col] === Othello.EMPTY) {
          board[move.row][move.col] = Othello.VALID;
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
    return this.AIMove(personColor);
    let validMoves = this.getValidMoves(1 - personColor);
    if(validMoves.length === 0){
      return 1;
    }
    let randomIndex = Math.floor(Math.random() * validMoves.length);
    // move directly
    console.log(`AI randomly choosing move at (${validMoves[randomIndex].row}, ${validMoves[randomIndex].col})`); 
    this.flipDiscs(validMoves[randomIndex].row, validMoves[randomIndex].col, 1 - personColor);
    return 0;
  }

  updateBoard(row, col, color){
    // return value: number of valid moves for another player.
    this.flipDiscs(row, col, color);
    return this.setValidMoves(1 - color);
  }

  deepSearchAIMove(personColor, currentPieceColor, depth, last_board, last_optimal_row, last_optimal_col){
    if(depth <= 0){
      return 0;
    }
    let score = -10;
    let optimalRow = -1;
    let optimalCol = -1;
    let board = last_board.map(arr => arr.slice());
    let validMoves = this.searchValid(currentPieceColor, board);
    if(validMoves.length === 0){
      return -80;
      console.log(`color ${currentPieceColor} has no valid moves in (${last_optimal_row}, ${last_optimal_col}).`);
      if(currentPieceColor === personColor){
        console.log("AI: person has no valid moves, good for AI.");
        return 100;
      }
      console.log("AI: AI has no valid moves, bad for AI.");
      return -100;
    }

    for(let move of validMoves){
      // if move in [0,1], [1,0] and [0,0] is the same color, score +20
      let cs = Othello.power_mat[move.row][move.col];
      if (board[7][7] === currentPieceColor) {
        if((move.row === 6 && move.col === 7 || move.row === 7 && move.col === 6 || move.row === 6 && move.col === 6 ))
          cs += 20;
        else if(move.col === 7 || move.row === 7)
          cs += 10;
      } else if ( board[0][0] === currentPieceColor) {
        if((move.row === 0 && move.col === 1 || move.row === 1 && move.col === 0 || move.row === 1 && move.col === 1 ))
          cs += 20;
        else if(move.row === 0 || move.col === 0)
          cs += 10;
      } else if (board[0][7] === currentPieceColor) {
        if ((move.row === 0 && move.col === 6 || move.row === 1 && move.col === 7 || move.row === 1 && move.col === 6 )) 
          cs += 20;
        else if(move.row === 0 || move.col === 7)
          cs += 10;
      } else if (board[7][0] === currentPieceColor) {
        if ((move.row === 6 && move.col === 0 || move.row === 7 && move.col === 1 || move.row === 6 && move.col === 1 )) 
          cs += 20;
        else if(move.row === 7 || move.col === 0)
          cs += 10;
      }
      // if(personColor === currentPieceColor){
      //   cs = -cs;
      // }
      let simBoard = board.map(arr => arr.slice());
      this.flipWithoutRecord(move.row, move.col, currentPieceColor, simBoard);
      cs -= this.deepSearchAIMove(personColor, 1 - currentPieceColor, depth - 1, simBoard, move.row, move.col);
      if( score < cs ){
        score = cs;
        optimalCol = move.col;
        optimalRow = move.row;
      }
    }
    // if(personColor === currentPieceColor){
    //   score = -score;
    // }
    // simulate the optimal move
    // this.flipWithoutRecord(optimalRow, optimalCol, currentPieceColor, board);
    return score// - this.deepSearchAIMove(personColor, 1 - currentPieceColor, depth - 1, board, optimalRow, optimalCol);
  }

  AIMove(personColor){
    let score = -10000;
    let depth = 4;
    let optimalRow = -1;
    let optimalCol = -1;
    let validMoves = this.getValidMoves(1 - personColor);
    console.log(`AI found ${validMoves.length} valid moves.`);
    if(validMoves.length === 0){
      return 1;
    }
    
    for(let move of validMoves){
      let cs = Othello.power_mat[move.row][move.col] + this.deepSearchAIMove(personColor, personColor, depth - 1, this.board, move.row, move.col);
      if ((move.row === 6 && move.col === 7 || move.row === 7 && move.col === 6 || move.row === 7 && move.col === 7 ) && this.board[7][7] === 1 - personColor) {
        cs += 15;
      } else if ((move.row === 0 && move.col === 1 || move.row === 1 && move.col === 0 || move.row === 0 && move.col === 0 ) && this.board[0][0] === 1 - personColor) {
        cs += 15;
      } else if ((move.row === 0 && move.col === 6 || move.row === 1 && move.col === 7 || move.row === 0 && move.col === 7 ) && this.board[0][7] === 1 - personColor) {
        cs += 15;
      } else if ((move.row === 6 && move.col === 0 || move.row === 7 && move.col === 1 || move.row === 7 && move.col === 0 ) && this.board[7][0] === 1 - personColor) {
        cs += 15;
      }

      if(this.board[0][7] === 1 - personColor 
        || this.board[0][0] === 1 - personColor
        || this.board[7][0] === 1 - personColor
        || this.board[7][7] === 1 - personColor){
        if(move.row === 0 || move.row === 7){
          for (let i = 0; i < 8; i++) {
            if(this.board[move.row][i] === 1 - personColor){
              cs += 3;
            }
          }
        }else if (move.col === 0 || move.col === 7){
          for (let i = 0; i < 8; i++) {
            if(this.board[i][move.col] === 1 - personColor){
              cs += 3;
            }
          }
        }
      }


      // console.log(`AI evaluating move at (${move.row}, ${move.col}) with score: ${cs}`);
      if( score < cs ){
        score = cs;
        optimalCol = move.col;
        optimalRow = move.row;
      }
    }
    console.log(`AI choosing move at (${optimalRow}, ${optimalCol}) with score: ${score}`);
    // make the optimal move
    this.flipDiscs(optimalRow, optimalCol, 1 - personColor);
    return [optimalRow, optimalCol];
  }

  getBlackCount(){
    let blackCount = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.board[i][j] === Othello.BLACK) {
          blackCount += 1;
        }
      }
    }
    return blackCount;
  }

  getCounts(){
    let black = 0, white = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.board[i][j] === Othello.BLACK) {
          black += 1;
        } else if (this.board[i][j] === Othello.WHITE) {
          white += 1;
        }
      }
    }
    return { black: black, white: white };
  }
  

  // isPass(color){
  //   let validMoves = this.getValidMoves(color);
  //   return validMoves.length === 0;
  // }
}