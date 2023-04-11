const fs = require('fs');
const {sysCfg} = require('../config');

module.exports = () => async (ctx, next) => {
  try {
    ctx.websocket.on('message', async (message) => {
      const params = JSON.parse(message);
      if (!params || !params.data) {
        return;
      }
      ctx.log.debug(__filename, '[createChatCompletion] Request type:', params.type, ' Request data:', params.data);
      if (params.type === 'message') {
        await messageEvent(ctx, params.data);
      } else if (params.type === 'audio') {
        await audioEvent(ctx, params.data);
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
        style: 'system',
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

// 监听语音
async function audioEvent(ctx, params) {
  const base64String = params.msg;

  const buffer = Buffer.from(base64String, 'base64');
  const fileName = `${sysCfg.savePoint}/${Date.now()}.mp3`;
  // 将Buffer对象写入到mp3文件中
  await fs.writeFileSync(fileName, buffer);

  const response = await ctx.openai.createTranscription(
    fs.createReadStream(fileName),
    'whisper-1',
  );
  if (response.status !== 200) {
    ctx.log.error(response.statusText);
    return ctx.websocket.send('QueryError', response.statusText);
  }
  // 响应内容
  const {text} = response.data;
  await messageEvent(ctx, {
    msg: text,
    systemStyle: params.systemStyle,
  });
}
