# 命令行

18xx Maker 有一个命令行程序 `maker`,无需打开应用即可验证游戏文件并导出 PDF、PNG、SVG 和 Board18 文件。

## 要求

命令行是源代码的一部分,因此您需要仓库的克隆和一些工具。步骤见[本地开发](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md)。简而言之:

```shell
git clone https://github.com/18xx-maker/18xx-maker.git
cd 18xx-maker
pnpm install
pnpm exec playwright install chromium --only-shell
pnpm build
```

- Node 24 或更高版本,以及 [pnpm](https://pnpm.io/installation)。
- `pnpm install` 安装依赖。
- Playwright 安装的 Chromium 浏览器用于绘制 `export` 所捕获的页面。
- `pnpm build` 将网站构建到 `dist/site`,`export` 会自行提供该目录。更新代码后请重新构建。

## 运行

用 pnpm 或 node 运行:

```shell
pnpm maker help
node ./bin/maker.js help
```

> [!TIP]
> 想不带 pnpm 自身的输出直接输入 `maker`,可以在 shell 中添加别名:`alias maker='pnpm --silent maker'`。

`maker help <命令>` 会解释任意命令。

## 命令

| 命令                                      | 用途                                     |
| ----------------------------------------- | ---------------------------------------- |
| `export [options] [game]`                 | 为游戏创建 PDF、PNG、SVG 和 Board18 文件 |
| `print [options] [game]`                  | 等同于 `export --format pdf`             |
| `b18 [options] <game> [version] [author]` | 等同于 `export --format b18`             |
| `validate <files...>`                     | 验证任意 18xx Maker JSON 文件或模式      |
| `config`                                  | 查看或修改命令行的选项                   |
| `compile`                                 | 编译模式(面向开发者)                     |
| `help [command]`                          | 获取任意命令的帮助                       |

### export

```shell
pnpm maker export 1889 --format pdf,png,svg,b18
pnpm maker export path/to/my-game.json
pnpm maker export --all
```

游戏可以是内置游戏的 id,也可以是游戏文件的路径。游戏文件必须通过游戏模式的检查(与 `validate` 相同)。文件会写入 `render/<game>`:pdf、png 和 svg 文件各放在同名的文件夹中,Board18 盒子放在它们旁边。`--out` 可以指定其他文件夹。

这些选项与游戏文件的 `exports` 字段以及应用的“导出选项”面板相同。[导出选项](/docs/games/exports)提供了选项和标志的表格,并说明了当内置默认值、游戏文件和您的标志不一致时哪个值生效。省略的标志会保留游戏文件的值,因此若要与之相反,请给标志另一个值,例如 `--layouts current`。仅与命令运行方式有关的标志是 `--config <文件>`(一个配置文件,参见[配置面板](/docs/config))、`--out <文件夹>`、`--jobs <n>`(同时捕获的文件数)、`--all`(每个内置游戏)和 `--debug`(在端口 9000 上提供网站并等待,以便查看页面)。

导出会忽略配置中的打印缩放:它们始终是真实尺寸。

### print 和 b18

`print` 即 `export --format pdf`,`b18` 即 `export --format b18`。`b18 <game> [version] [author]` 的版本和作者取自游戏文件,其次取自 `maker config`。参见 [Board18 输出](/docs/output/b18)。

### validate

```shell
pnpm maker validate my-game.json "src/data/games/*.json"
```

根据适合的模式检查每个文件(支持通配符)(参见 [JSON 模式](/docs/games/schemas)),并打印每个错误及其在文件中的位置。

### config

`maker config` 列出命令行的选项,`maker config file` 打印它们的存储文件,`maker config get <key>` 和 `maker config set <key> [value]` 读取和写入一个选项。省略值会删除该选项。目前只有一个选项:`b18.author`,即 Board18 盒子的作者名。

### compile

`maker compile` 根据地块模式的源文件重新生成 `tiles.defs.json`。这是开发者命令:只有在修改模式时才需要,此时 `make` 还会把它们复制到 `public/schemas`。

## 退出码

| 代码 | 含义                                                                                        |
| ---- | ------------------------------------------------------------------------------------------- |
| `0`  | 一切正常                                                                                    |
| `1`  | `export`:部分文件失败(其余文件仍会写入,失败的会被列出),`validate`:有文件无效                |
| `2`  | 命令用法错误:游戏不存在或无效、值超出范围(例如超过 300 的 `--dpi`)、未知选项,或网站尚未构建 |
