const canRecord = isMobile();
let recorder;
let audio;
let recordBlob;
const fileReader = new FileReader();
// 人设
let systemStyle = 'normal';
const recordLanguage = 'zh';
// session保存的消息
let sessionMsg = '';
const bot = new ChatSDK({
  components: {
    // 推荐主动指定 name 属性
    'adaptable-action-card': {
      name: 'AlimeComponentAdaptableActionCard',
      url: '//g.alicdn.com/alime-components/adaptable-action-card/0.1.7/index.js',
    },
  },
  config: {
    // 当支持语音时默认用语音输入
    inputType: canRecord ? 'voice' : 'text',
    navbar: {
      logo: '/chat-gpt/static/pic/navbar.jpg',
      title: 'BEHAPPY智能助理',
    },
    avatarWhiteList: ['knowledge', 'recommend'],
    // 机器人头像
    robot: {
      avatar: '/chat-gpt/static/pic/bot.jpg',
    },
    // 用户头像
    user: {
      avatar: '/chat-gpt/static/pic/mine.jpg',
    },
    toolbar: [
      {
        type: 'image', // 类型
        icon: 'image', // 图标（svg），与下面的 img 二选一即可
        title: '相册', // 名称
      },
    ],
    // 首屏消息
    messages: [
      {
        type: 'system',
        content: {
          text: 'BeHappy 智能助理进入对话',
        },
      },
      {
        type: 'text',
        content: {
          text: '主人好，我是 BeHappy 智能助理，你的贴心小助手~',
        },
      },
      {
        type: 'card',
        content: {
          code: 'adaptable-action-card',
          data: {
            title: '预设行为选择',
            picUrl: 'https://gw.alicdn.com/tfs/TB1FwxTGxnaK1RjSZFtXXbC2VXa-1200-800.jpg',
            content: '您好，请问是否需要选择我的预设行为？',
            actionList: [
              {
                text: '聊电影',
                action: 'click',
                style: 'primary',
                param: {
                  text: 'movie',
                },
              },
              {
                text: '聊动漫',
                action: 'click',
                style: 'primary',
                param: {
                  text: 'cartoon',
                },
              },
              {
                text: '聊计算机技术',
                action: 'click',
                style: 'primary',
                param: {
                  text: 'computer',
                },
              },
            ],
          },
        },
      },
      {
        type: 'card',
        content: {
          code: 'promotion',
          data: {
            array: [
              {
                image: '//gw.alicdn.com/tfs/TB1b4RpXkyWBuNjy0FpXXassXXa-150-400.png',
                toggle: '//gw.alicdn.com/tfs/TB1MsjiXntYBeNjy1XdXXXXyVXa-48-48.png',
                type: 'recommend',
                list: [
                  {
                    title: '你能为我做什么?',
                    hot: true,
                    content: '你能为我做什么?',
                  },
                  {
                    title: 'ChatGPT是什么?',
                    hot: true,
                    content: 'ChatGPT是什么?',
                  },
                  {
                    title: '什么是快乐星球?',
                    content: '什么是快乐星球?',
                  },
                ],
              },
            ],
          },
        },
      },
    ],
    // 快捷短语
    quickReplies: [
      {
        icon: 'message',
        name: '请推荐我一部电影',
        isNew: true,
        isHighlight: true,
      },
      {
        icon: 'message',
        name: '请推荐我一本书',
        isNew: true,
        isHighlight: true,
      },
      {
        icon: 'message',
        name: '请推荐我一部动漫',
        isNew: true,
        isHighlight: true,
      },
    ],
    // 输入框占位符
    placeholder: '请输入...',
    // 侧边栏
    sidebar: [
      {
        title: '公告栏',
        code: 'richtext',
        data: {
          text:
              '<div style="border: 1px solid #ccc; padding: 20px; border-radius: 10px;">\n'
            + '  <p>项目教程：<a href="https://wang-xiaowu.github.io/posts/2a9d73ff/" target="_blank" style="color: #0099cc; text-decoration: none; font-weight: bold;">点击跳转</a></p>\n'
            + '  <p>本项目仓库地址：<a href="https://github.com/behappy-project/behappy-chatgpt-assistant/" target="_blank" style="color: #0099cc; text-decoration: none; font-weight: bold;">点击跳转</a></p>\n'
            + '  <p>如果该项目对你有帮助，请点个 star 支持下吧！</p>\n'
            + '</div><br>\n'
            + '<div style="border: 1px solid #ccc; padding: 20px; border-radius: 10px;">\n'
            + '  <p style="font-weight: bold; margin-bottom: 5px;color: #0099cc;">功能描述：</p>\n'
            + '  <ul style="list-style-type: disc; margin-left: 20px;">\n'
            + '    <li>内置openAPI key</li>\n'
            + '    <li>无需代理，可供国内用户访问</li>\n'
            + '    <li>语音识别（仅移动端提供）</li>\n'
            + '    <li>图片生成（希望应答图片的话，发送方需要以<span style="color: #0099cc;">图片:</span>开头，例如<span style="color: #0099cc;">图片:变形金刚</span>）</li>\n'
            + '  </ul>'
            + '</div><br>\n'
            + '<div style="display: flex; justify-content: center; align-items: center;">\n'
            + '  <img src="https://cdn.jsdelivr.net/gh/wang-xiaowu/picture_repository@master/behappy_group.jpg" alt="技术沟通群" style="width: 230px; height: 250px; border-radius: 10px;">\n'
            + '</div>',
        },
      },
    ],
  },
  makeRecorder({ctx}) {
    return {
      // 是否支持语音输入，
      canRecord,
      onStart() {
        navigator.mediaDevices.getUserMedia({audio: true})
                    .then((stream) => {
                      console.log('开始录音');
                      recorder = new MediaRecorder(stream);
                      audio = new Audio();
                      const chunks = [];

                      recorder.ondataavailable = (e) => {
                        chunks.push(e.data);
                      };

                      recorder.onstop = () => {
                        recordBlob = new Blob(chunks, {type: 'audio/mp3'});
                        audio.src = URL.createObjectURL(recordBlob);
                      };
                      recorder.start();
                    })
                    .catch((error) => {
                      console.error(error);
                      // toast.fail('请求失败，错误信息为：' + error);
                      bot.getCtx().appendMessage({
                        type: 'text',
                        content: {
                          text: error,
                        },
                        position: 'left',
                      });
                    });
      },
      onEnd() {
        console.info('录音结束...');
        recorder.stop();
        // 此处的延迟函数是为了保证上面的recorder.onstop在以下逻辑之前执行
        setTimeout(() => {
          fileReader.readAsArrayBuffer(recordBlob);
          // 释放
          URL.revokeObjectURL(recordBlob);
        }, 100);
      },
      onCancel() {
        console.log('取消录音');
        // 释放
        URL.revokeObjectURL(recordBlob);
      },
    };
  },
  requests: {
    baseUrl,
    /**
         *
         * 问答接口
         * @param {object} msg - 消息
         * @param {string} msg.type - 消息类型
         * @param {string} msg.content - 消息内容
         * @return {object}
         */
    send(msg) {
      const data = msg.content;
      let val = data.text;
      // 发送文本消息时
      if (msg.type === 'text') {
        // 需要图片生成
        if (val.startsWith('图片:')) {
          val = val.substr(3);
          return {
            url: '/images/generations',
            type: 'POST',
            headers: {
              Authorization: token(),
            },
            data: {
              prompt: val,
            },
          };
        }
        // 处理sessionMsg，保证上下文;
        sessionMsg += `你: ${val}\nAI:`;
        return {
          url: '/completions',
          type: 'POST',
          headers: {
            Authorization: token(),
          },
          data: {
            msg: sessionMsg,
            systemStyle,
            language: recordLanguage,
          },
        };
      }
      // 语音类型
      if (msg.type === 'speech') {
        return {
          url: '/audio/transcriptions',
          type: 'POST',
          headers: {
            Authorization: token(),
          },
          data: {
            msg: val,
            systemStyle,
          },
        };
      }
    },
  },
  handlers: {
    /**
     * 可通过配置  handlers.track  来处理埋点，当 SDK 及卡片有埋点事件触发时都会透出到此函数中。如果有落库、数据分析等需求时，可将数据传到相应的后端接口。
     * @param data
     */
    track(data) {
      if (data.c === 'adaptable-action-card' && data.act === 'click') {
        systemStyle = data.text;
        bot.getCtx().appendMessage({
          type: 'text',
          content: {
            text: `您已选择预设行为：${systemStyle}`,
          },
          position: 'left',
        });
      }
    },
    /**
     *
     * 解析请求返回的数据
     * @param {object} res - 请求返回的数据
     * @param {object} requestType - 请求类型
     * @return {array}
     */
    parseResponse(res, requestType) {
      if (requestType === 'send') {
        if (res.code === 0) {
          const {data: response} = res;
          switch (response.type) {
            case 'chat':
              sessionMsg += (`${response.data.content}\n`);
              // 用 isv 消息解析器处理数据
              return [{
                _id: nanoid(), type: 'text', content: {text: response.data.content}, position: 'left',
              }];
            case 'image':
              // 用 isv 消息解析器处理数据
              return [{
                _id: nanoid(), type: 'image', content: {picUrl: response.data}, position: 'left',
              }];
            case 'audio':
              sessionMsg += `你: ${response.data}\nAI:`;
              // 将语音识别内容发送回去
              bot.getCtx().postMessage({
                type: 'text',
                content: {
                  text: response.data,
                },
                quiet: true, // 不展示
              });
              // 用 isv 消息解析器处理数据
              return [{
                _id: nanoid(), type: 'text', content: {text: response.data}, position: 'right',
              }];
            default:
              break;
          }
        } else {
          // 用 isv 消息解析器处理数据
          return [{
            _id: nanoid(), type: 'text', content: {text: res.error}, position: 'left',
          }];
        }
      }
    },
    onToolbarClick(item, ctx) {
      if (item.type === 'image') {
        ctx.util.chooseImage({
          // multiple: true, // 是否可多选
          success(e) {
            if (e.files) { // 如果有 h5 上传的图
              const file = e.files[0];
              // 先展示图片
              ctx.appendMessage({
                type: 'image',
                content: {
                  picUrl: URL.createObjectURL(file),
                },
                position: 'right',
              });

              // todo
              ctx.appendMessage({
                type: 'text',
                content: {
                  text: '抱歉，图片解析功能暂未实现！',
                },
                position: 'left',
              });
              // 发起请求，具体自行实现，这里以 OCR 识别后返回文本为例
              // requestOcr({ file }).then(res => {
              //     ctx.postMessage({
              //         type: 'text',
              //         content: {
              //             text: res.text
              //         },
              //         quiet: true // 不展示
              //     });
              // });
            } else if (e.images) { // 如果有 app 上传的图
              // ..与上面类似
            }
          },
        });
      }
    },
  },
});

fileReader.onload = function () {
  console.info('发送录音中...');
  // 获取转换后的ArrayBuffer
  const arrayBuffer = this.result;
  const uint8Array = new Uint8Array(arrayBuffer);
  // 将Uint8Array对象转换为base64编码的字符串
  const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
  // 识别到文本后要 ctx.postMessage
  bot.getCtx().postMessage({
    type: 'speech',
    content: {
      text: base64String,
    },
    quiet: true, // 不展示
  });
};

bot.run();
