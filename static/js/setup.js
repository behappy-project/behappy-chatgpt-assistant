
const canRecord = isMobile();
let recorder;
let audio;
let stopRecoderFlag = true;
let recordBlob;
const fileReader = new FileReader();
// 人设
const systemStyle = 'normal';
const recordLanguage = 'zh';
// session保存的消息
let sessionMsg = '';
const bot = new ChatSDK({
  config: {
    // 当支持语音时默认用语音输入
    inputType: canRecord ? 'voice' : 'text',
    navbar: {
      logo: 'https://gw.alicdn.com/tfs/TB1Wbldh7L0gK0jSZFxXXXWHVXa-168-33.svg',
      title: '浙江政务服务网',
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
    ],
    // 快捷短语
    quickReplies: [
      {
        code: 'movie',
        icon: 'message',
        name: '聊电影',
        isNew: true,
        isHighlight: true,
      },
      {
        code: 'cartoon',
        icon: 'message',
        name: '聊动漫',
        isNew: true,
        isHighlight: true,
      },
      {
        code: 'computer',
        icon: 'message',
        name: '聊计算机技术',
        isNew: true,
        isHighlight: true,
      },
    ],
    // 输入框占位符
    placeholder: '请输入...',
    // 侧边栏
    sidebar: [
      {
        title: '公告',
        code: 'richtext',
        data: {
          text:
                        '<p>这里是富文本内容，支持<a href="https://chatui.io/sdk/getting-started">链接</a>，可展示图片<img src="https://gw.alicdn.com/tfs/TB17TaySSzqK1RjSZFHXXb3CpXa-80-80.svg" /></p>',
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
                      stopRecoderFlag = false;
                    })
                    .catch((error) => {
                      console.error(error);
                      // toast.fail('请求失败，错误信息为：' + error);
                    });
      },
      onEnd() {
        if (!recorder || stopRecoderFlag) {
          // return toast.show('请先录音！');
          console.error('请先录音！');
          return;
        }
        console.info('录音结束...');
        recorder.stop();
        stopRecoderFlag = true;
        fileReader.readAsArrayBuffer(recordBlob);

        fileReader.onload = function () {
          console.info('发送录音中...');
          // 获取转换后的ArrayBuffer
          const arrayBuffer = this.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          // 将Uint8Array对象转换为base64编码的字符串
          const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
          // 识别到文本后要 ctx.postMessage
          ctx.postMessage({
            type: 'speech',
            content: {
              text: base64String,
            },
            quiet: true, // 不展示
          });
        };
        // 释放
        URL.revokeObjectURL(recordBlob);
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
     *
     * 解析请求返回的数据
     * @param {object} res - 请求返回的数据
     * @param {object} requestType - 请求类型
     * @return {array}
     */
    parseResponse(res, requestType) {
      console.log(requestType);
      console.log(res);
      if (requestType === 'send' && res.code === 0) {
        sessionMsg += (`${res.data.content}\n`);
        // 用 isv 消息解析器处理数据
        return [{
          _id: nanoid(), type: 'text', content: {text: res.data.content}, position: 'left',
        }];
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

bot.run();
