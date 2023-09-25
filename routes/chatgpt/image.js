import Router from 'koa-router';
import axios from 'axios';
import fs from 'fs';
import {serverCfg, sysCfg, envCfg} from '../../config';
import {filterDemoUser, incrQueryCount} from '../../lib/recordByQuery';

const router = Router({prefix: sysCfg.prefix + sysCfg.apiPrefix});
const host = 'https://www.wang-xiaowu.site';
router.post('/images/generations', filterDemoUser, incrQueryCount, async (ctx) => {
  const params = {...ctx.request.body};
  serverCfg.log.debug(__filename, '[imageGenerations] Request params:', params);
  try {
    const url = envCfg.wizModel.host;

    const payload = {
      prompt: params.prompt,
      steps: 50,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${envCfg.wizModel.key}`,
    };
    await axios.post(url, payload, {headers})
      .then((res) => {
        const base64Image = res.data.images[0];
        const imageBuffer = Buffer.from(base64Image, 'base64');
        const fileSuffix = `${Date.now()}.jpg`;
        const fileName = `${sysCfg.savePoint}/${fileSuffix}`;
        fs.writeFileSync(fileName, imageBuffer);
        ctx.send('Success', {
          data: `${host}/${fileSuffix}`,
          type: 'image',
        });
      })
      .catch((err) => {
        serverCfg.log.error(err);
        ctx.send('QueryError', err);
      });
  } catch (e) {
    serverCfg.log.error(e.stack);
    ctx.send('CallServiceError', e.stack);
  }
});

export default router;
