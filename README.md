> 欢迎“一键三连[watch,fork,star]”
## 技术沟通群
<img src="https://raw.githubusercontent.com/wang-xiaowu/picture_repository/master/behappy_group.jpg" width="300px">

## TODO
- [x] 部署Vercel
- [x] 购买域名，解决 Vercel 在国内无法访问的问题
- [x] 图片功能
- [x] prompt优化，联系上下文
- [x] stream流式应答，实现打字机效果
- [ ] 从开发到部署应用的文档梳理，希望后续可以帮助到一些人

## 版本要求
> Nodejs >= 18.x

## ChatGPT 桌面助理
- 提供exe程序，直接下载，无需安装即可使用
- 内置openAPI key
- 无需代理，可供国内用户访问
- 希望应答图片的话，发送方需要以`图片:`开头，祥见效果图

## 开发
### 桌面端
- clone桌面端仓库，地址：https://github.com/behappy-project/behappy-chatgpt-aardio
- 下载aardio：https://www.aardio.com/
- 直接双击`main.aardio`进入，点击运行即可


### 服务端
- clone当前仓库地址
- 新建文件，路径：config/local.json，内容如下：
```json
{
  "sys": {
    "port": "4000"
  },
  "chatGpt": {
    "host": "https://api.openai.com/v1",
    "key": "sk-xxx"
  }
}
```
- 国内访问需要配置proxy，详见代码lib/openai.js-15行


## 效果图
![动画](https://user-images.githubusercontent.com/44340137/230083471-7e5d8506-a680-44bf-b4ff-9de4498bc238.gif)



更新中。。。
