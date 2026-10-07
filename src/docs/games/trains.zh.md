# 阶段与火车

阶段与火车在 1.0.0 版本中做了修改,以支持 [18xx.games](https://www.18xx.games/) 等程序所需的行为数据。

## 阶段字段

- **name** _必填_ 阶段的名称
- **limit** _必填_ 在该阶段中,每家公司最多可以拥有的火车数量
- **tiles** _必填_ 该阶段允许使用的地块颜色。目前只需列出最高的颜色,较低的颜色默认也允许使用。这与大多数阶段表只显示最高颜色的做法一致。
- **minor** 布尔值,表示该阶段只对小公司有效。
- **company** 字符串,为公司缩写,表示该阶段只应显示在这家公司的公司执照上。
- **train** 如果阶段名称与相关火车的名称一致,则不需要此字段。该字段可以是单个火车名称的字符串,也可以是该阶段可用的所有火车的数组。[18xx.games](https://18xx.games)
  上的 1844 和 1846 等游戏会用到它。
- **rounds** 该阶段中每一组要进行多少个运营轮(OR)。适用于 1830 这类每个阶段运营轮数不同的游戏。
- **on** 哪种火车触发该阶段开始,即购买该火车时该阶段开始。可以是单个火车名称,也可以是火车名称的数组。也可以是单个(或数组)对象,其中每个对象有一个 `on` 字段(火车名称)和一个
  `index` 字段,用于指定由第几辆火车触发该阶段。
- **notes** 该阶段的备注,字符串或字符串数组。部分备注会由其他字段自动添加,此字段用于自定义备注。
- **buy_companies** 布尔值,表示在该阶段中是否可以购买私有公司。
- **events** 一个由布尔字段组成的对象,表示该阶段触发时会发生的其他事件(例如私有公司关闭或标记被移除)。这些事件的具体格式与 [18xx.games](https://18xx.games)
  上游戏的实现相关。

## 火车字段

- **name** _必填_
- **quantity** _必填_ 可用火车的数量,可以是数字,也可以是字符串 "∞"。
- **color** _必填_ 显示这辆火车标题时使用的颜色。
- **price** 这辆火车的价格。
- **image** 这辆火车使用的图片(可用图片请参阅模式、代码或 18Test 文件)。
- **phase** 如果不希望这辆火车出现在阶段表上,请将其设为 `false`。
- **print** 这辆火车要打印的数量。打印时会覆盖 `quantity` 字段。当 quantity 设为 "∞" 时必填。
- **discount** 一个对象,将火车名称映射到折扣金额。
- **upgrade** 该火车作为升级购买时的费用。以箭头形式显示在价格下方。
- **tradeIn** 该火车折价换购时的价值。以括号形式显示在价格下方。
- **priceFormat**、**upgradeFormat**、**tradeInFormat** 对应数值的格式字符串,其中第一个 `#` 会被替换为该值:`"#G"` 显示为 `300G`,`"+#"` 显示为 `+200`。它会取代该值的游戏货币和货币配置,当值为文本时将被忽略。箭头和括号保持不变。请保持格式简短,文字不会缩小。公司火车上的格式需要完整的火车定义,包括 `color` 和价格:只写 `{ "name", "priceFormat" }` 是无效的。
- **description** 打印在火车卡牌上的描述字符串,适合放置游戏中的各种提示信息。
- **available** 如果这辆火车在另一种火车售出时才变为可用,可以把那种火车以字符串形式列在这里。典型的例子是 1830 中的 D 火车,在 6 火车被购买后才可用。
- **variant** 如果这辆火车只用于某个变体,可以列在这里。
- **rust** 使这辆火车报废(rust)的火车名称,可以是名称数组。也可以是单个对象(或对象数组),其中每个对象有一个 `on` 字段和一个 `index`
  字段,分别表示导致报废的火车名称(`on`)以及该火车的第几辆(第 2 辆或之后)。
- **phased** 与 `rust` 相同,但表示这辆火车是被淘汰(phased out),而不是报废。
- **obsolete** 与 `rust` 相同,但表示这辆火车变为过时(obsolete),而不是报废。
- **permanent** 如果这辆火车不是永久火车,请设为 false。如果设置了 `rust`、`obsolete` 或 `phased` 中的任何一个,则不需要此字段。
- **players** 这辆火车适用的玩家人数 _(以后可能会改为像私有公司那样使用最少/最多玩家人数)_。
- **back** 这辆火车卡牌的背面,在配置 [duplex](/docs/output/pdf#双面卡牌) 开启时印在正面之后。这辆火车的所有副本共用同一个背面。它可以是普通背面,包含 `title`(默认为火车名称)、其下较小的 `text`、文字的 `color` 以及 `backgroundColor`;也可以是完整的火车(包含 `name` 和 `color` 以及上述字段),按普通火车卡牌的样式、使用自己的数值印刷,适用于另一面是另一辆火车的情况。完整背面采用火车页面中的火车字段,但不包括 `title` 和 `text`;其自身的 `back` 和 `quantity` 会被忽略。没有 `back` 的火车背面为空白。

## 示例

请查看 18Test 文件,了解其中大部分字段的示例。下面是一个**合成**示例(它可以通过校验,但并非取自任何内置游戏),展示了 `on`、`index`、`rust`、`events`、`notes`、`print`、`discount` 和 `available`:

```json
{
  "phases": [
    { "name": "2", "limit": 4, "rounds": 1, "tiles": "yellow" },
    {
      "name": "3",
      "limit": 4,
      "rounds": 2,
      "tiles": "green",
      "on": "3",
      "buy_companies": true,
      "notes": "Privates may be bought"
    },
    {
      "name": "5",
      "limit": 2,
      "rounds": 3,
      "tiles": "brown",
      "on": { "on": "5", "index": 2 },
      "events": { "close_companies": true }
    },
    { "name": "D", "limit": 2, "tiles": "brown", "on": ["6", "D"] }
  ],
  "trains": [
    { "name": "2", "quantity": 6, "price": 80, "color": "yellow", "rust": "4" },
    { "name": "3", "quantity": 5, "price": 180, "color": "green", "rust": "6" },
    {
      "name": "5",
      "quantity": 3,
      "price": 450,
      "color": "brown",
      "rust": { "on": "D", "index": 2 }
    },
    {
      "name": "D",
      "quantity": "∞",
      "print": 2,
      "price": 1000,
      "color": "brown",
      "discount": { "4": 300, "5": 300, "6": 300 },
      "available": "6",
      "description": "Buy at a discount by trading in a 4, 5 or 6"
    }
  ]
}
```

## 公司火车

公司可以拥有不属于游戏火车供应的火车，例如初始火车。在公司的 `trains`
字段中列出它们。每个条目可以是：

- 火车名称（`"4"`），游戏中该火车的一张副本，
- 带数量的引用（`{ "name": "4", "quantity": 2 }`），游戏中某火车的多张副本，
- 完整的火车（上面的字段），`quantity` 可选（默认 1）。数量为 "∞" 时改用
  `print`。

游戏中不存在的名称会被跳过。这些是游戏 `trains` 中 `quantity`
之外的额外副本，不会改变阶段表。将 `trains` 设为 `false`
可隐藏公司执照上的 "Trains" 标签。

```json
{
  "name": "Awa Railroad",
  "abbrev": "AR",
  "trains": ["2", { "name": "3", "quantity": 2 }]
}
```

默认情况下，这些火车作为小火车卡打印在公司执照上。将公司执照配置中的**火车卡**选项
（`charters.trainCards`）设为 `cards`，则改为打印在火车卡页上。没有空间的执照（半宽）始终使用火车卡页。公司执照上的火车默认带黑色边框和卡片式圆角；可用**火车卡边框**（`charters.trainCardBorder`）和**火车卡圆角**（`charters.trainCardRound`）选项分别关闭。
