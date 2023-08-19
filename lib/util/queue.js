// 全局消息队列
const globalQueue = [];

// 发送消息时推入全局队列
function sendMessage(userId, msg) {
  globalQueue.push({
    userId,
    msg,
  });
}


// 处理消息
function handleMessage(userId, msg) {
}

// 按序处理消息
function processMessage() {
  if (globalQueue.length > 0) {
    const item = globalQueue.shift(); // 弹出
    handleMessage(item.userId, item.msg); // 处理消息
  }
}

// 循环调用处理
setInterval(processMessage, 100);

