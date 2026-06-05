# 阿里云部署指南 (静态托管 + 动态 API + 自定义域名)

本项目已升级为动态版本，支持多端数据同步、权限管理与图片上传。以下是完整的阿里云部署步骤。

## 架构说明

*   **前端网页：** 部署在 阿里云 OSS 静态网站托管，绑定自定义域名 `www.dzjhss.cn`。
*   **后端 API：** 部署在 阿里云函数计算 FC，绑定自定义域名 `api.dzjhss.cn`。
*   **数据库：** 阿里云表格存储 TableStore (OTS)，保存纪念日配置、留言板、瞬间及邀请码。
*   **照片云存储：** 阿里云对象存储 OSS (独立的 Bucket 或专属目录)，保存用户上传的瞬间照片。

---

## 步骤一：创建阿里云资源

### 1. 表格存储 TableStore
1.  登录阿里云控制台，开通「表格存储 TableStore」。
2.  创建一个「宽表模型」实例，实例名称建议为 `memory-site`，地域建议选**非中国内地地域**（如「中国香港」或「新加坡」）以方便绑定自定义域名免备案。
3.  在实例下创建以下 6 张数据表，主键名称及类型必须严格一致：
    *   **`SiteConfig`**：主键为 `id` (String)。
    *   **`Notes`**：主键为 `id` (String)。
    *   **`Moments`**：主键为 `id` (String)。
    *   **`Timeline`**：主键为 `id` (String)。
    *   **`PhotoWall`**：主键为 `id` (String)。
    *   **`Editors`**：主键为 `id` (String)。
    *   **`InviteCodes`**：主键为 `id` (String)。

### 2. 对象存储 OSS (两处)
1.  **创建前端托管 Bucket：**
    *   名称自定，如 `dzjhss-web`。
    *   读写权限：**公共读**。
2.  **创建瞬间照片 Bucket：**
    *   名称自定，如 `dzjhss-photos`。
    *   读写权限：**公共读**。
    *   配置 CORS：允许您的网站域名 `https://www.dzjhss.cn` 进行跨域访问（允许 GET, POST, PUT, OPTIONS 方法，来源 `https://www.dzjhss.cn`，允许的 Headers 填 `*`）。

### 3. 函数计算 FC
1.  开通函数计算 FC 服务。
2.  在与 TableStore/OSS 相同的地域下，创建一个 Web 函数或事件函数。运行时选择 **Node.js 20**。
3.  函数触发器选择 **HTTP 触发器**。

---

## 步骤二：后端 API 配置与部署

### 1. 配置环境变量
在函数计算控制台，进入您的函数配置页，添加以下环境变量：

| 变量名 | 说明 | 示例值 |
| :--- | :--- | :--- |
| `USE_MEMORY_STORE` | 是否开启内存模拟，生产环境**必须设为 false** | `false` |
| `TOKEN_SECRET` | 用于签名 JWT 登录令牌的随机密钥，务必保密 | `随意的一段长随机字符` |
| `ADMIN_PASSWORD_HASH` | 管理员密码哈希。可用命令 `bun run api/src/security.js` 或本地运行生成，禁止保存明文密码 | `scrypt:salt:digest` |
| `ALIBABA_CLOUD_ACCESS_KEY_ID` | 阿里云账号的 AccessKey ID | `LTAI...` |
| `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | 阿里云账号的 AccessKey Secret | `Secret...` |
| `OSS_REGION` | 照片 OSS Bucket 的地域名称 | `oss-cn-hongkong` |
| `PHOTO_BUCKET` | 照片存储 OSS Bucket 的名称 | `dzjhss-photos` |
| `TABLESTORE_ENDPOINT` | 表格存储实例的公网访问地址 | `https://memory-site.cn-hongkong.ots.aliyuncs.com` |
| `TABLESTORE_INSTANCE` | 表格存储实例的名称 | `memory-site` |

### 2. 打包与部署后端代码
1.  在本地项目根目录运行 `npm install` (或使用 `bun install`)。
2.  将以下文件夹及文件压缩为 ZIP 包（不含 `node_modules`，FC 部署时会自动安装或运行内置依赖）：
    *   `api/` (包含 `api/src/`)
    *   `package.json`
3.  在函数计算控制台上传该 ZIP 包，并设置运行入口命令为：
    ```bash
    node api/src/server.js
    ```
4.  保存并部署。部署成功后会获得一个 FC 默认的 HTTP 触发器公网 URL（例如 `https://xxxx.cn-hongkong.fc.aliyuncs.com`）。

---

## 步骤三：绑定自定义域名

### 1. 解析自定义域名 (Alibaba Cloud DNS)
登录域名解析控制台（如万网/阿里云解析），为您名下的域名 `dzjhss.cn` 添加两条 CNAME 解析：
1.  **前端网页：** `www.dzjhss.cn` ➜ CNAME 指向您创建的前端托管 Bucket 的外网访问域名（如 `dzjhss-web.oss-cn-hongkong.aliyuncs.com`）。
2.  **后端 API：** `api.dzjhss.cn` ➜ CNAME 指向您的函数计算 FC 触发器的公网域名（去除 `http://` 或 `https://` 的纯 host 地址）。

### 2. 在云产品中绑定域名
1.  **OSS 绑定自定义域名：**
    *   进入前端网页 OSS Bucket (`dzjhss-web`) 控制台 ➜ **传输管理** ➜ **域名管理**，点击「绑定域名」，输入 `www.dzjhss.cn`。
    *   开启并绑定 **HTTPS 证书**（可使用阿里云提供的免费证书），确保能够通过 `https://www.dzjhss.cn` 正常访问。
    *   在 **基础设置** ➜ **静态页面** 中，开启「静态网站托管」，默认首页和默认 404 均设置为 `index.html`。
2.  **函数计算 FC 绑定自定义域名：**
    *   进入函数计算控制台 ➜ **高级功能** ➜ **域名管理**。
    *   点击「添加自定义域名」，输入 `api.dzjhss.cn`。
    *   路由配置中，Path 填 `/*`，关联您创建的函数服务。
    *   上传并配置 HTTPS 证书。

---

## 步骤四：配置前端并上传

1.  修改本地的 `cloud-config.js` 文件，将 API 接口地址正式指向您的后端域名：
    ```javascript
    window.MEMORY_CLOUD_CONFIG = {
      apiBaseUrl: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8787'
        : 'https://api.dzjhss.cn'
    };
    ```
2.  将本地的前端静态网页资源上传到前端网页 OSS Bucket (`dzjhss-web`) 中：
    *   `index.html`
    *   `styles.css`
    *   `app.js`
    *   `cloud-config.js`
    *   `cloud-auth.js`
    *   `cloud-api.js`
    *   `assets/` (整个文件夹，含图片、音频、星露谷和丸子贴纸素材)

现在，您就可以通过浏览器访问 `https://www.dzjhss.cn` 体验完整的动态回忆网站了！
如果您需要以管理员身份进入，点击页面右上角的 `✎` 进入编辑模式，选择 `管理员密码` 登录并点击 `🛠️` 面板即可生成邀请码。
