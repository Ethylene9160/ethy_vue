<template>
  <div class="hall">
    <h1>Welcome to Othello Game!</h1>
    <button @click="checkLoginStatus" class="btn-start">进入游戏</button>
    <button @click="goToLoginPage" class="btn-start">登录</button>
  </div>
</template>

<script>
export default {
  name: 'HallPage',
  methods: {
    checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('isLoggedIn'); // 假设用 localStorage 记录登录状态
      if (!isLoggedIn) {
        alert('请先登录');
        this.$router.push('/login');
      } else {
        this.$router.push('/game');
      }
    },

    goToLoginPage() {
      this.$router.push('/login');
    },
  }
}
</script>

<style scoped>
.hall {
  text-align: center;
  margin-top: 100px;
}

.btn-start {
  padding: 10px 20px;
  background-color: #2D3C81;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-start:hover {
  background-color: #4EA4EF;
}
/* furina colors: 
#141521
#2D3C81
#4EA4EF
#DAE2ED
#937562

Enhanced:
#161824
#344291
#58A8EB
#DCE4EE
#A07D64
*/
</style>
