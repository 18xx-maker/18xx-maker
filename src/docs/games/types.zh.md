# 股票与标记类型

现在,您可以在游戏文件中为所有公司添加股票和标记,而无需把同一个定义复制粘贴到每家公司。

## 用法

您不必为每家公司分别定义标记和股票,而是可以用一个字符串代替定义。这个字符串必须引用文件中定义的 `shareTypes` 或 `tokenTypes` 对象的某个字段。

`shareTypes` 和 `tokenTypes` 中的定义与以前作为各公司一部分时的作用完全相同。

名称 `default` 和 `minor` 有特殊行为。如果您定义了名为 `minor` 的标记或股票类型,并且有设置了 `"minor": true` 的公司,那么 xxMaker 会把这些定义用于所有没有自己的股票或标记定义的小公司。如果您定义了名为 `default` 的标记或股票类型,那么 xxMaker 会把这些定义用于所有未被 `minor` 定义覆盖、且没有自己的股票或标记定义的公司。

## 示例

下面的游戏有 `minor` 和 `default` 两种类型,以及三家公司。第一家是小公司,第二家没有自己的定义,第三家按名称选用了 `default` 类型:

```json
{
  "tokenTypes": {
    "minor": ["Home"],
    "default": ["Home", 40, 100]
  },
  "shareTypes": {
    "minor": [{ "quantity": 2, "percent": 50, "shares": 1 }],
    "default": [
      {
        "quantity": 1,
        "label": "President's Certificate",
        "percent": 20,
        "shares": 2
      },
      { "quantity": 8, "percent": 10, "shares": 1 }
    ]
  },
  "companies": [
    {
      "name": "Black Railroad",
      "abbrev": "BLRR",
      "color": "black",
      "minor": true
    },
    { "name": "Blue Railroad", "abbrev": "BLU", "color": "blue" },
    {
      "name": "Red Railroad",
      "abbrev": "RED",
      "color": "red",
      "tokens": "default",
      "shares": "default"
    }
  ]
}
```

类型可以使用任意名称,公司通过字符串引用它们,例如
`"tokenTypes": { "default": ["Free", 40], "one": ["Free"] }` 搭配
`{ "abbrev": "KU", "tokens": "one" }`。`src/data/games` 中的 1889 和 1867 文件用到了这些。

## 起始标记

`tokens` 中的条目也可以是带有 `cost`(格子下方的标签)和 `start` 的对象,用于游戏开始时已在该格放有标记的公司。起始标记已经在地图上,因此公司执照会与其他格子区别显示:颜色样式在该格显示公司标志而不是空圆圈,而 carth 样式(每个格子都显示标志)则让该格保持为空。`start: false` 与省略相同,`cost` 为可选:

```json
{ "abbrev": "RED", "tokens": [{ "cost": "Home", "start": true }, 40, 100] }
```

## 贷款格

公司还可以有 `loans`,即公司执照上的额外格子,例如用于游戏中的贷款。每个条目是格子下方的标签,
每个格子都会印成一个空的方块,位于公司执照正文右侧、标题栏下方,每列的数量取决于公司执照的高度,因此不会与标记混淆。空字符串或 `null` 表示该格没有标签:

```json
{ "abbrev": "RED", "tokens": [0, 40], "loans": [50, 50, ""] }
```

第一个贷款格位于最右列,贷款格从上到下填满该列,然后继续填左边的一列。放不下的贷款格会被截掉,因此小公司和半宽公司执照上请少放一些。

## 名称下方的标记

标记很多的公司可以设置 `tokensBelow`,把标记格印在公司名称下方的一行,而不是名称右侧,
这样不会挤压名称。标记会缩小以适应公司执照的宽度,名称只有一行的空间,因此请保持简短并省略副标题。半宽公司执照本来就把标记堆叠起来,
会忽略该设置:

```json
{
  "abbrev": "RED",
  "tokens": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  "tokensBelow": true
}
```

## 公司牌的横幅

公司可以设置 `banner`，在公司牌底边的条带中以公司颜色打印一段标签，例如用来标记系统公司或其他特殊的公司牌。文字按原样打印，不会被翻译。条带位于公司牌内部，因此公司牌的大小不变，内容会上移以避开它：

```json
{ "abbrev": "RED", "banner": "SYSTEM" }
```

## 公司牌的副标题

公司可以在公司牌的名称下方打印一行小字，分为三个位置：左侧是起始格或起始城市，中间是目的地，右侧是特殊能力。设置 `home`（字符串或列表，用 " / " 连接）、`destination` 和 `ability`，各位置会分别打印为 `Home: ...`、`Dest: ...` 以及按原样打印的能力。`ability` 不同于不打印的私有公司 `abilities`。没有值的位置保持为空，其他位置保持原位。若要打印自己的文字，请设置 `charterSubtitle` 的 `left`、`middle` 或 `right`；空字符串会清空该位置。文字不会被翻译，过长的位置会以省略号截断。在较小的标题栏（少数公司、`tokensBelow` 以及半宽的 carth 公司牌）中，副标题取代副文字。在紧凑的标题栏中，副标题也会取代 `companyNames: "both"` 作为副文字打印的别名。

示例：

```json
{
  "abbrev": "RED",
  "home": ["H5", "H7"],
  "destination": "A1",
  "ability": "Lay a free tile",
  "charterSubtitle": { "middle": "Goal: A1" }
}
```

## 公司别名

公司可以有一个 `alias`,即第二个名称,例如简称或其他语言的名称。配置页面中的 `companyNames` 配置决定公司执照和股票卡上打印什么:`name`(默认)打印名称,`alias` 改为打印别名(没有别名的公司仍打印名称),`both` 打印名称并在其下方打印别名,取代公司的 `subtext`:

```json
{ "name": "Baltimore & Ohio Railroad", "abbrev": "B&O", "alias": "B&O" }
```

## 总裁股票

股票可以设置 `president: true`,把它标记为所属公司的总裁股票。这张股票会在卡片右上角打印其公司所属[分组](/docs/games/game-info#分组)的标记,其他股票不打印标记。只有带该标志的股票会被标记,不会自动替您选择,并且在股票类型和单个公司的股票中都有效:

```json
{
  "quantity": 1,
  "label": "President's Certificate",
  "percent": 20,
  "shares": 2,
  "president": true
}
```
