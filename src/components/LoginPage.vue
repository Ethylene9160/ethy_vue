<template>
  <div class="login">
    <h1>登录</h1>
    <input v-model="username" type="text" placeholder="用户名" />
    <input v-model="password" type="password" placeholder="密码" />
    <button @click="login">登录</button>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    login() {
      // 简单的登录逻辑，登录成功后设置状态并跳转
      if (this.username && this.password) {
        localStorage.setItem('isLoggedIn', true);
        this.$router.push('/');
      } else {
        alert('请输入用户名和密码');
      }
    },
  },
}
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;
}

input {
  margin: 10px;
  padding: 10px;
  width: 200px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  background-color: #48c9b0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #1abc9c;
}
</style>
