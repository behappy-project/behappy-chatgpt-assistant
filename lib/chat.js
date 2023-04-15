import {getSystemContent} from './util';
import {serverCfg} from '../config';

export default class Chat {
  static async messageEvent(params, socket) {
    const systemContent = getSystemContent(params.systemStyle);
    const streamResponse = await serverCfg.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        {
          role: 'system',
          content: systemContent,
        }, {
          role: 'assistant',
          content: params.msg,
        },
      ],
    }, {responseType: 'stream'});

    if (streamResponse.status !== 200) {
      serverCfg.log.error(streamResponse.statusText);
      return socket.emit('resMsgEvent', streamResponse.statusText);
    }
    streamResponse.data.on('data', (chunk) => {
      const lines = chunk
        .toString()
        .split('\n')
        .filter(line => line.trim()
          .startsWith('data: '));
      for (const line of lines) {
        const msg = line.replace(/^data: /, '');
        if (msg === '[DONE]') {
          // 客户端判断输出内容是否是`[DONE]`
          serverCfg.log.debug('内容结束...');
          return socket.emit('resMsgEvent', '[DONE]');
        }

        const json = JSON.parse(msg);
        const token = json.choices[0].delta.content;
        if (token) {
          serverCfg.log.debug('发送...', token);
          socket.emit('resMsgEvent', token);
        }
      }
    });
  }
}
