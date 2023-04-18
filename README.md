> 欢迎“一键三连[watch,fork,star]”
> 
> 体验地址：http://www.wang-xiaowu.site
## 技术沟通群
<img src="https://raw.githubusercontent.com/wang-xiaowu/picture_repository/master/behappy_group.jpg" width="300px">

## TODO
- [x] 图片功能
- [x] 语音识别
- [x] 上下文联系
- [x] stream流式应答，实现打字机效果
- [x] 从开发到部署应用的文档梳理，希望后续可以帮助到一些人
  - blog：https://wang-xiaowu.github.io/posts/2a9d73ff/
  - 视频教程：https://www.bilibili.com/video/BV1ys4y1N7Nk/
  - 离线文档可在群内置顶获取
- [ ] Fine-tune
- [ ] prompt优化 - 长期

## 版本要求
> Nodejs >= 18.x

## BeHappy 智能助理
- 内置openAPI key
- 无需代理，可供国内用户访问
- 希望应答图片的话，发送方需要以`图片:`开头，祥见效果图

## 问题
Chrome 高版本中非https无法打开摄像头和录音功能
1. 在Chrome搜索栏中输入`chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. 查找`Insecure origins treated as secure`属性
3. 添加你要信任的地址 例如：`http://www.wang-xiaowu.site`
4. 右侧选择`Enable`
5. 然后点击右下角的`Relaunch`

## 开发
- clone当前仓库地址
- 新建文件，路径：config/local.json，内容如下：
```json
{
  "sys": {
    "port": "4000",
    "savePoint": "D://"
  },
  "chatGpt": {
    "host": "https://api.openai.com/v1",
    "key": "sk-xxx"
  }
}
```
- 境内访问需要配置proxy，详见代码lib/openai.js-15行
- 执行 npm run start


## 效果图
![动画](https://raw.githubusercontent.com/wang-xiaowu/picture_repository/master/behappy-chatgpt-assistant.gif)



更新中。。。
