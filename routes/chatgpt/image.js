import Router from 'koa-router';
import {serverCfg, sysCfg} from '../../config';

const router = Router({prefix: sysCfg.prefix + sysCfg.apiPrefix});

router.post('/images/generations', async (ctx) => {
  const params = {...ctx.request.body};
  serverCfg.log.debug(__filename, '[imageGenerations] Request params:', params);
  if (params.prompt.length >= 10) {
    return ctx.send('QueryError', '图片描述超过限制');
  }
  try {
    const response = await serverCfg.openai.createImage({
      prompt: params.prompt,
      n: 1,
      size: '256x256',
    });
    if (response.status !== 200) {
      serverCfg.log.error(response.statusText);
      return ctx.send('QueryError', response.statusText);
    }
    const result = response.data.data[0].url;
    ctx.send('Success', result);
  } catch (e) {
    serverCfg.log.error(e.stack);
    ctx.send('CallServiceError', e.stack);
  }
});

export default router;
