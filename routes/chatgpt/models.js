import Router from 'koa-router';
import {sysCfg} from '../../config';
const router = Router({prefix: sysCfg.apiPrefix});

router.get('/models', async (ctx) => {
    try {
        let result = await ctx.openai.listModels();
        if (result.status !== 200) {
            ctx.log.error(result.statusText)
            return ctx.send('QueryError', []);
        }
        ctx.send('Success', result.data.data);
    } catch (e) {
        ctx.log.error(e.stack);
        ctx.send('CallServiceError');
    }
});

export default router;
