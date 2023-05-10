import Router from 'koa-router';
import fs from 'fs';
import {serverCfg, sysCfg} from '../../config';
import {getSystemContent} from '../../lib/util';
import {incrQueryCount} from '../../lib/recordByQuery';

const router = Router({prefix: sysCfg.prefix + sysCfg.apiPrefix});

router.post('/audio/transcriptions', incrQueryCount, async (ctx) => {
  const params = ctx.request.body;
  serverCfg.log.debug(__filename, '[audioTranscriptions] Request params:', params);
  try {
    const base64String = params.msg;
    const {language} = params;
    const systemContent = getSystemContent(params.systemStyle, language);
    const buffer = Buffer.from(base64String, 'base64');
    const fileName = `${sysCfg.savePoint}/${Date.now()}.wav`;
    // 将Buffer对象写入到mp3文件中
    await fs.writeFileSync(fileName, buffer);
    const response = await serverCfg.openai.createTranscription(
      fs.createReadStream(fileName),
      'whisper-1',
      systemContent,
      'json',
      0,
      language,
    );
    if (response.status !== 200) {
      serverCfg.log.error(response.statusText);
      return ctx.send('CallServiceError', response.statusText);
    }
    // 响应内容
    const {text} = response.data;
    serverCfg.log.debug('audio响应信息:', text);
    ctx.send('Success', {
      data: text,
      type: 'audio',
    });
  } catch (e) {
    serverCfg.log.error(e.stack);
    ctx.send('CallServiceError', e.stack);
  }
});

export default router;
