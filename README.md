# 宠斗江湖 v1.4.0

静态网页游戏的发布文件。无需数据库、后端服务器或运行时密钥。

## 当前发布

- 游戏地址：https://pet-brawl-jianghu.onrender.com
- Render 工作区：My Workspace
- 服务 ID：`srv-db8ouiei0phs738gebig`
- 部署 ID：`dep-db8ouiui0phs738gecgg`
- 已发布游戏提交：`6c326ea64c051a39e2dd09b63fb38462ad24b3fd`
- 自动部署已关闭，后续更新需要手动发布。
- 中国大陆网络可达性仍待实际网络测试；不要仅凭部署成功判定。

## Render

- 服务类型：Static Site。
- 发布目录：`public`。
- 构建命令：`test -f public/index.html && test -f public/app.mjs`。
- 环境变量：`SKIP_INSTALL_DEPS=true`。
- 如通过 Blueprint 创建，使用根目录的 `render.yaml`。
- 如通过直接创建接口部署，`render.yaml` 不会自动应用，需单独核对在线模块的 Content-Type 与缓存行为。
- 部署前需要将本目录推送至 Render 支持且有权限读取的 GitHub、GitLab 或 Bitbucket 仓库。

部署后逐个核对 15 个公开文件，确认 `.mjs` 响应为 JavaScript 类型，并实测完整战斗动画。生成 onrender.com 地址不代表已验证中国大陆网络可达。

## 存档迁移

在原地址的游戏设置中导出 JSON 存档，再到新地址的设置中导入。浏览器存档不会自动跨域共享。

原地址：https://pet-brawl-jianghu.astralhake33.chatgpt.site

当前发布文件来自源版本：`aca33fbb6290499b377c889c6866a8b3ba958c42`。
