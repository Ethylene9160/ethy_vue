<template>
  <div class="hall">
    <h1>Welcome to Othello Game!</h1>
    <button @click="checkLoginStatus" class="btn-start">进入游戏</button>
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
    }
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
  background-color: #48c9b0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-start:hover {
  background-color: #1abc9c;
}
</style>
