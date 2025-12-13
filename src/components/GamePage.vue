<template>
    <div class="game-page">
      <div class="task-info">
        <h2>Reversi</h2>
        <div class="task-details">
        <div class="score-box">
          【{{ this.othe.mode ? '人机' : '普通' }}】 白：黑 = {{ whiteScore }}：{{ blackScore }}
        </div>
          <div class="avatar"></div>
          <div class="current-piece">
            <span
              :class="currentPieceColor === 0 ? 'piece-white' : 'piece-black'"
              :style="{ backgroundColor: currentPieceColor === 0 ? COLORS.white : COLORS.black }"
            ></span>
          </div>
          <!-- <div class="timer">{{ timer }}s</div> -->
        </div>
      </div>
  
      <div class="game-board">
        <div class="board">
          <div class="row" v-for="(row, rowIndex) in othe.board" :key="rowIndex">
            <div
              class="cell"
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              :style="{ backgroundColor: 
                cell === 1 ? COLORS.black : 
                cell === 0 ? COLORS.white : 
                cell === 2 ? COLORS.valid : COLORS.cell,
                borderColor: current_row >= 0 && colIndex == current_col && rowIndex == current_row ? 
                COLORS.hint : COLORS.border }"
              @click="makeMove(rowIndex, colIndex)"
              :class="{ 'valid-move': validMoves.some(move => move.row === rowIndex && move.col === colIndex)}"
            ></div>
          </div>
        </div>
      </div>
  
      <div class="chat-box">

      <div class="btn-panel">
        <div class="btn-row">
          <button @click="restart" class="btn-othello">重新开始</button>
          <button @click="regret" class="btn-othello">悔棋</button>
        </div>

        <button @click="changeMode" class="btn-othello btn-wide">切换AI</button>
      </div>
        <!-- <div class="messages">
          <p>对手: 你好！</p>
          <p>我方: 加油！</p> 
        </div> -->
        <!-- <div class="send-message">
          <input v-model="chatMessage" type="text" placeholder="输入消息..." />
          <button class = 'btn-othello' @click="sendMessage">发送</button>
        </div> -->

      </div>

      <!-- <div class="user-info">
        <h2>用户信息</h2>
        <p>用户名: {{ userName }}</p>
        <p>积分: {{ userInfo }}</p>
      </div> -->
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
  export const COLORS = {
    border: '#8b9db2',
    // cell: 'lightgray',
    cell: '#6e8197',
    // border: '#ccc',
    // valid: '#e3a541',
    // valid: '#a0b4ca',
    valid: '#937562',
    white: '#ecf2f2',
    black: '#141521',
    // black: '#2D3C81',
    // hint: '#e6b057',
    hint: '#937562',
    // hint: '#a0b4ca',
    // hint_black: '#937562',
    // hint_white: '#2d3962',
  };
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
      chatMessage: '',
      current_row:-1,
      current_col:-1,
      COLORS,
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
      if (this.aiThinking){
        message.error('机器人正在思考中!');
        return;
      }
      if (this.othe.board[row][col] !== VALID) {
        message.error('此位置不可落子');
        return;
      }

      // clear marks on current row and col

      // update curret row and col
      this.current_row = row;
      this.current_col = col;

      // this.flipDiscs(row, col, this.currentPieceColor);
      var nextMoves = this.othe.updateBoard(row, col, this.currentPieceColor);
      console.log(`You move at (${row}, ${col}) with color ${this.currentPieceColor===WHITE?"WHITE":"BLACK"}`);
      if (this.othe.isOver()) {
        if(this.othe.getBlackCount() > this.othe.count + 4 - this.othe.getBlackCount()){
          message.success('游戏结束。黑方获胜！');
        } else if(this.othe.getBlackCount() < this.othe.count + 4 - this.othe.getBlackCount()){
          message.success('游戏结束。白方获胜！');
        } else {
          message.success('游戏结束。平局！');
        }
        return;
      }
      this.currentPieceColor = this.currentPieceColor === WHITE ? BLACK : WHITE;
      this.validMoves = this.getValidMoves(this.currentPieceColor);

      if (nextMoves === 0) {
        message.error('当前玩家无法落子，跳过此回合');
        this.currentPieceColor = this.currentPieceColor === WHITE ? BLACK : WHITE;
        this.validMoves = this.getValidMoves(this.currentPieceColor);
        if(this.validMoves.length === 0){
          message.success('游戏结束');
          return;
        }
        this.validMoves.forEach(move => {
          if (this.othe.board[move.row][move.col] === EMPTY) {
            this.othe.board[move.row][move.col] = VALID;
          }
        });
      }

      

      // 如果是 AI 模式，并且此时轮到 AI，就延迟走一步
      else if (this.othe.mode) {  
        // 假设 human 固定是 WHITE，AI 是 BLACK（或你自定义）
        // const isAITurn = (this.currentPieceColor); // 例子：AI=黑
        // if (isAITurn) {
        this.aiStepWithDelay();
        // }
      }


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
      this.current_row = -1;
      this.current_col = -1;
      message.success('游戏已重新开始');
      console.log('Game restarted');
    },

    regret() {
      if(this.aiThinking) {
        message.error('AI 正在思考，无法悔棋');
        return;
      }
      var prevColor = this.othe.regret();
      while(this.othe.mode && this.currentPieceColor === 1 - prevColor){
        prevColor = this.othe.regret();
      }
      if (prevColor === EMPTY) {
        message.error('无法悔棋');
        return;
      }
      this.current_row = this.othe.moves[this.othe.count][0];
      this.current_col = this.othe.moves[this.othe.count][1];
      
      this.currentPieceColor = prevColor;
      this.validMoves = this.getValidMoves(this.currentPieceColor);
      message.success('悔棋成功');
      console.log('Move regretted');
    },

    changeMode() {
      if(this.aiThinking) {
        message.error('请等待机器人结束思考再尝试切换。');
        return;
      }
      this.othe.switchMode();
    },

    m_sleep_ms(ms){
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    async aiStepWithDelay() {
      if (this.aiThinking) return;
      this.aiThinking = true;

      try {
        // 初始化 AI 玩家颜色
        let aiColor = this.currentPieceColor; 
        let aiShouldContinue = true;

        while (aiShouldContinue) {
          // 暂停约 250ms
          await this.m_sleep_ms(250);

          // AI 有合法走法，执行落子
          [this.current_row, this.current_col] = this.othe.randomAIMove(1 - aiColor);

          // 结束判定
          if (this.othe.isOver()) {
            if(this.othe.getBlackCount() > this.othe.count + 4 - this.othe.getBlackCount()){
              message.success('游戏结束。黑方获胜！');
            } else if(this.othe.getBlackCount() < this.othe.count + 4 - this.othe.getBlackCount()){
              message.success('游戏结束。白方获胜！');
            } else {
              message.success('游戏结束。平局！');
            }
            return;
          }

          // 判断对手是否有合法走法
          const newOpponentColor = aiColor === Othello.WHITE ? Othello.BLACK : Othello.WHITE;
          const opponentValidMoves = this.othe.getValidMoves(newOpponentColor);

          if (opponentValidMoves.length === 0) {
            // 对手无法落子，AI 继续下
            
            // 检查游戏是否结束（如果 AI 也无可走，则结束）
            const aiNewMoves = this.othe.getValidMoves(aiColor);
            if (aiNewMoves.length === 0) {
              message.success('游戏结束');
              return;
            }
            
            // AI 继续下一轮
            continue;
          } else {
            // 对手有合法走法，切换回合到对手（人类），停止 AI 循环
            this.validMoves = this.getValidMoves(1 - aiColor);
            
            aiShouldContinue = false;
            break;
          }
        }

        // 最终刷新一次棋盘
        // this.forceBoardRefresh();

      } catch (error) {
        console.error('AI 下棋出错:', error);
        message.error('AI 下棋出错');
      } finally {
        this.aiThinking = false;
        this.currentPieceColor = 1 - this.currentPieceColor;
        
      }
    },
  },

  computed: {
    blackScore() {
      return this.othe?.getBlackCount ? this.othe.getBlackCount() : 0;
    },
    whiteScore() {
      return this.othe?.count != null ? (this.othe.count + 4 - this.blackScore) : 0;
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
    background: rgb(22, 24, 36); /* 深蓝黑 */
  }

  .task-info {
    margin-bottom: 20px;
    text-align: center;
    color: #DAE2ED;
  }

  .current-piece span {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }

  /* 白棋：白色填充 + 黑色描边 */
  .piece-white {
    border: 2px solid #000;
  }

  /* 黑棋：黑色填充 + 白色描边 */
  .piece-black {
    border: 2px solid #fff;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(8, 50px);
    grid-template-rows: repeat(8, 50px);
    /* gap: 2px; */
    margin-bottom: 20px;
  }

  .cell {
    width: 44px;
    height: 44px;
    cursor: pointer;
    border: 3px solid #ccc;
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


  .btn-othello {
    padding: 10px 20px;
    background-color: #2f4170;
    color: #DAE2ED;
    border: none;
    /* border-radius: 5px; */
    cursor: pointer;
    font-size: 16px;
  }

  .btn-othello:hover {
    background-color: #DAE2ED;
    color: #2D3C81;
  }

  .btn-panel {
    width: min(398px, 92vw);
    padding: 1px 1px 1px;
    margin: 2px auto 0;

    /* border-radius: 18px; */
    background: rgba(45, 60, 129, 0.10);          /* 深蓝的淡底 */
    /* border: 1px solid rgba(218, 226, 237, 0.35);  浅蓝灰描边 */
    /* box-shadow: 0 10px 30px rgba(20, 21, 33, 0.22); */

    /* backdrop-filter: blur(6px); 有则更高级（不支持也不影响） */
  }

  .btn-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    margin-bottom: 1px;
  }

  .btn-wide {
    width: 100%;
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
      width: 34px;
      height: 34px;
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

    .score-box {
      margin: 8px 0 12px;
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      display: inline-block;
      /* background: #fff; */
      font-size: 16px;
      color: #d7dee9;
    }

    .btn-panel {
      width: min(318px, 92vw);
      padding: 1px 1px 1px;
      margin: 2px auto 0;

      border-radius: 12px;
      backdrop-filter: blur(5px); /* 有则更高级（不支持也不影响） */
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
      width: 29px;
      height: 29px;
    }

    .btn-panel {
      width: min(278px, 92vw);
      padding: 1px 1px 1px;
      margin: 2px auto 0;

      border-radius: 10px;
      backdrop-filter: blur(4px); /* 有则更高级（不支持也不影响） */
    }

    .send-message input {
      width: 60%; /* 更窄的输入框 */
    }

    .messages {
      max-height: 120px; /* 更小的聊天框 */
    }

  }
</style>
