// 全局消息队列
global.globalQueue = {};

function sendMessage(userId, msg) {
  let queue = this.globalQueue[userId];
  if (!queue) {
    queue = [];
    this.globalQueue[userId] = queue;
  }
  queue.push(msg);
}

function processMessage(userId, handleMessage) {
  const queue = this.globalQueue[userId];
  if (!queue) {
    return;
  }
  // 从该用户队列取消息
  const msg = queue.shift();
  handleMessage(userId, msg);
}

export {
  sendMessage,
  processMessage,
};
