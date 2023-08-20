// 全局消息队列
global.globalQueue = {};

function sendMessage(userId, msg) {
  let queue = global.globalQueue[userId];
  if (!queue) {
    queue = [];
    global.globalQueue[userId] = queue;
  }
  queue.push(msg);
}

function processMessage(userId, handleMessage) {
  const queue = global.globalQueue[userId];
  if (!queue) {
    return;
  }
  // 从该用户队列取消息
  const msg = queue.shift();
  if (msg) handleMessage(userId, msg);
}

export {
  sendMessage,
  processMessage,
};
