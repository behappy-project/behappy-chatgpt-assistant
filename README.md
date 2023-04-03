> 欢迎“一键三连[watch,fork,star]”
## 技术沟通群
<img src="https://raw.githubusercontent.com/wang-xiaowu/picture_repository/master/behappy_group.jpg" width="300px">

## TODO
- [x] 购买域名
- [x] 解决 Vercel 在国内无法访问的问题
- [ ] prompt优化
- [ ] 图片功能
- [ ] 调教

## 版本要求
> Nodejs >= 18.x

## ChatGPT 桌面助理
- 提供exe程序，直接下载，无需安装即可使用
- 内置openAPI key
- 无需代理，可供国内用户访问

## 开发
### 桌面端
- clone桌面端仓库，地址：https://github.com/behappy-project/behappy-chatgpt-aardio
- 下载aardio：https://www.aardio.com/
- 直接双击`main.aardio`进入，点击运行即可
![image](https://user-images.githubusercontent.com/44340137/229346448-3041ef54-c74f-4a06-a0a0-c8100c7dd6db.png)


### 服务端
- clone当前仓库地址
- 新建文件，路径：config/local.json，内容如下：
```json
{
  "sys": {
    "port": "3000"
  },
  "chatGpt": {
    "host": "https://api.openai.com/v1",
    "key": "sk-xxx"
  }
}
```
- 国内访问需要配置proxy，详见代码lib/openai.js-15行


## 效果图
![动画](https://user-images.githubusercontent.com/44340137/229051884-02b93ca5-3efb-4c54-9679-e61a15b9c456.gif)


更新中。。。
