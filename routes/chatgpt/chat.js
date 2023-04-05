module.exports = () => {
    return async (ctx, next) => {
        try {
            ctx.websocket.on('message', async function (message) {
                const params = message.toString()
                if (!params || params.length === 0) {
                    return
                }
                ctx.log.debug(__filename, '[createChatCompletion] Request params:', params);

                const streamResponse = await ctx.openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    stream: true,
                    messages: [{
                        role: "user",
                        content: params
                    }],
                }, {responseType: 'stream'});

                if (streamResponse.status !== 200) {
                    ctx.log.error(streamResponse.statusText)
                    return ctx.websocket.send(streamResponse.statusText);
                }
                streamResponse.data.on('data', chunk => {
                    const lines = chunk
                        .toString()
                        .split('\n')
                        .filter((line) => line.trim().startsWith('data: '))
                    for (const line of lines) {
                        const message = line.replace(/^data: /, '')
                        if (message === '[DONE]') {
                            // 客户端判断输出内容是否是`[DONE]`
                            ctx.log.debug('内容结束...')
                            return
                        }

                        const json = JSON.parse(message)
                        const token = json.choices[0].delta.content
                        if (token) {
                            ctx.log.debug('发送...', token)
                            ctx.websocket.send(token)
                        }
                    }
                })
            });

        } catch (e) {
            ctx.log.error(e.message)
            ctx.websocket.send(e.message)
        } finally {
            await next();
        }
    };
};


