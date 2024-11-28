<template>
  <div class="welcome">
    <h1>Hello, 欢迎来到我的网站！</h1>
    <button @click="goToHomePage" class="btn-go-home">查看主页</button>
  </div>
</template>

<script>
export default {
  name: 'WelcomePage',
  methods: {
    goToHomePage() {
      // 点击按钮后跳转到 gitio/index.html 页面
      window.location.href = '/gitio/index.html'; // 直接跳转
    }
  }
}
</script>

<style scoped>
/* 欢迎页面样式 */
.welcome {
  text-align: center;
  margin-top: 100px;
}

.btn-go-home {
  padding: 10px 20px;
  background-color: #48c9b0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-go-home:hover {
  background-color: #1abc9c;
}
</style>
