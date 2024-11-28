// websocket.js
export default {
    createWebSocket(url, onMessageCallback) {
      const ws = new WebSocket(url);
      ws.onopen = () => console.log('WebSocket 连接成功');
      ws.onmessage = onMessageCallback;
      return ws;
    },
  
    sendMoveToServer(ws, moveData) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(moveData));
      }
    }
  };
  