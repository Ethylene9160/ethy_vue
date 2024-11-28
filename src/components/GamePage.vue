<template>
    <div class="game-page">
      <div class="task-info">
        <h2>任务: 游戏 1</h2>
        <div class="task-details">
          <div class="avatar"></div>
          <div class="current-piece">
            <span :style="{ backgroundColor: currentPieceColor }"></span>
          </div>
          <div class="timer">{{ timer }}s</div>
        </div>
      </div>
  
      <div class="game-board">
        <div class="board">
          <div class="row" v-for="(row, rowIndex) in board" :key="rowIndex">
            <div
              class="cell"
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              :style="{ backgroundColor: cell === 'black' ? 'black' : cell === 'white' ? 'white' : cell === 'valid'? 'blue':'lightgray' }"
              @click="makeMove(rowIndex, colIndex)"
              :class="{ 'valid-move': validMoves.some(move => move.row === rowIndex && move.col === colIndex) }"
            ></div>
          </div>
        </div>
      </div>
  
      <div class="chat-box">
        <div class="messages">
          <p>对手: 你好！</p>
          <p>我方: 加油！</p>
        </div>
        <div class="send-message">
          <input v-model="message" type="text" placeholder="输入消息..." />
          <button @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { notification } from 'ant-design-vue';
  
  export default {
    name: 'GamePage',
    data() {
      return {
        timer: 30,
        currentPieceColor: 'white', // 当前轮到的棋子颜色
        validMoveColor: 'green',
        board: Array(8).fill().map(() => Array(8).fill(null)), // 初始化空棋盘
        validMoves: [], // 可落子位置
        message: '',
        ws: null,
      };
    },
    methods: {
      // 初始化棋盘，设置中间四颗棋子
      initializeBoard() {
        this.board[3][3] = 'white';
        this.board[3][4] = 'black';
        this.board[4][3] = 'black';
        this.board[4][4] = 'white';
      },
  
      // 检查位置是否合法
      checkValidMove(row, col, color) {
        if (this.board[row][col] !== null) return false;
  
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
  
          // 持续沿方向遍历，直到越界或者找到自己的棋子
          while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (this.board[x][y] === opponentColor) {
              foundOpponent = true;
            } else if (this.board[x][y] === color && foundOpponent) {
              valid = true; // 找到围住的对方棋子并且遇到自己的棋子
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
  
      // 查找所有合法的落子位置
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
      },
  
      // 执行翻转
      flipDiscs(row, col, color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        const directions = [
          [-1, 0], [1, 0], [0, -1], [0, 1], // 横竖四个方向
          [-1, -1], [-1, 1], [1, -1], [1, 1] // 对角线四个方向
        ];
  
        // 下子后执行翻转
        for (let [dx, dy] of directions) {
          let x = row + dx;
          let y = col + dy;
          let flipPositions = [];
  
          while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (this.board[x][y] === opponentColor) {
              flipPositions.push([x, y]);
            } else if (this.board[x][y] === color) {
              // 找到自己的棋子时，翻转棋子
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
      },
  
      // 玩家落子
      makeMove(row, col) {
        if (!this.isValidMove(row, col)) {
          this.showMessage('此位置不可落子');
          return;
        }
  
        // 更新棋盘
        this.board[row][col] = this.currentPieceColor;
  
        // 执行翻转
        this.flipDiscs(row, col, this.currentPieceColor);
  
        // 切换玩家
        this.currentPieceColor = this.currentPieceColor === 'white' ? 'black' : 'white';
  
        // 清除上一轮的合法落子位置
        for (var i in this.board) {
          for( var j in this.board[i]) {
            if (this.board[i][j] === 'valid') {
              this.board[i][j] = null;
            }
          }
        }

        // 获取当前玩家的合法落子位置
        this.validMoves = this.getValidMoves(this.currentPieceColor);
        if (this.validMoves.length === 0) {
          this.showMessage('当前玩家无法落子，跳过此回合');
          this.currentPieceColor = this.currentPieceColor === 'white' ? 'black' : 'white';
          this.validMoves = this.getValidMoves(this.currentPieceColor);
        }

        // 绘制当前玩家的合法落子位置
        
        for (let move of this.validMoves) {
            if (this.board[move.row][move.col] === null) {
              this.board[move.row][move.col] = 'valid';
            }
        }
      },
  
      // 检查是否是有效的落子
      isValidMove(row, col) {
        return this.validMoves.some(move => move.row === row && move.col === col);
      },
  
      // 发送棋步到服务器
      sendMoveToServer(rowIndex, colIndex) {
        const moveData = {
          row: rowIndex,
          col: colIndex,
          color: this.currentPieceColor,
          board: this.board,
        };
  
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(moveData));
        }
      },
  
      handleServerResponse(event) {
        const response = JSON.parse(event.data);
        this.board = response.board;
      },
  
      showMessage(msg) {
        notification.error({
          message: '提示',
          description: msg,
          duration: 2, // 自动关闭
        });
      },
  
      startTimer() {
        const interval = setInterval(() => {
          if (this.timer > 0) {
            this.timer--;
          } else {
            clearInterval(interval);
          }
        }, 1000);
      },
    },
  
    created() {
      this.initializeBoard();
      this.validMoves = this.getValidMoves(this.currentPieceColor);
  
      this.ws = new WebSocket('ws://127.0.0.1:8081');
      this.ws.onopen = () => console.log('WebSocket 连接成功');
      this.ws.onmessage = this.handleServerResponse;
    },
  
    mounted() {
      this.startTimer();
    },
  };
  </script>
  
  <style scoped>
  .game-page {
    font-family: 'Arial', sans-serif;
  }
  
  .task-info {
    margin-bottom: 20px;
  }
  
  .current-piece span {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }
  
  .board {
    display: grid;
    grid-template-columns: repeat(8, 50px);
    grid-template-rows: repeat(8, 50px);
    gap: 2px;
  }
  
  .cell {
    width: 50px;
    height: 50px;
    cursor: pointer;
    border: 1px solid #ccc;
  }
  
  .cell.valid-move {
    background-color: #95e43b;
  }
  
  .chat-box {
    margin-top: 20px;
  }
  
  .messages {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .send-message {
    display: flex;
    justify-content: space-between;
  }
  
  .send-message input {
    width: 80%;
  }
  </style>
  