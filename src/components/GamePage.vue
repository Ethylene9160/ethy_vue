<template>
    <div class="game-page">
      <div class="task-info">
        <h2>Reversi</h2>
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
              :style="{ backgroundColor: cell === 'black' ? 'black' : cell === 'white' ? 'white' : cell === 'valid'? '#e3a541':'lightgray' }"
              @click="makeMove(rowIndex, colIndex)"
              :class="{ 'valid-move': validMoves.some(move => move.row === rowIndex && move.col === colIndex) }"
            ></div>
          </div>
        </div>
      </div>
  
      <div class="chat-box">
        <div class="messages">
          <!-- <p>对手: 你好！</p>
          <p>我方: 加油！</p> -->
        </div>
        <div class="send-message">
          <input v-model="message" type="text" placeholder="输入消息..." />
          <button @click="sendMessage">发送</button>
        </div>
      </div>

      <div class="user-info">
        <h2>用户信息</h2>
        <p>用户名: {{ userName }}</p>
        <p>积分: {{ userInfo }}</p>
      </div>
    </div>
  </template>
  
  <script>
  // import { notification } from 'ant-design-vue';
  import othello from '../js/games/othello/othello.js';
  import timer from '../js/utils/timer.js';
  import websocket from '../js/utils/websocket.js';
  import {message} from 'ant-design-vue';

  export default {
  name: 'GamePage',

  data() {
    return {
      timer: 30,
      currentPieceColor: 'white',
      // validMoveColor: 'green',
      board: Array(8).fill().map(() => Array(8).fill(null)),
      validMoves: [],
      userName: localStorage.getItem('user_name'),
      userInfo: localStorage.getItem('user_info'),
      count: 4,
      ws: null,
    };
  },

  methods: {
    initializeBoard() {
      othello.initializeBoard(this.board);
    },

    initHint(){
      othello.initHint(this.board, this.currentPieceColor);
    },

    checkValidMove(row, col, color) {
      return othello.checkValidMove(this.board, row, col, color);
    },

    getValidMoves(color) {
      return othello.getValidMoves(this.board, color);
    },

    flipDiscs(row, col, color) {
      othello.flipDiscs(this.board, row, col, color);
    },

    makeMove(row, col) {
      // for (let i = 0; i < 8; ++i){
      //   var line = '';
      //   for (let j = 0; j < 8; ++j){
      //     line += this.board[j][i] + '\t';
      //   }
      //   console.log(line);
      // }
      if (!this.isValidMove(row, col)) {
        message.error('此位置不可落子');
        return;
      }

      this.count+=1;
      this.board[row][col] = this.currentPieceColor;
      this.flipDiscs(row, col, this.currentPieceColor);
      if (this.count == 64) {
        message.success('游戏结束');
        return;
      }
      this.currentPieceColor = this.currentPieceColor === 'white' ? 'black' : 'white';
      this.validMoves = this.getValidMoves(this.currentPieceColor);

      // 清除上一轮的可行棋标志
      this.board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell === 'valid') {
            this.board[rowIndex][colIndex] = null;
          }
        });
      });

      if (this.validMoves.length === 0) {
        message.error('当前玩家无法落子，跳过此回合');
        this.currentPieceColor = this.currentPieceColor === 'white' ? 'black' : 'white';
        this.validMoves = this.getValidMoves(this.currentPieceColor);
        if(this.validMoves.length === 0){
          message.success('游戏结束');
          return;
        }
      }

      this.validMoves.forEach(move => {
        if (this.board[move.row][move.col] === null) {
          this.board[move.row][move.col] = 'valid';
        }
      });
    },

    isValidMove(row, col) {
      return this.validMoves.some(move => move.row === row && move.col === col);
    },

    handleServerResponse(event) {
      const response = JSON.parse(event.data);
      this.board = response.board;
    },

    startTimer() {
      timer.startTimer(time => {
        this.timer = time;
      });
    },
  },

  created() {
    this.initializeBoard();
    this.validMoves = this.getValidMoves(this.currentPieceColor);
    this.initHint();
    // for (let valid in this.validMoves) {
    //   this.board[valid.row][valid.col] = 'valid';
    // }
    this.ws = websocket.createWebSocket('ws://127.0.0.1:8081', this.handleServerResponse);
  },

  mounted() {
    this.startTimer();
  },
};
  </script>
  
  <style scoped>
  .game-page {
    font-family: 'Arial', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center; /* 水平居中 */
    justify-content: center; /* 垂直居中 */
    min-height: 100vh; /* 确保整个页面的高度被占满 */
    padding: 10px;
  }

  .task-info {
    margin-bottom: 20px;
    text-align: center;
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
    margin-bottom: 20px;
  }

  .cell {
    width: 50px;
    height: 50px;
    cursor: pointer;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell.valid-move {
    background-color: #e3a541;
  }

  .chat-box {
    margin-top: 20px;
    width: 100%;
  }

  .messages {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 10px;
  }

  .send-message {
    display: flex;
    justify-content: space-between;
  }

  .send-message input {
    width: 80%;
  }

  /* 媒体查询 - 小屏幕设备适配 */
  @media (max-width: 600px) {
    .game-page {
      padding: 5px;
    }

    .board {
      grid-template-columns: repeat(8, 40px); /* 减小单元格大小 */
      grid-template-rows: repeat(8, 40px);
    }

    .cell {
      width: 40px;
      height: 40px;
    }

    .task-info h2 {
      font-size: 18px; /* 调整标题大小 */
    }

    .send-message input {
      width: 70%; /* 调整输入框的宽度 */
    }

    .messages {
      max-height: 150px; /* 限制聊天框的最大高度 */
    }

    /* .user-info {
      max-height: 100px;
      max-width: 100px;
    } */
  }

  /* 更小屏幕（例如手机）适配 */
  @media (max-width: 400px) {
    .task-info h2 {
      font-size: 16px; /* 更小的标题 */
    }

    .board {
      grid-template-columns: repeat(8, 35px); /* 更小的单元格大小 */
      grid-template-rows: repeat(8, 35px);
    }

    .cell {
      width: 35px;
      height: 35px;
    }

    .send-message input {
      width: 60%; /* 更窄的输入框 */
    }

    .messages {
      max-height: 120px; /* 更小的聊天框 */
    }
  }
</style>
