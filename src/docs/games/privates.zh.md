# 私有公司

`privates` 是一个列表,每个私有公司一张卡牌。这些卡牌与股票、火车和数字卡牌一起打印在卡牌页上。只有 `name` 是必填的。这些字段见[游戏模式](https://18xx-maker.com/schemas/game.schema.json)。

```json
{
  "privates": [
    {
      "name": "Private with a company",
      "price": 140,
      "revenue": 10,
      "company": "PRR",
      "description": "Description"
    },
    {
      "name": "Private with a token",
      "price": 160,
      "revenue": 15,
      "minPlayers": 3,
      "token": { "color": "green", "label": "3" },
      "description": "Description"
    }
  ]
}
```

## 文字

| 字段          | 打印的内容                       |
| ------------- | -------------------------------- |
| `name`        | 名称,在最上面                    |
| `id`          | 名称前方方框中的简短编号,如 `P6` |
| `note`        | 名称下方的一行文字               |
| `description` | 私有公司的文字,说明它的作用      |
| `variant`     | 右下角的小标签                   |

`idBackgroundColor` 是 `id` 方框的颜色。

## 价格、收益和出价

- **`price`** 是数字或文字。数字会按货币格式化(见下文),文字(如 `"Free"`)原样打印。
- **`revenue`** 是数字、数字列表(中间用 `/` 隔开,用于会变化的收益)或文字,如 `"50% / 50%"`。它打印在 `Revenue:` 之后。
- **`bid`** 打印 `Min bid:` 和金额。它用于需要拍卖的私有公司。
- **`priceFormat`** 和 **`revenueFormat`** 是带有 `#` 的字符串,`#` 会被数字替换:`"priceFormat": "#G"` 打印 `100G`。它们对该字段取代游戏的 `info.currency`,当值是文字时不使用。没有它们时,如果配置页面货币设置中的 `private` 选项开启,数字会按游戏的 `currency`(例如 `$#`)打印,关闭时则直接打印数字。

## 玩家人数限制

`minPlayers` 和 `maxPlayers` 把私有公司限制在某些玩家人数。当限制比游戏的[玩家](/docs/games/game-info#玩家)范围更窄时,卡牌会打印 `Players: 3-5`(两者相等时为 `Players: 3`);如果私有公司出现在每种人数的游戏中,则不打印任何内容。

## 图形

私有公司可以显示一个或多个说明其作用的图形。它们来自这些字段:

- **`hex`** 绘制该坐标处的地图六边格及其上的所有内容。它优先于 `tile`。
- **`tile`** 按编号绘制一个地块。该地块可以是游戏自己的地块或别名,参见[地块与六边格](/docs/games/tiles)。
- **`company`** 绘制该缩写对应公司的标记。
- **`token`** 绘制您当场描述的标记。它接受标记的字段,如 `color`、`label`、`logo` 和 `icon`。
- **`icon`** 绘制 `src/data/icons` 中的图标,颜色为 `iconColor`。

使用 `big` 私有公司样式(见配置页面中的私有公司选项)时,图形绘制在卡牌右上角,文字环绕它们。使用 `small` 样式时,图形排成一行,位于描述开头。有多个图形时,每个占用这一行宽度的一部分。

私有公司的 `group` 是游戏中某个[分组](/docs/games/game-info#分组)的 id。它的标记绘制在名称行的右上角、`id` 旁边,不属于上面的图形。

`iconSize` 缩放卡牌上的所有图形。它是默认大小的倍数,所以 `1.25` 大四分之一,`0.75` 小四分之一。使用 `small` 样式时宽度保持在这一行之内,因此多个图形仍然放得下。`18Test.json` 中有各种大小的私有公司可供比较。

## 能力和其他字段

`abilities` 是带有 `type` 的对象列表。它保留在文件中供参考,例如用来保存私有公司在另一个系统中的作用,不会被打印。`debt`、`sym` 和 `image` 会被模式接受,但同样不会被打印。请把玩家需要的规则写在 `description` 中。

## 字体与颜色

每一段文字都有自己的字体字段,以该段文字命名。对于 `name`、`id`、`note`、`desc`(描述)、`price`、`revenue`、`bid`、`variant` 和 `players`,它们是:

| 字段                | 示例                          |
| ------------------- | ----------------------------- |
| `<piece>FontFamily` | `"nameFontFamily": "display"` |
| `<piece>FontWeight` | `"descFontWeight": "bold"`    |
| `<piece>FontStyle`  | `"noteFontStyle": "italic"`   |
| `<piece>FontSize`   | `"priceFontSize": 14`         |
| `<piece>Color`      | `"revenueColor": "red"`       |

`FontSize` 以磅为单位,且为整数。`fontColor` 设置所有文字的颜色,某一段的 `<piece>Color` 优先于它。`backgroundColor` 是卡牌的颜色(默认白色),`revenueBackgroundColor` 在收益后面加一块背景。颜色可以是公司[主题](/docs/games/themes)中的名称,也可以是任何 CSS 颜色。`playersFontFamily` 和其他 `players` 字段用来设置 `Players:` 这一行的样式。描述太长放不下时,请把 `descFontSize` 调小。
