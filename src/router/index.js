// router/index.js

import { createRouter, createWebHashHistory } from 'vue-router';
import HallPage from '../components/HalloPage.vue'; // 欢迎页面
import GamePage from '../components/GamePage.vue'; // 黑白棋页面
import LoginPage from '../components/LoginPage.vue'; // 登录页面

const routes = [
  { path: '/', component: HallPage },
  { path: '/game', component: GamePage },
  { path: '/login', component: LoginPage },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
