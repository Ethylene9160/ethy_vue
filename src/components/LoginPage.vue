<template>
  <div class="login">
    <h1 v-if="!isLoggedIn">登录</h1>
    
    <!-- 如果已登录，显示用户信息和注销按钮 -->
    <div v-if="isLoggedIn">
      <p>欢迎回来，{{ userName }}!</p>
      <p>用户信息：{{ userInfo }}</p>
      <button @click="logout">注销</button>&nbsp;<button @click="this.$router.push('/')">上一页</button>
    </div>
    
    <!-- 如果未登录，显示登录表单 -->
    <div v-if="!isLoggedIn">
      <p><input v-model="username" type="text" placeholder="用户名" /></p>
      <p><input v-model="password" type="password" placeholder="密码" /></p>
      <p><button @click="login">登录</button></p>
    </div>
  </div>
</template>

<script>
import sha256 from 'js-sha256';
import { message } from 'ant-design-vue';

export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
      ws: null, // WebSocket实例
      isLoggedIn: false, // 是否已登录
      userName: '', // 用户名
      userInfo: '', // 用户信息
    };
  },
  methods: {
    // 连接到WebSocket服务器
    connectWebSocket() {
      this.ws = new WebSocket('ws://127.0.0.1/ethy_vue/user');
      this.ws.onopen = () => {
        console.log('WebSocket连接成功');
      };
      this.ws.onmessage = this.handleLoginResponse;
      this.ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
      };
    },

    // 处理服务器返回的登录响应
    handleLoginResponse(event) {
      const response = JSON.parse(event.data);
      if (response.state === 'success') {
        localStorage.setItem('isLoggedIn', true);
        localStorage.setItem('user_name', response.user_name);
        localStorage.setItem('user_info', response.user_info);
        this.isLoggedIn = true;
        this.userName = response.user_name;
        this.userInfo = response.user_info;
        message.success(localStorage.getItem('user_name') + '，欢迎回来！');
        this.$router.push('/');
      } else {
        message.error('登录失败，请检查用户名和密码');
      }
    },

    // 登录方法，使用SHA-256加密密码
    login() {
      // 检查是否输入帐号和密码
      if (!this.username || !this.password) {
        message.error('请输入用户名和密码');
        return;
      }

      if(this.password == "123456"){
        // default testing password
        localStorage.setItem('isLoggedIn', true);
        this.userName = "Administrator";
        localStorage.setItem('user_name', this.userName);
        localStorage.setItem('user_info', 'I am administrator!');
      }
      // SHA-256 加密密码
      const hashedPassword = sha256(this.password);

      // 发送 WebSocket 请求到服务器
      const ws = new WebSocket('ws://127.0.0.1/ethy_vue/user');
      // 检测 WebSocket 连接状态，连接失败则弹出服务器连接失败窗口
      ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        message.error('服务器连接失败');

        // 没联网，则进入调试状态
        localStorage.setItem('isLoggedIn', true);
        localStorage.setItem('user_name', 'user 233');
        localStorage.setItem('user_info', 'I am administrator!');
        this.isLoggedIn = true;
        this.userName = localStorage.getItem('user_name');
        this.userInfo = localStorage.getItem('user_info');
        message.success(localStorage.getItem('user_name') + '，欢迎回来！');
        this.$router.push('/');
      };
      
      ws.onopen = () => {
        const loginData = {
          action: 'login',
          account: this.username,
          pwd: hashedPassword, // 使用加密后的密码
        };
        ws.send(JSON.stringify(loginData));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.state === 'success') {
          // 处理登录成功
          localStorage.setItem('user_name', response.user_name);
          localStorage.setItem('user_info', response.user_info);
          this.isLoggedIn = true;
          this.userName = response.user_name;
          this.userInfo = response.user_info;
          this.$router.push('/');
        } else {
          message.error('登录失败');
        }
      };
    },

    // 注销方法，清除登录状态
    logout() {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_info');
      this.isLoggedIn = false;
      this.userName = '';
      this.userInfo = '';
      message.success('已注销');
      this.$router.push('/login');
    },

    // 检查是否已经登录
    checkLoginStatus() {
      if (localStorage.getItem('isLoggedIn')) {
        this.isLoggedIn = true;
        this.userName = localStorage.getItem('user_name');
        this.userInfo = localStorage.getItem('user_info');
      }
      // const isLoggedIn = localStorage.getItem('isLoggedIn');
      // if (isLoggedIn) {
      //   this.isLoggedIn = true;
      //   this.userName = localStorage.getItem('user_name');
      //   this.userInfo = localStorage.getItem('user_info');
      // }
    }
  },
  mounted() {
    // 页面加载时检查是否已登录
    this.checkLoginStatus();
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  },
};
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

.btn-start {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}

.btn-start:hover {
  background-color: #45a049;
}
</style>
