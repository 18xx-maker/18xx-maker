# 股市与发行价表

游戏文件的 `stock` 字段包含股市、发行价表以及与之配套的图例。[股市](/games/18Test/market)、[发行价](/games/18Test/par)和[收益](/games/18Test/revenue)页面负责绘制它们,请参阅[游戏页面](/docs/games/pages)。`18Test.json` 包含了这里所述大部分内容的示例,模式见 [JSON 模式](/docs/games/schemas)。

```json
{
  "stock": {
    "type": "2D",
    "market": [
      [
        { "value": 60, "legend": 0, "arrow": "down" },
        67,
        71,
        { "value": 76, "par": true }
      ],
      [null, 60, 66, { "value": 70, "arrow": "up" }]
    ],
    "par": { "values": [76, 71, 67] },
    "legend": [
      { "color": "yellow", "description": "Does not count toward the limit" }
    ],
    "movement": { "up": ["Sold out"], "right": ["Paid dividends"] },
    "display": { "movement": { "x": 5, "y": 0 } }
  }
}
```

## 股市类型

`stock.type` 为 `2D`、`1D` 或 `1Diag`。务必设置它:没有类型的股市是空的。

- `2D` 是网格。`stock.market` 是行的列表,各行长度可以不同,也可以以 `null` 格子开头,因此三角形无需补齐。
- `1D` 是单独一行,`stock.market` 是格子的列表。一个格子的高度等于配置中的列高(默认 4 个格子),其标签旋转绘制,其 `companies` 的缩写写在它们的条上。
- `1Diag` 是之字形的一行。格子相隔半个格子,每隔一个格子低一行,每个格子的高度等于配置中的斜行高度(2 个格子)。

设置 `"title": false` 后,股市从顶部开始,不再为标题留出空间(`par` 中的同名字段隐藏发行价表的标题)。

## 格子

格子可以是 `null`(不绘制任何内容)、数字(价格,以股市的货币书写)、字符串(标签),或带有以下字段的对象:

| 字段         | 作用                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `value`      | 价格,以股市的货币格式化。格子有 `value` 时,不绘制它的 `label`                                      |
| `label`      | 代替价格的文字                                                                                     |
| `subLabel`   | 在对角处的第二段文字                                                                               |
| `color`      | 背景色                                                                                             |
| `labelColor` | 文字的颜色,默认选用易读的颜色                                                                      |
| `legend`     | `stock.legend` 某个条目的索引(0 是第一个),格子采用该条目的颜色                                     |
| `par`        | `true` 表示发行价,格子采用发行价表的颜色                                                           |
| `arrow`      | `up`、`down`、`left` 或 `right`,或它们的列表,画在格子的角上:down 和 left 在左侧,up 和 right 在右侧 |
| `arrowColor` | 箭头的颜色                                                                                         |
| `companies`  | 要在格子中画成条的公司缩写,或用 `{ "abbrev": "PRR", "row": 2 }` 指定条所在的行                     |
| `tokens`     | 画在格子中的标记,每个带有 `x` 和 `y`(默认在中间)。带有 `company` 的条目是公司标记                  |
| `width`      | 格子的宽度,以格子为单位                                                                            |
| `height`     | 格子的高度,以格子为单位                                                                            |
| `bottom`     | 把格子画在其他格子下面,让更大的相邻格子盖住它                                                      |
| `underline`  | 给文字加下划线                                                                                     |
| `rotated`    | 旋转标签(1D 和 1Diag 股市中始终开启)                                                               |
| `subRotated` | 旋转第二段文字                                                                                     |

格子的背景色按以下顺序选择:发行价格子用发行价表的颜色,然后是图例条目、格子自己的 `color`、`stock.cell` 的 `color`,最后是朴素的颜色。

`stock.cell` 给出每个格子起始的尺寸和颜色:`width` 和 `height` 是配置中格子尺寸的倍数(`width` 为 1.5 即一个半格子),`color` 是默认颜色。

[配置面板](?config=true)的“股市”部分包含格子大小、价格在格子的顶部还是底部、箭头的位置(顶部、中间或底部)、列、斜行和发行价的尺寸,以及要显示哪些部分。

