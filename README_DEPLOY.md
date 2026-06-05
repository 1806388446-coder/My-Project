# 云端部署说明

这个项目是纯静态网站，入口文件是 `index.html`，样式和脚本分别是 `styles.css`、`app.js`，资源都在 `assets/`。

## 推荐方式：Netlify Drop

1. 打开 Netlify Drop：https://app.netlify.com/drop
2. 登录 Netlify。
3. 把整个项目文件夹拖进去，或者拖入 `deploy-package.zip`。
4. 发布完成后，Netlify 会给你一个 `*.netlify.app` 的公网访问地址。

更新网站时，重新上传最新文件夹或新的 `deploy-package.zip` 即可。

## 也可以用 Vercel

如果你已经安装 Node.js，可以在项目根目录运行：

```bash
npx vercel
```

第一次按提示登录并创建项目。以后正式发布运行：

```bash
npx vercel --prod
```

## 注意事项

- 上传时必须包含 `assets/`，否则图片和音乐会丢失。
- 当前留言、纪念日、主题等数据保存在浏览器 `localStorage` 里。部署到云端后，每个访问者看到和保存的是自己浏览器里的数据，不会自动同步给所有人。
- 如果后续想让所有人共享留言，需要再接一个云数据库或后端服务。
