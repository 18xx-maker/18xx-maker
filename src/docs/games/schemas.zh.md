# JSON 模式

我们的模式(schema)使用 [JSON Schema](https://json-schema.org/) draft-07 版本定义。

## 用法

模式的主要用途之一是弃用功能。重命名字段时,模式中同时有两个名称:新名称,以及标记为 `"deprecated": true` 的旧名称,其说明会告诉你应使用哪个名称。仍使用旧名称的游戏文件会照常加载、打印和导出,问题页面会把旧名称列为已弃用,并给出应使用的新名称。旧名称永远不会被移除,因此你的游戏文件在每个版本中都能继续使用。如果文件中同时有两个名称,则以新名称为准。

## 当前的模式

模式位于源码仓库的
[src/schemas](https://github.com/18xx-maker/18xx-maker/tree/main/src/schemas)
目录中。

- [companies](https://18xx-maker.com/schemas/companies.schema.json) 定义用于替换公司的公司文件
- [publishers](https://18xx-maker.com/schemas/publishers.schema.json) 定义出版商文件
- [game](https://18xx-maker.com/schemas/game.schema.json) 定义游戏文件
- [tiles](https://18xx-maker.com/schemas/tiles.schema.json) 定义地块文件,以及游戏文件中六边格定义的格式
- [config](https://18xx-maker.com/schemas/config.schema.json) - 定义 `defaults.json` 的格式,用于管理 18xx Maker 及其他工具的[配置文件](https://github.com/18xx-maker/18xx-maker/blob/main/src/defaults.json)。
- [theme](https://18xx-maker.com/schemas/theme.schema.json) - 定义配色主题文件的模式(地图或公司)

游戏模式和地块模式都引用了
[tiles.defs.json](https://18xx-maker.com/schemas/tiles.defs.json),它是共享的,定义了所有可以放进地图或地块六边格的
JSON。

## 导出选项

游戏文件可以有一个 `exports` 字段,用于设置导出游戏的默认选项(格式、页面、分辨率、Board18 版本和作者)。它在游戏模式和[导出选项](/docs/games/exports)中都有说明,无效的值(例如超过 300 dpi 的分辨率)无法通过校验。

## 问题页面

打开游戏时,会在后台根据游戏模式检查其文件。如果有问题,游戏菜单中会出现“问题”项,并显示问题数量。它会打开一个列表,说明每个问题的位置、错误内容以及修复方法:未知字段(拼写错误,或已被重命名或移除的字段)、类型错误的值、不允许的值以及缺少的必填字段。已弃用的字段也会列出,它们仍可使用,页面会说明应改用哪个名称。此页面只报告问题,不会修改您的文件。每一行只要指向文件中的某个位置,就会链接到编辑面板中的 JSON 编辑器,并定位到问题所在的行。

## 校验

要校验所有文件,可以运行:

```bash
pnpm validate
```

在代码仓库的根目录中运行。这会校验所有相关的 json 文件,包括模式本身。要校验您自己的游戏文件:

```bash
pnpm maker validate my-game.json
```
