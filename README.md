> 如果该项目对你有帮助，请点个star支持下吧！
> 
> 提示ssl不安全是因为证书为自建证书，为了解决浏览器无法录音问题的。点击`高级->继续访问`即可

## 体验地址
- pc端：https://www.wang-xiaowu.site/chat-gpt
- 移动端可使用浏览器扫描如下二维码进入

<a href="https://cdn.jsdelivr.net/gh/wang-xiaowu/picture_repository@master/chat-gpt-qrcode.png">
  <img align="center" src="https://cdn.jsdelivr.net/gh/wang-xiaowu/picture_repository@master/chat-gpt-qrcode.png" width="300px"/>
</a>

## 技术沟通群
<img src="https://raw.githubusercontent.com/wang-xiaowu/picture_repository/master/behappy_group.jpg" width="300px">

## 效果图
### 移动端
![](https://cdn.jsdelivr.net/gh/wang-xiaowu/picture_repository@master/chat-gpt-mobile.gif)

### PC端
![](https://github.com/wang-xiaowu/picture_repository/blob/master/chat-gpt-pc.gif?raw=true)

## 公告
> 我的免费额度已经到期，目前在自费买apiKey的使用额度。
> 
> 所以为了防止滥用，加了用户注册认证流程（注：新注册账号需要经过验证，可以加群并@我）


## TODO
- [x] 图片生成
- [x] 语音识别
- [x] 上下文联系
- [x] stream流式应答，实现打字机效果
- [x] 从开发到部署应用的文档梳理，希望可以帮助到一些人
  - blog：https://wang-xiaowu.github.io/posts/2a9d73ff/
  - 视频教程：https://www.bilibili.com/video/BV1ys4y1N7Nk/
  - 离线文档可在群内置顶获取
- [ ] Fine-tune
- [ ] prompt优化 - 长期

## BeHappy 智能助理
- 内置openAPI key
- 无需代理，可供国内用户访问
- 语音识别
- 图片生成（希望应答图片的话，发送方需要以`图片:`开头，例如`图片:变形金刚`）

## 部署

### 准备好一台能连接 `https://api.openai.com/v1` 地址的服务器

### 运行脚本
> 此处提供shell脚本，保存为sh结尾文件，一键运行即可(此处以centos举例，视情况更改包管理器指令。记得替换下文中标识的环境变量)
>
> 这里提供个免费的redis云数据库：https://app.redislabs.com/


```shell
#!/usr/bin/env bash
export NODE_ENV=master
export SYS_PORT=4000
export SYS_SAVE_POINT="/tmp/"
export SECRET_KEY="xxx"
export CHAT_GPT_HOST="https://api.openai.com/v1"
export OPEN_API_KEY="sk-xxx"
export REDIS_HOST="xxx"
export REDIS_PORT=3306
export REDIS_PASSWORD="xxx"
yum update -y && yum install -y git && git clone https://github.com/behappy-project/behappy-chatgpt-assistant.git \
&& curl -fsSL https://rpm.nodesource.com/setup_16.x | bash - && yum install -y nodejs \
&& npm install -g n && n 16.0.0-tls && npm install -g pm2 \
&& cd behappy-chatgpt-assistant && npm install && npm run pm2 && pm2 logs behappy-chatgpt-assistant
```

### 访问

- 访问地址：`http://ip:4000/chat-gpt`
- 服务运行状况可使用pm2进行查看，具体指令可查看：https://www.jiyik.com/w/pm2

### 问题
Chrome 高版本中非https无法打开摄像头和录音功能
1. 在Chrome搜索栏中输入`chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. 查找`Insecure origins treated as secure`属性
3. 添加你要信任的origin 例如：`http://www.wang-xiaowu.site`
4. 右侧选择`Enable`
5. 然后点击右下角的`Relaunch`

## 本地开发

### 版本要求

> Nodejs >= 16.x

### clone当前仓库地址
> 执行`git clone https://github.com/behappy-project/behappy-chatgpt-assistant.git`

### 自建本地配置文件

> 路径：config/local.json，内容如下：

```json
{
  "sys": {
    "port": "4000",
    "savePoint": "D://",
    "secretKey": "xxx"
  },
  "chatGpt": {
    "host": "https://api.openai.com/v1",
    "key": "sk-xxx"
  },
  "redis": {
    "host": "xxx",
    "port": 3306,
    "password": "xxx"
  }
}
```
### 配置proxy
> 境内访问需要配置proxy，详见代码lib/openai.js-15行

### 启动
> 根目录执行 `npm run start`

### 访问
> 访问地址：`http://localhost:4000/chat-gpt`

更新中。。。
