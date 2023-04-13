import Router from 'koa-router';
import fs from 'fs';
import {sysCfg} from '../../config';
import {getSystemContent} from '../../lib/util';

const router = Router({prefix: `${sysCfg.apiPrefix}/api`});

router.post('/audio/transcriptions', async (ctx) => {
  const params = ctx.request.body;
  ctx.log.debug(__filename, '[audioTranscriptions] Request params:', params);
  try {
    const base64String = params.msg;
    const {language} = params;
    const systemContent = getSystemContent(params.systemStyle, language);
    const buffer = Buffer.from(base64String, 'base64');
    const fileName = `${sysCfg.savePoint}/${Date.now()}.mp3`;
    // 将Buffer对象写入到mp3文件中
    await fs.writeFileSync(fileName, buffer);
    const response = await ctx.openai.createTranscription(
      fs.createReadStream(fileName),
      'whisper-1',
      systemContent,
      'json',
      0,
      language,
    );
    if (response.status !== 200) {
      ctx.log.error(response.statusText);
      return ctx.send('CallServiceError', response.statusText);
    }
    // 响应内容
    const {text} = response.data;
    ctx.log.debug('audio响应信息:', text);
    ctx.send('Success', text);
  } catch (e) {
    ctx.log.error(e.stack);
    ctx.send('CallServiceError', e.stack);
  }
});

export default router;
