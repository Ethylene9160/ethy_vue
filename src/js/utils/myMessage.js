// notification.js
import { notification } from 'ant-design-vue';

export default {
  error(msg) {
    notification.error({
      message: '提示',
      description: msg,
      duration: 2, // 自动关闭
    });
  }
};
