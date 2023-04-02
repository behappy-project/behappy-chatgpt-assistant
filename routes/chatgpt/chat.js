import Router from 'koa-router';
import {sysCfg} from '../../config';

const router = Router({prefix: sysCfg.apiPrefix});

router.post('/completions', async (ctx) => {
    const params = {...ctx.request.body};
    ctx.log.debug(__filename, '[createChatCompletion] Request params:', params);
    try {
        const completion = await ctx.openai.createChatCompletion({
            model: params.model,
            messages: [{
                role: "user",
                content: params.content
            }],
        });
        if (completion.status !== 200) {
            ctx.log.error(completion.statusText)
            return ctx.send('QueryError', []);
        }
        let result = completion.data.choices[0].message;
        ctx.send('Success', result);
    } catch (e) {
        ctx.log.error(e.stack);
        ctx.send('CallServiceError');
    }
});

export default router;
