# 导出选项

游戏文件可以通过可选的顶层 `exports` 字段说明它的导出方式。这些是该游戏的默认值,与 `maker export` 的命令行标志以及应用中“导出选项”面板的控件是同一组选项。这样,您分享的游戏文件就会按您的本意导出,无需任何人记住那些标志。

```json
{
  "info": { "title": "My Game" },
  "exports": {
    "formats": ["pdf", "png"],
    "docs": ["map", "tiles", "cards", "tokens"],
    "layouts": "current",
    "png": { "dpi": 150 },
    "b18": { "version": "1.2", "author": "Me" }
  }
}
```

每个选项都是可选的,不想设置的可以省略。

## 选项

| 选项          | 标志            | 取值                                                                                                                                                               | 默认值                                                             |
| ------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `formats`     | `--format`      | `pdf`、`png`、`svg` 和 `b18`(Board18 游戏盒)组成的列表                                                                                                             | `["pdf"]`                                                          |
| `docs`        | `--docs`        | 页面列表:`background`、`cards`、`charters`、`map`、`market`、`par`、`revenue`、`tile-manifest`、`tiles` 和 `tokens`                                                | 游戏的每一个页面                                                   |
| `layouts`     | `--layouts`     | `all`:为卡牌、地块和标记的每一种布局各生成一个文件,`current`:仅使用配置中的布局                                                                                    | 配置中的 `export.allLayouts` 设置                                  |
| `background`  | `--background`  | `white` 或 `transparent`:地图、股市、发行价、收益和地块清单 png 图片的背景,其他所有 png(背景页、卡牌、公司执照、标记和地块)始终是透明的(Board18 和 svg 图片不适用) | `white`                                                            |
| `variation`   | `--variation`   | 地图变体的编号,0 表示第一个(`--variation all` 表示导出每一个)                                                                                                      | 每一个变体                                                         |
| `png.dpi`     | `--dpi`         | 1 到 300 的整数                                                                                                                                                    | `300`,即图片打印时的实际尺寸                                       |
| `cards.bleed` | `--card-bleed`  | 0 到 50 的数字,单位为 1/100 英寸(12.5 即 1/8 英寸):每张单独卡牌 PNG 周围的出血,以卡牌背景填充                                                                      | `0`,无出血                                                         |
| `b18.version` | `--b18-version` | Board18 游戏盒的版本                                                                                                                                               | `1.0`                                                              |
| `b18.author`  | `--b18-author`  | Board18 游戏盒的作者                                                                                                                                               | `maker config` 的 `b18.author`,或您的姓名;在应用中则为游戏的设计师 |

`docs`、`layouts` 和 `variation` 适用于 pdf、png 和 svg 文件(Board18 游戏盒有自己的图片,但会采用 `variation`)。`png.dpi` 只适用于 png 文件:Board18 游戏盒中的图片始终每个单位使用一个像素。svg 文件(地图、股市、发行价、收益、地块和标记)是透明的,没有分辨率,`png.dpi` 和 `background` 不会改变它们。pdf 和 svg 文件除了共有的选项之外,没有自己专属的选项。

与命令在哪里、如何运行有关的选项不属于游戏:`--out`、`--jobs`、`--all`、`--config` 和 `--debug` 只是命令行标志。

## 哪个值优先

对于每个选项,优先级从低到高依次为:

1. 内置默认值
2. 游戏文件中的 `exports`
3. 您的选择:`maker export`、`maker print` 和 `maker b18` 的标志,`maker config` 的 `b18.author`,您自己的配置(其 `export.allLayouts` 设置即 `layouts` 选项),以及“导出选项”面板中的选择

因此,带有 `"png": { "dpi": 150 }` 的游戏会以 150 dpi 导出,`--dpi 300` 会让同一条命令以 300 dpi 导出,而应用中的面板会从 150 开始,您可以在导出前修改。各选项是逐个合并的:`--format pdf` 不会让游戏忘记它的 `png.dpi`,当您只给出 `--b18-author` 时,游戏中的 `b18.version` 也会保留。

### 覆盖游戏文件

每个选项都有对应的标志和面板控件,而且两者本身都没有默认值:您没有设置的内容,就以游戏文件为准。要违背游戏文件的设置:

| 选项          | 标志                                         | “导出选项”面板中的控件       |
| ------------- | -------------------------------------------- | ---------------------------- |
| `formats`     | `--format pdf,png`                           | “格式”复选框                 |
| `docs`        | `--docs map,cards`(列出您想要的页面)         | “文档”复选框                 |
| `layouts`     | `--layouts all` 或 `--layouts current`       | “页面的每一种布局”           |
| `background`  | `--background transparent`                   | “图片背景”                   |
| `variation`   | `--variation 0` 或 `--variation all`         | “地图变体”(仅限有变体的游戏) |
| `png.dpi`     | `--dpi 96`                                   | “PNG 分辨率(dpi)”            |
| `cards.bleed` | `--card-bleed 12.5`                          | “卡牌出血(单位)”             |
| `b18.version` | `--b18-version 2.0`(`maker b18 <game> 2.0`)  | “Board18 版本”               |
| `b18.author`  | `--b18-author Me`(`maker b18 <game> 2.0 Me`) | “Board18 作者”               |

面板一开始使用游戏文件中的值,修改之后可以点击“重置为游戏的选项”恢复它们。

`maker print` 始终导出 pdf 文件,`maker b18` 始终导出 Board18 游戏盒,无论 `formats` 怎么写。当您省略版本和作者时,`maker b18` 会从游戏文件中获取。其他选项请使用 `maker export`。

地图、股市、发行价和收益的 pdf 还有一个分页版本,但仅当该页面一张纸放不下时才会生成。这没有对应的选项,游戏文件中遗留的 `paginated` 选项会被忽略。

## 校验

游戏的 `exports` 会由 `pnpm validate` 和 `maker validate` 按照[游戏模式](/docs/games/schemas)进行校验,`maker export` 会拒绝导出未通过校验的游戏文件。超过 300 dpi 的分辨率、不存在的格式或页面、不是 `all` 或 `current` 的 `layouts`,以及表中没有的任何选项,都属于错误,例如:

```
invalid game  my-game.json
#/exports/png/dpi Value in `#/exports/png/dpi` is `301`, but should be `300` at maximum
```

应用不会校验它打开的游戏。它会跳过无效的选项,改用下一个值。

## 示例

只把卡牌和标记导出为 png,用于分享给印刷店:

```json
"exports": { "formats": ["png"], "docs": ["cards", "tokens"], "png": { "dpi": 300 } }
```

一款带有地图变体的游戏,把第二个变体导出为 Board18 游戏盒:

```json
"exports": { "formats": ["b18"], "variation": 1, "b18": { "version": "2.0" } }
```

游戏可导出的所有形式,并为每一种布局各生成一页:

```json
"exports": { "formats": ["pdf", "png", "b18"], "layouts": "all" }
```

透明背景的地图和股市,使用较低的分辨率:

```json
"exports": { "formats": ["png"], "docs": ["map", "market"], "background": "transparent", "png": { "dpi": 150 } }
```

标志优先于游戏文件。假设游戏文件中有 `"png": { "dpi": 150 }`:

```bash
pnpm maker export my-game.json --format png            # 150 dpi
pnpm maker export my-game.json --format png --dpi 300  # 300 dpi
pnpm maker export my-game.json --no-paginated          # even if the game says paginated: true
pnpm maker export 1889 --format pdf --config my-config.json
```
