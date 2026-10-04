# 您的第一个游戏文件

一款游戏就是一个 JSON 文件。[游戏模式](/docs/games/schemas)只要求必须有
`info.title`;其他所有顶层键都是可选的,每个键都会启用用到它的页面。已加载游戏的游戏菜单会显示它有数据的页面:

| 键                                   | 启用的页面           |
| ------------------------------------ | -------------------- |
| `map`                                | 地图                 |
| `tiles`                              | 地块和地块清单       |
| `companies`                          | 标记和公司执照       |
| `tokens`                             | 标记(不含公司)       |
| `stock.market`                       | 股市                 |
| `stock.par.values`                   | 发行价               |
| `privates`, `trains`, `number_cards` | 卡牌页面上的各类卡牌 |

卡牌、背景和收益页面始终存在。`info` 保存标题、设计师、货币等信息。把 `wip` 或
`prototype` 设为 `true`,会显示一条提示游戏尚未完成的横幅。

## 一个简单的起步示例

这个文件可以通过校验,包含地图、地块、两家公司、带发行价表的股市、火车和阶段。请将它保存为
`my-game.json`:

```json
{
  "info": {
    "title": "My First 18xx",
    "designer": "Me",
    "currency": "$#"
  },
  "wip": true,
  "companies": [
    {
      "name": "Alpha Railroad",
      "abbrev": "AR",
      "color": "red",
      "tokens": [0, 40, 100]
    },
    {
      "name": "Beta Railway",
      "abbrev": "BR",
      "color": "blue",
      "tokens": [0, 40, 100]
    }
  ],
  "stock": {
    "type": "1D",
    "par": { "values": [60, 70, 80, 90, 100] },
    "market": [[40, 50, 60, 70, 80, 90, 100, 110, 120, 140, 160]]
  },
  "trains": [
    { "name": "2", "quantity": 4, "price": 80, "color": "yellow" },
    { "name": "3", "quantity": 3, "price": 180, "color": "green" }
  ],
  "phases": [
    { "name": "2", "limit": 4, "rounds": 1, "tiles": "yellow" },
    { "name": "3", "limit": 4, "rounds": 2, "tiles": "green", "on": "3" }
  ],
  "tiles": { "7": 3, "8": 3, "9": 3, "57": 2 },
  "map": {
    "hexes": [
      { "color": "plain", "hexes": ["A1", "B1", "C1", "B2"] },
      {
        "color": "plain",
        "cities": [{ "name": { "name": "Alphaville" }, "companies": ["AR"] }],
        "hexes": ["A2"]
      },
      {
        "color": "plain",
        "cities": [{ "name": { "name": "Betaburg" }, "companies": ["BR"] }],
        "hexes": ["C2"]
      }
    ]
  }
}
```

需要注意的几点:

- `map.hexes` 是六边格定义的列表。每个定义都有一个 `color` 和一组适用的坐标,因此一个定义可以给多个六边格上色。城市的
  `companies` 会把对应公司的起始标记放在那里。
- `tiles` 把地块编号映射到该地块的数量。地块编号来自 18xx Maker 已知的通用地块。[元素 > 地块](/elements/tiles)还会显示每个游戏自己的地块,其他游戏必须自行定义这些地块。
- `trains` 和 `phases` 的说明见[阶段与火车](/docs/games/trains)。

## 加载与编辑

把文件拖进窗口,或按 `o`。[文件](/docs/files)说明了应用和网站如何处理它,包括修改如何生效(应用会监视文件,网页则需要点击刷新)。不断编辑
JSON 并重新加载,直到效果满意为止。

如果想在不打开文件的情况下检查它,可以运行校验器,它会输出每个问题的路径:

```shell
pnpm maker validate my-game.json
```

## 接下来看什么

- 阅读真实的游戏文件,它们是最好的参考。可以在[加载游戏](/games)页面保存任意内置游戏,也可以在 GitHub 上的
  [src/data/games](https://github.com/18xx-maker/18xx-maker/tree/main/src/data/games)
  中查看。
  [18Test](https://github.com/18xx-maker/18xx-maker/blob/main/src/data/games/18Test.json)
  体量很小,却用到了大部分功能,而 [Shikoku 1889](/games/1889) 是一款完整的小型游戏。
- [阶段与火车](/docs/games/trains)
- [股票与标记类型](/docs/games/types)
- [地图边界与线条](/docs/games/borders)
- [自动定位](/docs/games/positioning)
- [标志](/docs/games/logos)和[公司替换](/docs/games/overrides)
- [导出选项](/docs/games/exports),用于设置游戏的导出方式
- [JSON 模式](/docs/games/schemas),许多编辑器可以用它来补全和检查游戏文件
- [常见问题](/docs/faq)
