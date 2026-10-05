# SVG 输出

SVG 文件是矢量图形:您可以在 Inkscape、Illustrator 或 Affinity Designer
中打开、编辑,并将其缩放到任意大小而不损失质量。PNG 是组件的一张图片,而 SVG
保留了形状、颜色和文字。

在 18xx Maker 应用中,您可以浏览到任意游戏组件,然后点击导出按钮:

![游戏页面的工具栏,导出按钮被圈出](/images/export-button-light.png "应用工具栏中的导出按钮。")

> [!NOTE]
> 如果您在网页浏览器中使用 18xx Maker,请注意该按钮并不存在,同一位置显示的是打印图标。它只会打开浏览器的打印菜单。

选择_将游戏导出为 SVG 图片_(打开菜单后按 `s`),或在_导出选项_面板中勾选_SVG 图片_。以这种方式导出_会_遵循您在应用中设置的所有设置选项。系统会要求您选择一个文件夹,每张地图(每个变体一个)、股市、发行价表、收益表、地块和标记都会生成一个文件。文件名中包含游戏名称,导出完成后应用会打开该文件夹。

不是单张图画的页面没有 SVG:卡牌和公司执照(它们是用 HTML 制作的文字和方框)、背景页、地块清单和各种页面。请将它们导出为 [PDF](/docs/output/pdf) 或 [PNG](/docs/output/png)。

## 文件中有什么

- 文件只包含图画本身,尺寸与打印时相同(2 英寸宽的地块是 192 个单位,一个单位是 1/96 英寸,与所有矢量软件一致)。它是透明的:没有背景也没有边框,`dpi` 和 `background` 选项不适用。
- 每种颜色、线条和字体都写在文件本身中(没有样式表或类),因此在每个程序中看起来都一样。
- 一个标记的每一面和每种尺寸各有一个 SVG,并排放在同一个文件中。
- 图片始终以浅色主题渲染。

### 字体

文字保留为文字,因此您仍然可以修改它。这意味着程序需要安装这些字体才能按设计显示。18xx Maker 的字体是 [Bitter](https://fonts.google.com/specimen/Bitter)(标题和数字)、[Yrsa](https://fonts.google.com/specimen/Yrsa) 和 [Lato](https://fonts.google.com/specimen/Lato):请安装您用到的字体。每个文件顶部的注释列出了其文字所用的字体。没有该字体的程序会用其他字体显示文字,宽度可能会改变。

若要把文件分享给没有这些字体的人,或发送给印刷厂,请先把文字转换为路径:Inkscape 中为_路径 > 对象转为路径_,Illustrator 中为_文字 > 创建轮廓_。转换后文字将无法再编辑。

## 命令行

> [!IMPORTANT]
> 此工作流程要求您拥有应用的源代码,并已按照[本地开发](https://github.com/18xx-maker/18xx-maker/blob/main/DEVELOPMENT.md)的说明操作。

```bash
pnpm build && pnpm maker export <game> --format svg
```

其中 `<game>` 是内置游戏的 id 或游戏文件的路径。文件会写入 `render/<game>/svg`,并以游戏标题命名。

```bash
# 只导出地图和地块
pnpm maker export 1889 --format svg --docs map,tiles

# 只导出地图的第二个变体
pnpm maker export 1889 --format svg --docs map --variation 1
```

除非您要求,否则不会导出 SVG。若要让某个游戏始终导出 SVG,请在游戏文件中加入 `"exports": { "formats": ["pdf", "svg"] }`,参见[导出选项](/docs/games/exports)。`--dpi` 和 `--background` 标志只影响 PNG 文件,对 SVG 文件会被忽略。

请记住,这不会使用浏览器设置页面中的选项,关于如何使用您的设置,请参见 [PDF 输出](/docs/output/pdf)。
