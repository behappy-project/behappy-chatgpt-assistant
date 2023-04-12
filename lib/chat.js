module.exports = () => async (ctx, next) => {
  try {
    ctx.websocket.on('message', async (message) => {
      const params = JSON.parse(message);
      if (!params || !params.data) {
        return;
      }
      ctx.log.debug(__filename, '[messageEvent] Request type:', params.type, ' Request data:', params.data);
      if (params.type === 'message') {
        await messageEvent(ctx, params.data);
      }
    });
  } catch (e) {
    ctx.log.error(e.message);
    ctx.websocket.send(e.message);
  } finally {
    await next();
  }
};

// 监听消息
async function messageEvent(ctx, params) {
  let systemContent = '';
  if (params.systemStyle === 'cartoon') {
    systemContent = '现在你是一名动漫爱好者';
  } else if (params.systemStyle === 'moview') {
    systemContent = '现在你是一名电影爱好者';
  } else {
    systemContent = '现在你无所不知';
  }
  const streamResponse = await ctx.openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: systemContent,
      }, {
        role: 'user',
        content: params.msg,
      },
    ],
  }, {responseType: 'stream'});

  if (streamResponse.status !== 200) {
    ctx.log.error(streamResponse.statusText);
    return ctx.websocket.send(streamResponse.statusText);
  }
  streamResponse.data.on('data', (chunk) => {
    const lines = chunk
      .toString()
      .split('\n')
      .filter(line => line.trim()
        .startsWith('data: '));
    for (const line of lines) {
      const msg = line.replace(/^data: /, '');
      if (msg === '[DONE]') {
        // 客户端判断输出内容是否是`[DONE]`
        ctx.log.debug('内容结束...');
        return ctx.websocket.send('[DONE]');
      }

      const json = JSON.parse(msg);
      const token = json.choices[0].delta.content;
      if (token) {
        ctx.log.debug('发送...', token);
        ctx.websocket.send(token);
      }
    }
  });
}
