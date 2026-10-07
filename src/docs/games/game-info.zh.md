# 游戏信息与规则

这些是游戏文件中描述游戏玩法的字段,以及每个字段会用于哪个页面或文件。只改变外观的字段(字体、大小、标题位置)在[游戏模式](https://18xx-maker.com/schemas/game.schema.json)的 `info` 下,这里不再重复。阶段与火车见[阶段与火车](/docs/games/trains)。

## 信息

`info` 是游戏文件中不可缺少的一个对象。

| 字段                 | 作用                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `title`              | 游戏名称:信息页、地图标题和背景页                                                             |
| `subtitle`           | 信息页和地图上标题下面的第二行                                                                |
| `designer`           | 设计者,显示在信息页和地图上                                                                   |
| `publisher`          | `src/data/publishers` 中某个出版商的 id:其标志和名称显示在信息页和游戏列表中                  |
| `currency`           | 金额的写法,用 `#` 表示数字的位置,如 `$#` 或 `#G`。配置页面中的货币选项开启时,价格和收益使用它 |
| `background`         | 数字卡牌和背景页的颜色。`number_cards`(颜色列表,与 `info` 并列)会为每种颜色打印一套数字卡牌   |
| `marketTokens`       | 每家公司有多少个股市标记,默认为 3                                                             |
| `extraStationTokens` | 每家公司在其 `tokens` 之外额外有多少个车站标记                                                |

## 链接

`links` 是网址对象(`http`、`https` 或 `mailto`)。信息页会显示您设置的那些:`rules`(规则)、`bgg`(BoardGameGeek 页面)、`purchase`(购买游戏的地方)和 `license`(游戏的许可)。

## 玩家

`players` 是一个列表,每种玩家人数一项。`number` 是必填的,其余是该人数对应的数值:

```json
{
  "players": [
    { "number": 3, "certLimit": 20, "capital": 800 },
    { "number": 4, "certLimit": 16, "capital": 600 }
  ]
}
```

- **`number`** 是玩家人数。信息页把第一项和最后一项显示为玩家人数范围,带有 `minPlayers` 或 `maxPlayers` 的私有公司(参见[私有公司](/docs/games/privates))会与这个范围比较。
- **`bank`** 是银行中的资金,数字或 `"∞"`。
- **`capital`** 是每位玩家的起始资金,数字或文字。
- **`certLimit`** 是玩家最多可持有的证书数。它是数字,或带斜线的文字(如 `"20/16/13"`),用于会变化的上限。
- **`floatPercent`** 是公司上市前必须售出的百分比,范围 0 到 100。

`bank`、`capital`、`certLimit` 和 `floatPercent` 也可以在整个游戏中只设置一次,与 `info` 和 `players` 并列,适用于不随玩家人数变化的游戏。在地图上的玩家表中,为整个游戏设置的值只显示一次,横跨所有玩家,该行不使用 `players` 中的值。

地图上的玩家表显示 `number`、`bank`、`capital` 和 `certLimit`,`players` 的每一项占一列。当配置页面中地图的玩家表选项开启时,它绘制在 `map.players` 指定的位置(参见[地块与六边格](/docs/games/tiles))。`floatPercent` 是文件和表单编辑器的一部分,但目前没有任何输出会打印它。

## 回合流程

`turns` 是打印在每张公司执照上的流程列表。每个流程有一个 `name` 和该流程的 `steps`,当 `ordered` 为 true 时步骤会编号。`optional` 是玩家可做可不做的第二个步骤列表:

```json
{
  "turns": [
    {
      "name": "Operating Round",
      "steps": ["Lay or upgrade track", "Run trains", "Purchase trains"],
      "ordered": true,
      "optional": ["Purchase private companies"]
    }
  ]
}
```

## 回合

`rounds` 是游戏中各回合按顺序排列的列表,用于回合记录。每一项是一个标记:`label`、`color` 以及[标记](https://18xx-maker.com/schemas/game.schema.json)的其他字段,如 `icon`。回合记录绘制在 `map.roundTracker` 指定的地图位置,以及股市上,参见[股市](/docs/games/market)。回合数也会显示在信息页的统计中。

## 阶段

`phases` 在[阶段与火车](/docs/games/trains)中说明。其中三个字段会在公司执照的阶段表里为该阶段的备注添加一句话:

- `buy_companies: true` 打印 `Private companies may be purchased.`
- `events.close_companies: true` 打印 `Private companies close.`
- `events.remove_tokens: true` 打印 `Private tokens removed.`

`events` 是布尔值对象。您添加的其他事件会保留在文件中,打印时会被忽略。

## 池

`pools` 是关于游戏中各个池(如市场)的备注列表。每个池有 `name` 和 `notes`,每条备注有 `note`,以及可选的 `color` 和 `icon`。它们保留在文件中供参考,不会被打印。

## 制作中与原型

`wip: true` 和 `prototype: true` 各自会在游戏的信息页上添加一条提示,让打开未完成游戏的人知情。两者都不会改变其他任何输出。

## 分组

`groups` 是公司分组的列表。每个分组会绘制为一个小标记,用来标识其成员:出现在私有公司卡、公司执照以及公司的总裁股票上。公司和私有公司通过其 `group` 字段中的 id 加入分组。没有分组或 id 未知的公司和私有公司按原样打印。

分组有一个 `id`,以及可选的 `name`(不会打印,只在编辑器中选择分组时作为标签)、`shape`(`circle`、`diamond`、`ellipse`、`hexagon`、`square` 或 `triangle`,默认为 `circle`)、`color` 和 `borderColor`,以及 `text` 和 `textColor`。没有 `color` 时标记只有轮廓,文字颜色默认为与 `color` 形成对比的颜色。`groups` 列表只能以 JSON 编辑。哪一张股票是总裁股票由股票上的 `president` 设定,见[股票与标记类型](/docs/games/types#总裁股票):

```json
{
  "groups": [
    { "id": "east", "name": "Eastern", "shape": "square", "color": "blue" },
    { "id": "west", "shape": "diamond", "color": "black", "text": "W" }
  ],
  "companies": [{ "name": "Blue Railroad", "abbrev": "BLU", "group": "east" }],
  "privates": [{ "name": "Mail Contract", "group": "west" }]
}
```

## 各字段的用途

| 字段                                      | 用于                                 |
| ----------------------------------------- | ------------------------------------ |
| `info.title`、`subtitle`、`designer`      | 信息页、地图、背景页                 |
| `info.publisher`、`links`                 | 信息页、游戏列表                     |
| `info.currency`                           | 所有价格和收益                       |
| `info.background`、`number_cards`         | 数字卡牌、背景页                     |
| `info.marketTokens`、`extraStationTokens` | 标记页、Board18 盒子                 |
| `players`                                 | 信息页(玩家人数范围)、私有公司、地图 |
| `bank`、`capital`、`certLimit`            | 地图上的玩家表                       |
| `turns`                                   | 公司执照                             |
| `groups`                                  | 私有公司卡、公司执照、总裁股票       |
| `rounds`                                  | 地图和股市上的回合记录               |
| `phases`                                  | 公司执照上的阶段表                   |
| `wip`、`prototype`                        | 信息页                               |
| `floatPercent`、`pools`                   | 仅供参考保留,不打印                  |
