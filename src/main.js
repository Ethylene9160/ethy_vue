import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 引入 Vue Router

const app = createApp(App);

// 使用 Vue Router 插件
app.use(router);

// 挂载 Vue 实例
app.mount('#app');
