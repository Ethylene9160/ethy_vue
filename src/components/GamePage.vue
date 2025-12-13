<template>
    <div class="game-page">
      <div class="task-info">
        <h2>Reversi</h2>
        <div class="task-details">
          <div class="avatar"></div>
          <div class="current-piece">
            <span :style="{ backgroundColor: currentPieceColor === 0 ? 'white' : 'black' }"></span>
          </div>
          <div class="timer">{{ timer }}s</div>
        </div>
      </div>
  
      <div class="game-board">
        <div class="board">
          <div class="row" v-for="(row, rowIndex) in othe.board" :key="rowIndex">
            <div
              class="cell"
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              :style="{ backgroundColor: cell === 1 ? 'black' : cell === 0 ? 'white' : cell === 2 ? '#e3a541':'lightgray' }"
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
          <button @click="restart">重新开始</button>
          <button @click="regret">悔棋</button>
          <button @click="changeMode">切换AI</button>
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
  import {Othello} from '../js/games/othello/othello.js';
  import timer from '../js/utils/timer.js';
  import websocket from '../js/utils/websocket.js';
  import {message} from 'ant-design-vue';
  const WHITE = 0;
  const BLACK = 1;
  const VALID = 2;
  const EMPTY = -1;
  export default {
  name: 'GamePage',

  data() {
    return {
      timer: 30,
      currentPieceColor: WHITE,
      othe: new Othello(0),
      validMoves: [],
      userName: localStorage.getItem('user_name'),
      userInfo: localStorage.getItem('user_info'),
      ws: null,
      aiThinking: false,
    };
  },

  methods: {
    initializeBoard() {
      this.othe.init_board();
    },

    checkValidMove(row, col, color) {
      return this.othe.checkValidMove(row, col, color);
    },

    getValidMoves(color) {
      return this.othe.getValidMoves(color);
    },

    flipDiscs(row, col, color) {
      this.othe.flipDiscs(row, col, color);
    },

    makeMove(row, col) {
      if (!this.isValidMove(row, col)) {
        message.error('此位置不可落子');
        return;
      }

      this.flipDiscs(row, col, this.currentPieceColor);

      if (this.othe.isOver()) {
        message.success('游戏结束');
        return;
      }
      this.currentPieceColor = this.currentPieceColor === WHITE ? BLACK : WHITE;
      this.validMoves = this.getValidMoves(this.currentPieceColor);

      if (this.validMoves.length === 0) {
        message.error('当前玩家无法落子，跳过此回合');
        this.currentPieceColor = this.currentPieceColor === WHITE ? BLACK : WHITE;
        this.validMoves = this.getValidMoves(this.currentPieceColor);
        if(this.validMoves.length === 0){
          message.success('游戏结束');
          return;
        }
      }

      this.validMoves.forEach(move => {
        if (this.othe.board[move.row][move.col] === EMPTY) {
          this.othe.board[move.row][move.col] = VALID;
        }
      });

      // 如果是 AI 模式，并且此时轮到 AI，就延迟走一步
      if (this.othe.mode) {   // 这里按你实际字段名替换
        // 假设 human 固定是 WHITE，AI 是 BLACK（或你自定义）
        // const isAITurn = (this.currentPieceColor); // 例子：AI=黑
        // if (isAITurn) {
        this.aiStepWithDelay();
        // }
      }


    },

    isValidMove(row, col) {
      return this.validMoves.some(move => move.row === row && move.col === col);
    },

    handleServerResponse(event) {
      const response = JSON.parse(event.data);
      // this.board = response.board;
    },

    startTimer() {
      timer.startTimer(time => {
        this.timer = time;
      });
    },


    restart() {
      this.initializeBoard();
      this.currentPieceColor = WHITE;
      this.validMoves = this.getValidMoves(this.currentPieceColor);
      this.timer = 30;
      message.success('游戏已重新开始');
    },

    regret() {
      const prevColor = this.othe.regret();
      if (prevColor === EMPTY) {
        message.error('无法悔棋');
        return;
      }
      this.currentPieceColor = prevColor;
      this.validMoves = this.getValidMoves(this.currentPieceColor);
      message.success('悔棋成功');
    },

    changeMode() {
      this.othe.switchMode();
    },

    m_sleep_ms(ms){
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    async aiStepWithDelay() {
  if (this.aiThinking) return;
  this.aiThinking = true;

  try {
    // 暂停约 1 秒
    await this.m_sleep_ms(250);

    // AI 落子（会在 Othello 内部修改 board）
    this.othe.randomAIMove(1 - this.currentPieceColor);

    // 刷新棋盘 UI
    // this.forceBoardRefresh();

    // 结束判定
    if (this.othe.isOver()) {
      message.success('游戏结束');
      return;
    }

    // 切回人类
    this.currentPieceColor = this.currentPieceColor === WHITE ? BLACK : WHITE;
    this.validMoves = this.getValidMoves(this.currentPieceColor);

    // 让手处理（保持和你 makeMove 一致）
    if (this.validMoves.length === 0) {
      message.error('当前玩家无法落子，跳过此回合');
      this.currentPieceColor = this.currentPieceColor === WHITE ? BLACK : WHITE;
      this.validMoves = this.getValidMoves(this.currentPieceColor);

      if (this.validMoves.length === 0) {
        message.success('游戏结束');
        return;
      }
    }

    // 如果你仍然用 VALID 写进 board（不推荐，但先兼容）
    this.validMoves.forEach(move => {
      if (this.othe.board[move.row][move.col] === EMPTY) {
        this.othe.board[move.row][move.col] = VALID;
      }
    });

    // this.forceBoardRefresh();
  } finally {
    this.aiThinking = false;
  }
},
  },

  created() {
    this.initializeBoard();
    this.validMoves = this.getValidMoves(this.currentPieceColor);
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
