# 配色主题

地图、地块、标记和公司执照上的每一种颜色都来自主题。主题分为两种,您可以在配置页面中分别选择(`theme` 和 `companiesTheme`):

- **地图主题**(`src/data/themes/maps`)为六边格、地块、轨道、小镇以及地图上绘制的其他一切元素着色。
- **公司主题**(`src/data/themes/companies`)为公司着色:标记、公司执照、股市标记和公司六边格。

要创建新主题,请在对应的文件夹中添加一个 json 文件。它会被自动识别(`src/data/index.js` 会通过 glob 匹配 `themes/**/*.json`),文件名(不含 `.json`)就是该主题的 id。

## 主题文件

主题由 `name` 和 `colors` 对象组成,并由[主题模式](https://18xx-maker.com/schemas/theme.schema.json)校验:

```json
{
  "name": "My Theme",
  "colors": {
    "yellow": "#fdd800",
    "green": "#91be2e",
    "black": "#110a0c",
    "white": "#fff"
  }
}
```

颜色是十六进制字符串(`#fff`、`#ffffff`、`#ffffff80`),或不含空格的 `rgb(1,2,3)`。运行 `pnpm validate` 可检查您的文件。

地图主题是单独使用的,因此它必须定义地图所需的每一种颜色:请复制一个现有主题(`gmt` 是默认主题)再进行编辑。如果找不到所选的地图主题,则使用 `gmt`。公司主题则不同,详见下文。

## 上下文与阶段

`colors` 中的值可以是一种颜色,也可以是按上下文对颜色分组的对象。同一个名称在绘制不同内容时可以是不同的颜色:

```json
{
  "colors": {
    "black": "#37383a",
    "track": {
      "default": "#656565",
      "yellow": "#ffc004",
      "green": "#92d051"
    },
    "tile": { "plain": "#d9d9d9", "border": { "yellow": "#d9d9d9" } }
  }
}
```

- `map`、`tile`、`track`、`town`、`city` 和 `border` 等分组只会被需要它们的绘制部分使用。如果该分组中有正在查找的颜色,就使用它,否则使用顶层的颜色。
- 当最终的值是对象时,它是一次**阶段**查找。这里的阶段指正在绘制的六边格的颜色(`plain`、`yellow`、`green`、`brown`、`gray` 等),如果该阶段没有对应条目,则使用 `default`。

完整示例请参考地图主题,例如 `src/data/themes/maps/moon.json`。

## 公司主题

公司主题是一份扁平的具名颜色列表,游戏文件中的公司通过 `color` 字段引用它们:

```json
{
  "name": "DTG",
  "colors": {
    "black": "#1a1919",
    "blue": "#0089c4",
    "lightBlue": "#b9e5fb",
    "red": "#d8222a"
  }
}
```

`rob` 主题(默认主题)始终最先加载,所选主题会合并覆盖在它之上,因此公司主题只需包含它要修改的颜色。以下名称也被接受为别名:`cyan`(`lightBlue`)、`grey`(`gray`)、`lightGreen`(`brightGreen`)、`navy`(`navyBlue`)和 `purple`(`violet`)。

公司执照上打印的公司名称是另一项单独的设置,见[公司别名](/docs/games/types)。

## 游戏文件中的颜色

游戏可以通过 `colors` 字段添加自己的颜色。它们会合并覆盖在所选主题之上,因此游戏既可以添加新名称,也可以修改已有名称:

```json
{
  "colors": {
    "PGER_orange": "#cc6433",
    "PGER_green": "#1d4922",
    "water": "#4cb2d7"
  }
}
```

之后公司就可以使用 `"color": "PGER_orange"`。游戏颜色可以使用与主题相同的分组和阶段。要修改公司颜色,请把它放在 `companies` 分组中:

```json
{ "colors": { "companies": { "red": "#aa0000" } } }
```
