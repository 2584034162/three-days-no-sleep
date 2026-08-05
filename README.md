# three-days-no-sleep
## 许可证

本项目采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议开源。

- 允许个人使用、学习、修改和非商业分享
- 禁止商业使用、禁止用于开发商业产品
- 二次分发必须注明原作者并使用相同协议

worker - 后端代码 (Backend)
web - 前端代码 (Frontend)
admin - 管理员工具
图标你们部署时可以自行替换，以下是部署教程，还有问题请自行使用工具探索，原谅我没有精力进行解答与教学：

## 项目结构

本仓库所有代码文件在 3daysnosleep 文件夹内，包含三个子文件夹：

**3daysnosleep/worker/** — 后端代码
- worker.txt：Cloudflare Worker 源码，部署时复制粘贴到 Worker 在线编辑器

**3daysnosleep/web/** — 前端主站
- index.html、sw.js、manifest.json：主页面文件
- css/、js/、assets/、presets/：样式、脚本、资源文件
- functions/api/auth.js：前端反代文件，需要填入你的 Worker 地址

**3daysnosleep/admin/** — 管理员控制台
- index.html、sw.js、manifest.json：管理页面文件
- functions/api/admin.js：管理员反代文件，需要填入你的 Worker 地址

## 部署教程

部署需要一个 [Cloudflare](https://dash.cloudflare.com/) 账号（免费即可）和一台能运行 Node.js 的电脑。

整体架构：

用户浏览器
  → Cloudflare Pages（前端主站）
    → Pages Function（反代）
      → Cloudflare Worker（后端）
        → D1 数据库

---

### 第一步：创建 D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单 → **Workers & Pages** → **D1 SQL Database**
3. 点 **Create database**
4. 输入数据库名称（随便起，例如 `myapp-db`）
5. 点 **Create**
6. 记住这个数据库的名称，后面要用

> 不需要手动建表。Worker 代码会在第一次请求时自动创建所有需要的表。

---

### 第二步：创建 Worker（后端）

1. 左侧菜单 → **Workers & Pages** → **Overview**
2. 点 **Create** → 选 **Worker**
3. 给 Worker 起个名字（例如 `my-auth-worker`），点 **Deploy**
4. 部署完成后，点 **Edit code**（编辑代码）
5. **删掉编辑器里的默认代码**
6. 打开本仓库 `3daysnosleep/worker/worker.txt` 文件，**复制全部内容**
7. **粘贴到 Worker 编辑器里**
8. 点右上角 **Deploy** 保存

---

### 第三步：给 Worker 绑定 D1 数据库

1. 回到刚创建的 Worker 页面
2. 点 **Settings** → **Bindings**
3. 点 **Add binding**
4. 类型选 **D1 Database**
5. **Variable name** 必须填 `DB`（大写，必须完全一致）
6. **D1 Database** 选择第一步创建的数据库
7. 点 **Save**

---

### 第四步：设置管理员密码

1. 还是在 Worker 的 **Settings** 页面
2. 找到 **Variables and Secrets**（变量和密钥）
3. 点 **Add variable**
4. **Variable name** 填 `ADMIN_PWD`
5. **Value** 填你想设置的管理员密码（自己记住）
6. 类型选 **Secret**（加密）
7. 点 **Save**

---

### 第五步：记录 Worker 地址

Worker 部署成功后，你会看到一个地址，格式类似：

```
https://my-auth-worker.你的账号.workers.dev
```

记住这个地址，下面要用。

---

### 第六步：配置前端反代文件

#### 主站反代

打开 `3daysnosleep/web/functions/api/auth.js`，找到第一行：

```js
const AUTH_WORKER_URL = '你的worker地址放这里';
```

替换成你的 Worker 地址加 `/api/auth`，例如：

```js
const AUTH_WORKER_URL = 'https://my-auth-worker.你的账号.workers.dev/api/auth';
```

#### 管理员工具反代

打开 `3daysnosleep/admin/functions/api/admin.js`，找到第一行：

```js
const ADMIN_WORKER_URL = '放你自己worker的地方';
```

替换成你的 Worker 地址加 `/api/admin`，例如：

```js
const ADMIN_WORKER_URL = 'https://my-auth-worker.你的账号.workers.dev/api/admin';
```

---

### 第七步：安装部署工具

在电脑上安装 Node.js 和 Wrangler。

#### 安装 Node.js

1. 去 [https://nodejs.org](https://nodejs.org) 下载安装（选 LTS 版本）
2. 安装完成后打开 CMD（Windows 按 Win+R 输入 cmd 回车）
3. 验证安装：

```bat
node -v
npm -v
```

能显示版本号就行。

#### 安装 Wrangler

在 CMD 里输入：

```bat
npm install -g wrangler
```

安装完后验证：

```bat
wrangler -v
```

> 如果提示 `wrangler 不是内部或外部命令`，用 `npx wrangler -v` 代替。后续所有 `wrangler` 命令都改成 `npx wrangler`。

#### 登录 Cloudflare

```bat
wrangler login
```

浏览器会弹出授权页面，点允许。回到 CMD 验证：

```bat
wrangler whoami
```

能显示你的 Cloudflare 账号信息就成功了。

---

### 第八步：部署前端主站

1. 在 CMD 里进入 `web` 文件夹：

```bat
cd /d "你的本地路径/3daysnosleep/web"
```

2. 确认文件夹结构正确：

```bat
dir
```

应该能看到 `index.html`、`sw.js`、`functions` 等文件和文件夹。

3. 第一次部署时，Cloudflare Pages 项目会自动创建。给项目起个名字（例如 `my-chat`）：

```bat
wrangler pages deploy . --project-name my-chat
```

4. 部署成功后会显示访问地址，格式类似：

```
https://my-chat.pages.dev
```

5. 测试反代是否生效。在浏览器打开：

```
https://my-chat.pages.dev/api/auth
```

如果看到：

```json
{"ok":false,"error":"此接口只支持 POST 请求"}
```

说明反代成功。如果看到 404 或 405，说明 Functions 没有部署成功，请检查 `functions/api/auth.js` 路径是否正确。

---

### 第九步：部署管理员工具

1. 在 CMD 里进入 `admin` 文件夹：

```bat
cd /d "你的本地路径/3daysnosleep/admin"
```

2. 部署（项目名和主站不同，例如 `my-chat-admin`）：

```bat
wrangler pages deploy . --project-name my-chat-admin
```

3. 部署成功后访问管理员工具地址，用第四步设置的 `ADMIN_PWD` 登录。

4. 在管理员工具里生成激活码，然后去主站用激活码注册账号。

---

### 第十步：验证完整流程

1. 打开主站地址
2. 用管理员工具生成的激活码注册账号
3. 登录成功后进入主界面
4. 可以用了

---

## 后续更新

### 更新前端文件

改完 `web` 文件夹里的文件后，使用第一条命令进入文件夹：

```bat
cd /d "你的本地路径/3daysnosleep/web"
```

然后第二条命令部署：

```bat
wrangler pages deploy . --project-name my-chat
```

注意：--project-name 后面的名字必须和第一次部署时用的名字完全一致。
如果填错了会创建一个新的 Pages 项目，而不是更新原来的。

不需要改 Worker，不需要改数据库。

### 更新管理员工具

改完 `admin` 文件夹里的文件后，使用第一条命令进入文件夹：

```bat
cd /d "你的本地路径/3daysnosleep/admin"
```

然后使用第二条命令部署：

```bat
wrangler pages deploy . --project-name my-chat-admin
```

注意：--project-name 后面的名字必须和第一次部署时用的名字完全一致。
如果填错了会创建一个新的 Pages 项目，而不是更新原来的。
### 更新后端 Worker

如果需要改 Worker 代码：

1. 去 Cloudflare Dashboard → Workers → 你的 Worker → Edit code
2. 粘贴新代码
3. 点 Deploy

---

## 重要说明

- **不要用 Cloudflare Pages 后台的静态文件上传功能**。因为静态上传不会部署 `functions/` 里的反代文件，会导致 `/api/auth` 返回 404 或 405。必须用 Wrangler 命令行部署。
- Worker 代码里的 `ADMIN_PWD` 是环境变量，不在代码里。换管理员密码只需要在 Worker Settings 里改环境变量。
- 前端主文件里的 `AUTH_API` 是相对路径 `/api/auth`，不需要改。真正的 Worker 地址只写在 `functions/api/auth.js` 里。
- D1 数据库的表会在第一次请求时自动创建，不需要手动建表。
- 每个用户最多同时登录 3 个浏览器设备。


