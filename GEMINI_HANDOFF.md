# Gemini 项目移交注意事项

## 先读结论

这是一个纯静态的情侣回忆网站，不是前后端项目。当前线上可用形态只需要 `index.html`、`styles.css`、`app.js` 和 `assets/`，没有 `package.json`、没有构建步骤、没有数据库、没有后端服务。

项目目录不是 Git 仓库，接手时不要依赖分支、commit 或 PR 历史判断改动来源。

## 当前项目状态

- 入口页面：`index.html`
- 样式：`styles.css`
- 交互逻辑：`app.js`
- 图片、贴纸、音乐等资源：`assets/`
- Netlify 配置：`netlify.toml`
- 通用部署说明：`README_DEPLOY.md`
- 阿里云 OSS 静态部署说明：`README_ALIYUN_DEPLOY.md`
- 动态版设计与计划：`docs/superpowers/specs/2026-06-04-aliyun-dynamic-memory-site-design.md` 和 `docs/superpowers/plans/2026-06-04-aliyun-dynamic-memory-site.md`
- 当前静态部署包：`deploy-package.zip`

## 本地运行

最简单方式是直接用浏览器打开 `index.html`。

如果需要通过本地 HTTP 访问，可以在项目根目录启动任意静态服务器，例如：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

注意：项目没有 npm 依赖，除非你要实施动态版改造，否则不要先创建 Node 构建链路。

## 当前已实现功能

- 首屏情侣姓名、纪念日实时计时。
- 暗色/浅色主题切换，主题偏好存入浏览器 `localStorage`。
- 时光轴展示、分类筛选、拍立得照片点击大图和拖拽摆放。
- 留言墙新增/删除留言。
- 美好瞬间新增/编辑/删除，支持本地图片选择和拖拽上传。
- 上传图片会在前端压缩为 base64，再保存到 `localStorage`。
- 悬浮音乐播放器，支持播放/暂停、上一首/下一首、歌单和音量控制。
- 背景 Canvas 粒子动画。
- 两侧小丸子贴纸装饰和星露谷像素素材装饰。

## 最重要的数据边界

当前所有可编辑数据都是本机浏览器数据：

- `partnerName`
- `anniversaryDate`
- `themeSetting`
- `memoryNotes`
- `memoryMoments`

这些数据存在 `localStorage`。部署到 Netlify、Vercel 或阿里云 OSS 后，每个访问者看到和保存的是自己浏览器里的数据，不会自动同步。

如果用户要求“所有人看到同一份留言/照片/纪念日”，不能只改前端，需要接后端和云存储。

## 部署注意事项

静态部署必须包含：

- `index.html`
- `styles.css`
- `app.js`
- `assets/`

不要漏传 `assets/`，否则图片、贴纸、星露谷素材和音乐都会缺失。

当前项目大约 26 MB，主要体积来自音乐文件和贴纸/图片资源。`assets/love_is.mp3` 和 `assets/Schoolgirl byebye - 爱是.mp3` 内容看起来重复且都约 9.4 MB，当前代码实际默认使用 `assets/love_is.mp3`。

Netlify 可直接上传整个目录或 `deploy-package.zip`。阿里云 OSS 推荐使用中国香港或新加坡地域快速上线，避免一开始卡在中国内地 ICP 备案流程。

## 动态版改造方向

已有设计文档和实施计划，但尚未实现。动态版目标是：

- 静态页面仍放 OSS。
- 新增 Node.js 20 API，部署到阿里云函数计算 FC。
- 用 TableStore 存留言、瞬间、编辑者、邀请码和站点配置。
- 用 OSS 存用户上传照片。
- 访客只读，编辑者通过邀请码长期授权，管理员可管理邀请码和编辑者。

如果开始做动态版，请先读：

```text
docs/superpowers/specs/2026-06-04-aliyun-dynamic-memory-site-design.md
docs/superpowers/plans/2026-06-04-aliyun-dynamic-memory-site.md
```

动态版计划里提到要新增 `package.json`、`api/`、`cloud-api.js`、`cloud-auth.js`、`cloud-config.js` 等文件。这些文件当前不存在，不能假设已经落地。

## 修改时容易踩坑的地方

- `app.js` 是单文件脚本，所有逻辑包在 `DOMContentLoaded` 回调里。
- 留言和美好瞬间渲染都依赖运行时 DOM 拼接，改字段名时要同步默认数据、渲染函数、表单提交和 `localStorage` 兼容。
- 图片上传当前保存为 base64，图片多了会撑爆浏览器 `localStorage`，这也是动态版必须上 OSS 的原因。
- 音乐自动播放受浏览器策略限制，代码通过首次点击/触摸/键盘事件解锁播放，不要把失败日志误判为功能错误。
- 删除留言和删除瞬间都会直接改 `localStorage`，没有撤销和云端同步。
- `escapeHTML` 已用于用户文本，继续新增用户输入展示时也要转义。
- 主题变量在 `styles.css` 的 `:root` 和 `body.light-theme` 中维护，新增颜色优先走 CSS 变量。
- `deploy-package.zip` 是发布包，不要把它当源代码编辑。
- `.DS_Store` 和 `deploy-package.zip` 已写入 `.gitignore`，如果后续初始化 Git，保持忽略即可。

## 给 Gemini 的建议工作顺序

1. 先确认用户目标：只是静态部署/文案调整，还是要做多人同步动态版。
2. 静态小改动只碰 `index.html`、`styles.css`、`app.js` 和必要的 `assets/`。
3. 涉及共享数据、登录、照片云存储、管理员权限时，按动态版设计文档推进，不要继续扩大 `localStorage` 方案。
4. 做完前端改动后，用本地静态服务器打开页面，至少检查首屏、留言、美好瞬间、主题切换、音乐按钮和移动端布局。
5. 做部署改动后，同步更新 `README_DEPLOY.md` 或 `README_ALIYUN_DEPLOY.md`。

## 推荐交接提示词

可以把下面这段发给 Gemini：

```text
请先阅读 GEMINI_HANDOFF.md、README_DEPLOY.md、README_ALIYUN_DEPLOY.md，以及 docs/superpowers/specs/2026-06-04-aliyun-dynamic-memory-site-design.md。这个项目当前是纯静态情侣回忆网站，没有 package.json 和后端。除非我要你实现动态版，否则不要引入构建链路或数据库。修改后请用本地静态服务器验证页面。
```
