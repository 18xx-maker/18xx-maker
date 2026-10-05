# PDF 输出

## 应用

在 18xx Maker 应用中,您可以浏览任意游戏组件,然后点击导出按钮:

![游戏页面的工具栏,导出按钮已用圆圈标出](/images/export-button-light.png "应用工具栏中的导出按钮。")

> [!NOTE]
> 如果您在网页浏览器中使用 18xx Maker,请注意此按钮并不存在,取而代之的是一个打印图标,它只会打开浏览器的打印菜单。

![网页浏览器中游戏页面的工具栏,打印按钮已用圆圈标出](/images/print-button-light.png "在网页浏览器中,同一位置显示的是打印按钮。")

这会弹出一个带有导出选项的菜单:将整个游戏导出为 PDF 文档、PNG 图片、SVG 图片或 Board18 游戏盒。以这种方式导出_会_遵循您在应用中设置的所有设置选项。_导出选项_一项会打开一个面板,您可以在其中选择格式(PDF、PNG、SVG 和 Board18)、文档、是否导出一张页面的每一种布局以及文件夹,然后一次性全部导出。面板的初始值取自游戏的 `exports` 字段(如果有的话,参见[导出选项](/docs/games/exports)),您在面板中的更改优先。在面板中点击_取消导出_可以停止正在进行的导出;已经完成的文件会保留。

如果您选择导出整个游戏,应用会让您选择一个文件夹来存放所有文件。文件名_确实_包含游戏名称,但建议您专门为这款游戏创建一个文件夹,以便自己整理。导出完成后,应用会打开生成的文件夹。

## 命令行

> [!IMPORTANT]
> 此工作流需要您拥有应用的源代码,并已按照[本地开发](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md)的说明完成配置。

运行以下命令可以直接输出 PDF 文件:

```bash
pnpm build && pnpm maker export <game> --format pdf
```

其中 `<game>` 是内置游戏的 id,或游戏文件的路径(会先按游戏模式校验,文件夹以该文件命名)。例如,下面是我打印 1889 的命令:

```bash
pnpm build && pnpm maker export 1889 --format pdf
```

当地图、股市、发行价和收益的 PDF 无法放进一张纸时,它们还会生成分页的 PDF(`-paginated`)。

`pnpm maker print 1889` 的效果相同(游戏默认为 `1889`)。其他常用选项有:`--docs map,cards` 只导出部分页面,`--layouts all` 为每一种布局生成一张页面,`--variation 1` 导出某个地图变体,`--config my-config.json` 指定您的设置文件,`--out <folder>` 使用 `render` 以外的文件夹,`--jobs 3` 同时处理三个文件。`pnpm maker help export` 会列出全部选项。

这些选项也都可以在游戏文件的 `exports` 字段中设置(参见[导出选项](/docs/games/exports))。游戏文件提供该游戏的默认值,命令行中给出的内容优先于它。例如,游戏中有 `"exports": { "docs": ["map"] }` 时,`pnpm maker export my-game.json` 只导出地图,而 `pnpm maker export my-game.json --docs cards` 则改为导出卡牌。_导出选项_面板以控件的形式提供同样的选项,初始值取自游戏文件,并有一个按钮可以恢复到游戏文件的设置。

请注意,这不会使用浏览器设置页面中的选项。若要让打印输出与浏览器中看到的完全一致,请打开[设置](?config=true)面板,使用“下载设置”(或复制底部的 json)将其保存为文件,然后用 `--config` 传入:

```bash
pnpm maker export 1889 --format pdf --config my-config.json
```

`src/config.json` 中的设置也会被使用,`--config` 叠加在其之上。

这会构建应用,然后将一批文件输出到 `render/1889` 文件夹:

```
render
└── 1889
    └── pdf
        ├── shikoku-1889-background.pdf
        ├── shikoku-1889-cards-miniEuroDie.pdf
        ├── shikoku-1889-charters.pdf
        ├── shikoku-1889-map-paginated.pdf
        ├── shikoku-1889-map.pdf
        ├── shikoku-1889-market-paginated.pdf
        ├── shikoku-1889-market.pdf
        ├── shikoku-1889-par.pdf
        ├── shikoku-1889-revenue-paginated.pdf
        ├── shikoku-1889-revenue.pdf
        ├── shikoku-1889-tile-manifest.pdf
        ├── shikoku-1889-tiles-die.pdf
        └── shikoku-1889-tokens.pdf
```

每种格式在游戏文件夹中都有各自的文件夹:PDF 在 `pdf`,PNG 在 `png`,SVG 在 `svg`。文件以游戏标题命名(与应用使用的名称相同),文件夹以您输入的游戏 id 命名。PDF 会连同背景一起打印,与应用一致。如果有些文档无法打印,命令会以退出码 1 结束(其余文档仍会写出);如果用法有误、游戏不存在或网站尚未构建,则以退出码 2 结束。

如果想一次构建所有游戏,可以运行:

```bash
pnpm build && pnpm maker export --all --format pdf
```
