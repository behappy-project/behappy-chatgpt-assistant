import Router from 'koa-router';
import {sysCfg} from '../../config';
import sse from 'koa-sse-stream';
import {isEmptyObject} from "../../lib/utils";

const router = Router({prefix: sysCfg.apiPrefix});

router.get('/completions', sse(), async (ctx) => {
    const params = {...ctx.query, ...ctx.params};
    ctx.log.debug(__filename, '[createChatCompletion] Request params:', params);
    try {

        ctx.req.setTimeout(0);
        ctx.type = 'text/event-stream';
        ctx.set('Cache-Control', 'no-cache');
        ctx.set('Connection', 'keep-alive');

        if (!params || isEmptyObject(params) || params.content.length === 0) {
            return ctx.sse.sendEnd("Data Can Not Be Empty", 'UTF-8', () => {
                ctx.log.debug("Data Can Not Be Empty")
            })
        }
        const streamResponse = await ctx.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            stream: true,
            messages: [{
                role: "user",
                content: params.content
            }],
        }, {responseType: 'stream'});

        if (streamResponse.status !== 200) {
            return ctx.sse.sendEnd(streamResponse.statusText, 'UTF-8', () => {
                ctx.log.error(streamResponse.statusText)
            })
        }
        const stream = streamResponse.data
        stream.on('data', chunk => {
            const lines = chunk
                .toString('utf8')
                .split('\n')
                .filter((line) => line.trim().startsWith('data: '))

            for (const line of lines) {
                const message = line.replace(/^data: /, '')
                if (message === '[DONE]') {
                    // 客户端判断输出内容是否是`[DONE]`
                    ctx.sse.sendEnd('[DONE]', 'UTF-8', () => {
                        ctx.log.debug('内容结束...')
                    })
                    return
                }

                const json = JSON.parse(message)
                const token = json.choices[0].delta.content
                if (token) {
                    ctx.sse.send(token, 'UTF-8', () => {
                        ctx.log.debug('发送...', token)
                    })
                }
            }
        })
    } catch (e) {
        ctx.sse.sendEnd(e.stack, 'UTF-8', () => {
            ctx.log.error(e.stack);
        })
    }
});

export default router;
