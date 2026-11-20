# 运行游戏服务器

游戏服务器是[在线游戏](/docs/play)所连接的对象:它通过 Discord 让玩家登录,保存游戏及其操作,并把每一步操作发送给该游戏的玩家。本页面向想要自己运行服务器的人。如果已经有人给了你服务器地址,你只需要阅读[在线游戏](/docs/play)页面。

服务器是[代码仓库](https://github.com/18xx-maker/18xx-maker/tree/main/server)中 `server` 文件夹里的一个 Node 应用,所有数据都保存在 Postgres 中。它的 [README](https://github.com/18xx-maker/18xx-maker/blob/main/server/README.md) 还介绍了 API 和 websocket 协议(英文)。

## 运行要求

- Postgres 17。一个空数据库就够了:服务器在启动时会创建自己的表。
- Node 24 和 pnpm,或者用 Docker 运行镜像。
- 一个 Discord 应用(见下文)。
- 服务器的公共 HTTPS 地址,例如 `https://play.example.com`,以便网站能访问它,Discord 也能把玩家送回它。

## Discord 应用

玩家通过 Discord 登录,因此服务器需要一个自己的 Discord 应用:

1. 在 [Discord 开发者门户](https://discord.com/developers/applications)中创建一个应用并打开 **OAuth2**。
2. 添加重定向 URI `${PUBLIC_URL}/auth/discord/callback`,例如 `https://play.example.com/auth/discord/callback`。它必须与 `PUBLIC_URL` 完全一致。
3. 把客户端 ID 和客户端密钥复制到 `DISCORD_CLIENT_ID` 和 `DISCORD_CLIENT_SECRET`。
4. 服务器请求的权限范围是 `identify guilds`。不需要机器人:`guilds` 范围用于检查 `DISCORD_GUILD_ID`(开启开发者模式后复制服务器的 ID)。

## 配置

所有设置都是环境变量。前四个是必需的,缺少它们服务器将拒绝启动。

| 变量                     | 默认值                       | 含义                                                                                                  |
| ------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`           | 必填                         | Postgres 连接字符串,例如 `postgres://play:play@db:5432/play`。                                        |
| `PUBLIC_URL`             | 必填                         | 此服务器的公共 URL,末尾不带斜杠。用于 Discord 重定向 URI。                                            |
| `DISCORD_CLIENT_ID`      | 必填                         | Discord 应用的客户端 ID。                                                                             |
| `DISCORD_CLIENT_SECRET`  | 必填                         | Discord 应用的客户端密钥。它还用于签名登录的 `state`,因此更改它会中断正在进行的登录。                 |
| `PORT`                   | `8787`                       | 服务器监听的端口。                                                                                    |
| `ALLOWED_ORIGINS`        | 空                           | 以逗号分隔的 18xx Maker 网站来源,这些来源可以调用 API(CORS),也可以作为登录的 `return` URL。           |
| `DISCORD_GUILD_ID`       | 空                           | 设置后,只有该 Discord 服务器的成员可以创建游戏。任何拥有邀请链接的人仍然可以加入。留空:任何人。       |
| `DISCORD_API_BASE`       | `https://discord.com/api`    | Discord API 基础地址,仅在测试中更改。                                                                 |
| `DISCORD_AUTH_BASE`      | `https://discord.com/oauth2` | Discord 授权基础地址,仅在测试中更改。                                                                 |
| `DISCORD_TIMEOUT_MS`     | `10000`                      | 登录时每个 Discord 请求(包括响应正文)允许的时间。超时的登录会以 502 失败。                            |
| `DISCORD_WEBHOOK_ORIGIN` | `https://discord.com`        | 游戏的 Webhook 网址必须以此来源开头(`<origin>/api/webhooks/<id>/<token>`),仅在测试中更改。            |
| `SESSION_TTL_DAYS`       | `30`                         | 登录保持有效的天数。过期的会话在 API 上得到 401,在 websocket 上得到 `bad_token`。                     |
| `MAX_GAME_BYTES`         | `2097152` (2 MiB)            | 创建游戏时接受的最大游戏文件。                                                                        |
| `MAX_ASSET_BYTES`        | `1048576` (1 MiB)            | 游戏上传的单个资源(图片或字体)的最大大小。                                                            |
| `MAX_ASSETS_PER_GAME`    | `50`                         | 一局游戏可以拥有的资源数量。替换同名资源不会重复计数。                                                |
| `MAX_ASSET_TOTAL_BYTES`  | `8388608` (8 MiB)            | 一局游戏所有资源的总大小。                                                                            |
| `MAX_GAMES_PER_USER`     | `50`                         | 用户可以拥有的处于 `active` 或 `locked` 状态的游戏数量(已归档的不计入,直到它们重新变为进行中或锁定)。 |
| `MAX_EVENTS_PER_SECOND`  | `10`                         | 一个 websocket 每秒可以发送的事件数,超过后会收到 `rate_limited` 错误。                                |
| `MAX_EVENTS_PER_GAME`    | `200000`                     | 一局游戏可以保存的事件数。之后的事件会得到 `invalid`("game is full")。                                |
| `SNAPSHOT_EVERY`         | `100`                        | 保存快照的事件间隔。落后超过此值五倍的客户端会在 `snapshot` 帧中收到完整记录。                        |
| `JOIN_TIMEOUT_MS`        | `10000`                      | 新 websocket 发送 `join` 帧的时限,超时后连接会被关闭(4001)。                                          |
| `WEBHOOK_BATCH_MS`       | `5000`                       | 游戏的操作通知在作为一条消息发送到其 Discord Webhook 之前收集的时间。                                 |
| `WEBHOOK_MAX_PER_MINUTE` | `10`                         | 每局游戏每分钟的 Webhook 消息数。超出的通知会等待,并随下一条消息一起发送。                            |
| `MAX_SPECTATORS`         | `50`                         | 一局游戏同时允许的观战 websocket 数量。下一个会收到 `too_many_spectators` 并以 4003 关闭。            |

数值型变量必须是正整数,否则服务器会拒绝启动并指出该变量。未设置或为空时使用默认值。

`ALLOWED_ORIGINS` 必须列出玩家所用的每个 18xx Maker 网站的来源,与浏览器显示的完全一致(协议和主机,不带路径,末尾不带斜杠),例如 `https://18xx-maker.com`。多个来源用逗号分隔。

## 使用 Docker 运行

镜像从代码仓库根目录构建:

```shell
docker build -f server/Dockerfile -t 18xx-maker-play .
```

它监听 8787 端口,以非 root 用户 `node` 运行,并在 `/health` 上提供健康检查。

### Docker Compose

Compose 会同时启动服务器和 Postgres(`play` 服务从你的 shell 中读取 Discord 相关的值和 `PUBLIC_URL`):

```shell
export PUBLIC_URL=http://localhost:8787
export DISCORD_CLIENT_ID=...
export DISCORD_CLIENT_SECRET=...
export ALLOWED_ORIGINS=http://localhost:5173
docker compose -f server/docker-compose.yml up -d
curl -s localhost:8787/health   # {"ok":true}
```

对于公共服务器,请把 `PUBLIC_URL` 设为它的 `https://` 地址,把 `ALLOWED_ORIGINS` 设为玩家使用的网站。

### Dokploy

1. 在项目中创建一个 **Postgres** 数据库服务。
2. 从 Git(本代码仓库)创建一个 **Application**。构建类型选 **Dockerfile**,Dockerfile 路径为 `server/Dockerfile`,构建上下文为仓库根目录(`.`)。
3. 在环境变量中设置 `DATABASE_URL`(数据库服务的内部连接字符串)、`PUBLIC_URL`(下面的域名,带 `https://`)、`ALLOWED_ORIGINS`、`DISCORD_CLIENT_ID`、`DISCORD_CLIENT_SECRET`,以及可选的 `DISCORD_GUILD_ID`。
4. 添加一个指向容器端口 `8787` 的域名。websocket(`/ws`)可以直接通过代理工作,无需配置。
5. 不需要挂载任何东西:所有状态都在 Postgres 中。

## 网站与你的服务器

网站的内容安全策略(Content-Security-Policy)允许连接到任何 `https:` 和 `wss:` 地址,因此任何游戏服务器都可以直接配合托管的网站使用,无需重新构建:玩家只需在设置中填写它的地址。普通 `http://` 地址上的服务器会被阻止,只有 `localhost` 和 `127.0.0.1` 例外,用于在你自己的电脑上测试。

浏览器还会询问服务器是否允许该网站调用它(CORS)。服务器只对 `ALLOWED_ORIGINS` 中的来源允许,并且只允许登录返回到这些来源。

## 只运行一个实例

只运行**一个实例**。房间、在线状态和广播顺序都存在于进程中,因此第二个副本会错过第一个副本的广播,它的玩家在重新连接之前看不到彼此的事件。

容器会处理 `SIGTERM`(以及 `SIGINT`):它关闭 websocket 和监听器,结束数据库连接池并以 0 退出,时限为 5 秒,因此 `docker stop` 和重新部署不必等待强制终止。

## 备份

备份由主机负责。请备份 Postgres 数据库(游戏、事件、资源、会话);服务器不保存其他任何东西,例如可以定期运行 `pg_dump`。

## 升级

拉取新版本,重新构建镜像并重启容器。服务器在启动时运行数据库迁移,因此不需要单独的步骤。迁移运行期间会持有 Postgres 咨询锁(advisory lock),所以即使两个服务器同时启动,每个迁移也只会应用一次。

## 安全

- 登录有效期为 `SESSION_TTL_DAYS`(默认 30 天)。过期的会话会被拒绝,玩家需要重新登录。更改该值只对新的登录生效。退出登录会结束会话并关闭其 websocket。
- 更改 `DISCORD_CLIENT_SECRET` 会中断正在进行的登录(它用于签名登录的 `state`)。请像密码一样保密。
- 游戏的 Discord Webhook 网址只保存在服务器上。没有任何接口会返回它,对所有者也一样,日志中也绝不会包含它。只接受 `https://discord.com/api/webhooks/...`(或 `discordapp.com`)形式的网址。
- 邀请链接和观战链接都是机密:任何拥有链接的人都可以加入或观看。所有者可以替换其中任何一个,旧链接会立即失效。
- 上传的图片和字体以附件形式提供,网站在绘制 SVG 图片之前会先清理它们。

## 故障排除

### 重定向 URI 不匹配

当应用的重定向 URI 与 `${PUBLIC_URL}/auth/discord/callback` 不完全一致时,Discord 会显示 "Invalid OAuth2 redirect_uri"。请检查协议(`https://`)、主机,以及 `PUBLIC_URL` 末尾没有斜杠。

### CORS 错误

如果网站无法访问服务器且浏览器控制台显示 CORS 错误,或者登录以 400 中止,说明网站的来源不在 `ALLOWED_ORIGINS` 中。请准确地添加它(`https://18xx-maker.com`,末尾不带斜杠)并重启服务器。

### websocket 无法连接

如果版图一直停留在"正在连接...",说明服务器前面的代理没有转发 `/ws` 上的 websocket。请为该域名开启 websocket(升级)支持,并通过 `https://` 提供服务器,这样版图会使用 `wss://` 连接。

### 创建游戏时出现 422

422 表示服务器检查游戏文件时发现了错误;在线游戏页面会列出这些错误。运行 `pnpm maker validate my-game.json`(参见 [JSON 模式](/docs/games/schemas))并修正它们。413 表示游戏文件或某张图片超出了服务器的限制(`MAX_GAME_BYTES`、`MAX_ASSET_BYTES`、`MAX_ASSETS_PER_GAME`、`MAX_ASSET_TOTAL_BYTES`)。