## 图例

`stock.legend` 是条目的列表,每个条目有 `description` 和 `color`,还可以有 `borderColor`、`borderWidth`、`fontFamily`、`fontSize` 和 `fontWeight`(`icon` 目前不会绘制)。格子通过 `legend` 用索引引用条目。

`2D` 股市仅当 `stock.display.legend` 指定位置时才绘制图例:`x` 和 `y` 以格子为单位,从角落算起,每个条目比上一个低 35 个单位。`reverse` 反转顺序,`align` 为 `left` 或 `right`,`verticalAlign` 设为 `bottom` 时条目向上堆叠。`1D` 股市的图例是格子下方的一行,`1Diag` 股市也是如此,可用 `display.legend` 的 `x` 和 `y` 移动它(以单位计,而不是格子)。配置中的“显示股市图例”设置会关闭这一切。

## 发行价表

`stock.par.values` 是发行价的列表,按行排列,与股市的格子相同。每一项是数字、字符串或格子对象,全部都是发行价格子:

| 字段     | 作用                                       |
| -------- | ------------------------------------------ |
| `values` | 表的格子                                   |
| `color`  | 发行价格子的背景色,默认灰色                |
| `width`  | 格子的宽度,以格子为单位,默认 4(配置中的值) |
| `height` | 格子的高度,以格子为单位,默认 1             |
| `title`  | `false` 隐藏表上方的标题                   |

发行价页面单独打印这张表。若还要把它画在股市上,请把 `stock.display.par` 设置为其角落的 `x` 和 `y`(以格子为单位)。配置中的“显示股市发行价表”设置会关闭它。

## 股价变动图例

`stock.movement` 说明股价如何变动。它的键 `up`、`down`、`left` 和 `right` 是文字的列表,绘制成围绕“Price”一词的箭头。其他任何键(如 `18Test.json` 中的 `2x right`)会写在下方,作为以该键开头的一行。用 `stock.display.movement`(`x` 和 `y`,以格子为单位)把它画在股市上。地图也可以用 `map.movement` 绘制它:不要同时设置两者,放在地图上的股市会自己绘制。

## 回合记录

`stock.display.roundTracker` 把游戏的回合(`rounds`)作为标记画在股市上,方便玩家标记当前的回合。`x` 和 `y` 以格子为单位,`type` 为 `row`(默认)、`row-reverse`、`col`、`col-reverse` 或 `round`,后者把它们放在圆上,可用 `rotation`(以度计)旋转。配置中的“显示股市回合记录”设置会关闭它。地图上的同名字段 `map.roundTracker` 把它画在地图上。

## Ledge

`stock.ledges` 在股市上从格子角到格子角绘制线条,例如用来圈出一组格子:

```json
{
  "ledges": [
    {
      "coords": ["4 0", "4 1", "15 1", "15 0", "4 0"],
      "color": "orange",
      "dashed": true
    }
  ]
}
```

`coords` 的每一项是 `"x y"`,即网格的一个角点,以格子为单位(`0 0` 是第一个格子的左上角)。其他字段有 `color`、`width`(默认 3)、`border` 加 `borderWidth`(用轨道颜色给线条描边),以及 `dashed` 加 `dashArray` 和 `offset`。

## 显示选项

`stock.display` 包含上述各部分的位置(`par`、`legend`、`roundTracker` 和 `movement`),以及 `extraTotalWidth` 和 `extraTotalHeight`,即页面右侧和底部额外的空间(以单位计)。股市也可以用 `map.market` 加 `x` 和 `y` 画在地图上,仅当配置中“地图”的股市设置开启时才显示。

## 收益表

收益页面打印一张从 1 到 100 的数字表,每行 20 个,每第五个数字为黄色,每第十个为橙色。顶层的 `revenue` 字段可以更改它:`min` 和 `max` 是第一个和最后一个数字,`perRow` 是每行的个数。它不属于 `stock`,每款游戏都有这个页面。

## 限制

`stock.limits` 是价格范围的列表(`description`、`color`、`min` 和 `max`),例如允许的发行价。它只随游戏保存以供参考,不会被打印。
