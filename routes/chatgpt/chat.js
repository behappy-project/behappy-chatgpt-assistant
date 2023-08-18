import Router from 'koa-router';
import {serverCfg, sysCfg} from '../../config';
import {getSystemContent} from '../../lib/util';
import {incrQueryCount} from '../../lib/recordByQuery';

const router = Router({prefix: sysCfg.prefix + sysCfg.apiPrefix});

/* 聊天 */
export default router.post('/completions', incrQueryCount, async (ctx) => {
  const params = {...ctx.request.body};
  serverCfg.log.debug(__filename, '[createChatCompletion] Request params:', params);
  try {
    const systemContent = getSystemContent(params.systemStyle);
    const streamResponse = await serverCfg.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        {
          role: 'system',
          content: systemContent,
        }, {
          role: 'assistant',
          content: params.msg,
        },
      ],
    }, {responseType: 'stream'});
    if (streamResponse.status !== 200) {
      serverCfg.log.error(streamResponse.statusText);
      ctx.send('QueryError', streamResponse.statusText);
      return;
    }
    // 异步执行
    setTimeout(() => {
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
            serverCfg.log.debug('内容结束...');
          } else {
            const json = JSON.parse(msg);
            const token = json.choices[0].delta.content;
            if (token) {
              serverCfg.log.debug('发送...', token);
              ctx.queue.push(token);
            }
          }
        }
      });
      // const lines = ['```javascript\n'
      // + 'const express = require(\'express\')\n'
      // + 'const app = express()\n'
      // + 'const port = 3000\n'
      // + 'app.get(\'/\', (req, res) => {\n'
      // + '  res.send(\'Hello World\')\n'
      // + '})\n'
      // + 'app.listen(port, () => {\n'
      // // eslint-disable-next-line no-template-curly-in-string
      // + '  console.log(`http://localhost:${port}`)\n'
      // + '})\n'
      // + '```', '```js alert(1) ```', '[DONE]'];
      // for (const msg of lines) {
      //   if (msg === '[DONE]') {
      //     // 客户端判断输出内容是否是`[DONE]`
      //     serverCfg.log.debug('内容结束...');
      //     // ctx.sse.send('[DONE]');
      //     // ctx.sse.sendEnd();
      //     ctx.queue.push('[DONE]');
      //   } else {
      //     const token = msg;
      //     if (token) {
      //       serverCfg.log.debug('发送...', token);
      //       // ctx.sse.send(token);
      //       ctx.queue.push(token);
      //     }
      //   }
      // }
    }, 500);
    ctx.send('Success', {
      data: 'OK',
      type: 'chat',
    });
  } catch (e) {
    serverCfg.log.error(e.stack);
    ctx.send('CallServiceError', e.stack);
  }
});
