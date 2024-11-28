// board.js
export default {
    initializeBoard(board) {
      board[3][3] = 'white';
      board[3][4] = 'black';
      board[4][3] = 'black';
      board[4][4] = 'white';
    },

initHint(board, currentPlayer){
    if (currentPlayer === 'white') {
        board[2][4] = 'valid';
        board[3][5] = 'valid';
        board[4][2] = 'valid';
        board[5][3] = 'valid';
    }
},
  
    checkValidMove(board, row, col, color) {
      if (board[row][col] === 'white' || board[row][col] === 'black') return false;
  
      const opponentColor = color === 'white' ? 'black' : 'white';
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
    },
  
    getValidMoves(board, color) {
      let moves = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (this.checkValidMove(board, i, j, color)) {
            moves.push({ row: i, col: j });
          }
        }
      }
      return moves;
    },
  
    flipDiscs(board, row, col, color) {
      const opponentColor = color === 'white' ? 'black' : 'white';
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
  };
  