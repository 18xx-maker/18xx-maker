# 地块与六边格

游戏文件在两个地方绘制六边格:`tiles` 是玩家铺设的地块,`map` 是铺设地块的棋盘。两者使用同一种六边格定义,所以本页关于六边格内容(`color`、`track`、`cities` 等)的说明对两者都适用。这些字段见[游戏模式](https://18xx-maker.com/schemas/game.schema.json)和[地块模式](https://18xx-maker.com/schemas/tiles.schema.json)。

## 地块

`tiles` 是一个对象。每个键是一个地块编号,值说明该地块有多少块,以及当 18xx Maker 还不认识这个地块时它长什么样。编号可以是数字或字母(`57`、`T1`、`DB801`)。共有四种写法:

```json
{
  "tiles": {
    "1": 1,
    "2": { "tile": "57", "quantity": 2 },
    "26|T2": 1,
    "63": { "quantity": 2, "print": 3, "rotations": 3 },
    "T1": {
      "quantity": 1,
      "color": "offboard",
      "track": [{ "type": "offboard", "side": 1 }]
    }
  }
}
```

- **数字**是通用地块的数量。地块来自[元素 > 地块](/elements/tiles)中列出的通用地块。
- **`tile`** 让该编号成为另一个地块的别名。这里 `2` 画成 `57` 的样子,共有两块。
- **`id|extra`** 是通用地块 `id` 的另一份,带有标注。`|` 后面的部分以小字印在地块编号旁边,所以 `26|T2` 是标有 T2 的 26 号地块。查找地块时仍使用 `|` 前面的部分。
- **带有 `color` 的对象**是您自己地块的完整定义。它接受与六边格相同的字段,所以地块可以有轨道、城市、小镇、数值、标签,以及下面[元素表](#元素)中的所有内容。
- **不带 `color` 的对象**以该编号的通用地块为基础,修改或添加字段,例如 `quantity`、`print` 或 `rotations`。

与打印地块(而不是绘制地块)有关的字段:

| 字段             | 作用                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `quantity`       | 该地块共有多少块,也是地块页打印的数量和地块清单中列出的数量。                                                        |
| `print`          | 设置且不为 0 时,地块页、地块清单和统计使用它而不是 `quantity`,例如多打印几块备用。                                   |
| `group`          | 地块页按颜色和轨距给地块分组。`group` 设置您自己的组名,`individual` 让该地块与其他地块分开。                         |
| `clipPath`       | `false` 打印不带出血轮廓的地块,适用于边框复杂或有其他出血问题的地块。                                                |
| `stripeRotation` | 条纹颜色(如 `yellow/blue`)的条纹角度。                                                                               |
| `rotations`      | 仅用于 [Board18](/docs/output/b18):一个数字表示使用地块的前 n 个旋转角度,或一个以度为单位的旋转角度列表(60 的倍数)。 |
| `broken`         | 标记该地块尚未准备好导出。                                                                                           |

地块打印在地块页上(布局、宽度和间距见配置页面的 `tiles` 选项),并与数量一起列在地块清单中。

`upgrades` 是游戏模式中的一个字段,把一个地块编号映射到它可以升级成的地块编号列表。验证文件时会接受它,但 18xx Maker 不会绘制它。

## 地图的六边格

`map` 保存棋盘的六边格。其中的 `hexes` 是六边格定义的列表。每个定义有一个 `color`,以及 `hexes` 中它所适用的坐标列表,所以一个定义可以绘制很多六边格:

```json
{
  "map": {
    "hexes": [
      {
        "color": "yellow",
        "track": [{ "type": "straight", "side": 1 }],
        "hexes": ["A13"]
      },
      { "color": "plain", "hexes": ["C11", "C13", "C15"] }
    ]
  }
}
```

除了 `hexes`,地图还接受绘制在其上的各项内容的设置:`borders`、`borderTexts` 和 `lines`(参见[地图边界与线条](/docs/games/borders))、`roundTracker`、`movement`、`market` 和 `players`。这些是地图上不属于六边格的部分,详情见模式。

### 半个六边格

地图六边格的 `half` 设为 `top`、`bottom`、`left` 或 `right` 时,只绘制那一半,从中心切开,被绘制的部分四周有边界(切口本身没有)。方向是页面的方向。尖角朝上的地图上,`top` 和 `bottom` 从两条边的中点切过,`left` 和 `right` 从角到角;`"orientation": "horizontal"` 的地图则相反。只有六边格本身被切开:画在边缘之外的内容,如它的编号、名称或路线奖励,不会被切。地块会忽略 `half`。

```json
{
  "map": {
    "hexes": [{ "color": "plain", "half": "left", "hexes": ["A1"] }]
  }
}
```

## 一张或多张地图

`map` 可以是一个对象,也可以是对象列表,用于有多张地图或地图变体的游戏。列表从 0 开始编号,工具栏中的地图选择器决定显示哪一张。每一项可以有:

- **`name`** 是选择器中的名称。对第一张以外的地图,它也会印在地图上游戏标题的下面。
- **`title: false`** 让这张地图不显示游戏标题。
- **`copy`** 是列表中另一张地图的编号。这张地图以那张地图的 `hexes`、`borderTexts`、`borders` 和 `lines` 为起点,再加上自己的内容。
- **`remove`** 是坐标列表。它把这些六边格从复制来的地图中去掉。只能与 `copy` 一起使用。

一个在第一张地图基础上稍作修改的变体:

```json
{
  "map": [
    {
      "name": "Standard",
      "hexes": [{ "color": "plain", "hexes": ["A1", "A3"] }]
    },
    {
      "name": "Variant",
      "copy": 0,
      "remove": ["A3"],
      "hexes": [{ "color": "water", "hexes": ["A5"] }]
    }
  ]
}
```

所有导出地图的功能(命令行的 `--variation`、Board18 盒子)每次只处理一张地图,参见[导出选项](/docs/games/exports)。

## 元素

六边格上的这些字段会在其上绘制内容。每一个都接受一个列表。它们可以用同样的方式[定位](/docs/games/positioning)(使用 `angle`、`percent`、`mid`、`side` 等),默认情况下 18xx Maker 会替您放置。六边格边缘的边界和地图的边界参见[地图边界与线条](/docs/games/borders)。[基础元素](/elements/atoms)页面为每一种都绘制了示例。

| 元素                                    | 绘制的内容                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------- |
| `track`                                 | 六边格各边之间的轨道:`sharp`、`gentle`、`straight` 等,轨距可选             |
| `cities`                                | 城市,带有大小,以及以它为主场的公司                                         |
| `towns`                                 | 小镇(小圆点)                                                               |
| `centerTowns`                           | 一段轨道中间的小镇                                                         |
| `mediumCities`                          | 大小介于小镇和城市之间的城市                                               |
| `boomtowns`                             | 繁荣镇                                                                     |
| `offBoardRevenue`                       | 图外六边格的收益框,每个阶段一个数值                                        |
| `values`                                | 一个数字,例如城市的收益                                                    |
| `names`                                 | 地名                                                                       |
| `labels`                                | 一个字母或简短文字,如 `NY`                                                 |
| `icons`                                 | 来自 `src/data/icons` 的图标                                               |
| `shapes`                                | 简单的形状,可带文字                                                        |
| `terrain`                               | 山脉或水域等地形,带有费用                                                  |
| `bridges`、`tunnels`、`tunnelEntrances` | 桥梁或隧道的费用,以及隧道的入口                                            |
| `borders`                               | 六边格某一边上的彩色边界                                                   |
| `removeBorders`                         | 去掉六边格所列各边上绘制的边界                                             |
| `half`                                  | 只绘制地图六边格的上半(`top`)、下半(`bottom`)、左半(`left`)或右半(`right`) |
| `divides`                               | 把六边格分开的一条线                                                       |
| `companies`                             | 六边格上的公司标签,例如公司的主场                                          |
| `tokens`                                | 放在六边格上的标记                                                         |
| `goods`                                 | 货物标记                                                                   |
| `industries`                            | 带有上下两个数值的产业标记                                                 |
| `routeBonuses`                          | 路线奖励数值                                                               |

表中描述不够清楚的字段,在模式中都有说明,每个字段在那里都有描述。

## 示例

`src/data/games/18Test.json` 是测试游戏,包含 `tiles` 的每种写法以及上述各元素的示例。通用地块在 `src/data/tiles` 中,是制作您自己地块的好范例。[您的第一个游戏文件](/docs/games/first-game)展示了一个带有地图和地块的小游戏。
