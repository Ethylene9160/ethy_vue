// timer.js
export default {
    startTimer(callback) {
      let timer = 30;
      const interval = setInterval(() => {
        if (timer > 0) {
          timer--;
          callback(timer); // 更新剩余时间
        } else {
          clearInterval(interval);
        }
      }, 1000);
    }
  };
  