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
    // const systemContent = getSystemContent(params.systemStyle);
    // const streamResponse = await serverCfg.openai.createChatCompletion({
    //   model: 'gpt-3.5-turbo',
    //   stream: true,
    //   messages: [
    //     {
    //       role: 'system',
    //       content: systemContent,
    //     }, {
    //       role: 'assistant',
    //       content: params.msg,
    //     },
    //   ],
    // }, {responseType: 'stream'});
    // if (streamResponse.status !== 200) {
    //   serverCfg.log.error(streamResponse.statusText);
    //   ctx.send('QueryError', streamResponse.statusText);
    //   return;
    // }
    // 异步执行
    setTimeout(() => {
      // streamResponse.data.on('data', (chunk) => {
      //   try {
      //     const lines = chunk
      //       .toString()
      //       .split('\n')
      //       .filter(line => line.trim()
      //         .startsWith('data: '));
      //     for (const line of lines) {
      //       const msg = line.replace(/^data: /, '');
      //       if (msg === '[DONE]') {
      //         // 客户端判断输出内容是否是`[DONE]`
      //         serverCfg.log.debug('内容结束...');
      //         ctx.queue.push('[DONE]');
      //       } else {
      //         const json = JSON.parse(msg);
      //         const token = json.choices[0].delta.content;
      //         if (token) {
      //           serverCfg.log.debug('发送...', token);
      //           ctx.queue.push(token);
      //         }
      //       }
      //     }
      //   } catch (e) {
      //     serverCfg.log.error(e.stack);
      //     ctx.queue.push(e.stack);
      //     ctx.queue.push('[DONE]');
      //   }
      // });
      // eslint-disable-next-line max-len
      const lines = ['`', '`', '`', 'j', 's', '\n', 'a', 'l', 'e', 'r', 't', '(', '1', ')', '\n', '`', '`', '`', '[DONE]'];
      for (const msg of lines) {
        if (msg === '[DONE]') {
          // 客户端判断输出内容是否是`[DONE]`
          serverCfg.log.debug('内容结束...');
          ctx.sendMessage(ctx.user.username, '[DONE]');
        } else {
          const token = msg;
          if (token) {
            serverCfg.log.debug('发送...', token);
            ctx.sendMessage(ctx.user.username, token);
          }
        }
      }
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
