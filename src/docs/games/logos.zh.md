# SVG 公司标志

默认情况下,本程序使用纯色背景和文字标签来制作公司标记。如果需要,您也可以改用
[SVG](https://developer.mozilla.org/zh-CN/docs/Web/SVG) 标志。目前只支持 SVG 格式。

## 公司标志选项

在[配置](?config=true)页面中,“公司标志”选项有四种设置:

- `none` - 这是默认设置。不使用 SVG,标记以纯文字加公司颜色背景的方式绘制。
- `original` - 使用提供的公司 SVG 文件,不做任何编辑,置于白色背景上。
- `match` - 使用提供的公司 SVG 文件,但把其中每一种颜色都替换为当前所选公司主题中最接近的颜色。
- `main` - 与 `match` 一样使用提供的公司 SVG 文件,但还会把标志的主色改为游戏 json 文件中定义的公司颜色。

下面是一些示例,依次为 `none`、`original`、`match` 和 `main`:

![带有文字 KO 的紫色公司标记](/images/company-none.png "none")
![白色圆形上的公司标志](/images/company-original.png "original")
![使用主题颜色重新着色的公司标志](/images/company-match.png "match")
![使用主题颜色和公司颜色重新着色的公司标志](/images/company-main.png "main")

## 创建 SVG 文件

您可以使用任何常规的 SVG 软件或方法,来制作 `original` 模式所需的 SVG。唯一重要的是,把 viewBox / 文档边界框设置为一个恰好包住圆形的紧凑方框。我建议使用一个圆形(即使保存前把它删掉),以便了解标志显示在圆形城市中的效果。

另外请记住,标志会放在白色背景上。如果您希望标志带有纯色背景,我建议让该颜色延伸到 viewBox 之外(出血),这样打印标记时效果更好。

### 颜色编辑

要让上面的颜色选项生效,您需要为所有带颜色的元素添加 class 属性。对于任何 `fill` 为某种颜色的元素,添加 `color-<name>` 类。例如,标志中所有红色的部分都应带有 `color-red` 类。

任何属于标志“主色”的元素还应该**同时**带有 `color-main` 类。

任何带有描边颜色的元素应包含 `color-stroke-<name>`,如有需要还要加上 `color-stroke-main`(例如:`color-stroke-purple`)。

## 添加标志

根据您想对应的公司缩写来命名标志文件,并将其放入
[/src/data/logos](https://github.com/18xx-maker/18xx-maker/tree/main/src/data/logos)
文件夹。完成后,请**确保您已做好备份**,然后运行:

```bash
pnpm svgo
```

这会优化 SVG 并移除其中不必要的内容,这是确保 React 应用能够加载它所必需的。运行之后,请检查您的 SVG,确认它看起来仍然正常。如果不正常,或者您遇到了问题,请[告诉我](mailto:kelsin@valefor.com)。
