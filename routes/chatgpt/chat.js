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
    const response = await serverCfg.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemContent,
        }, {
          role: 'assistant',
          content: params.msg,
        },
      ],
    });
    if (response.status !== 200) {
      serverCfg.log.error(response.statusText);
      ctx.send('QueryError', response.statusText);
      return;
    }
    ctx.send('Success', {
      data: response.data.choices[0].message,
      type: 'chat',
    });
  } catch (e) {
    serverCfg.log.error(e.stack);
    ctx.send('CallServiceError', e.stack);
  }
});
