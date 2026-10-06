# Ellison 模切机

为了方便制作 18xx 游戏,我买了一台 [Ellison Prestige Pro](https://www.ellisoneducation.com/19101/ellison-prestige-pro-machine) 模切机。

您可以看看我第一次在试验纸上试用这台机器时拍的 [imgur 相册](https://imgur.com/a/ylTCZ5U)。

## 刀模

要使用它,您需要机器本身,以及裁切用的刀模。我为自己定制了两个刀模:

- [CST25449](https://imgur.com/cH9WNHP) - 亚克力六边格刀模(每页 4 x 6)
- [CST25450](https://imgur.com/S0ozCYE) - 亚克力迷你欧式卡牌刀模(每页 9 张)

凭这两个刀模编号,可以向他们的定制刀模部门订购与我相同的东西。亚克力刀模是指刀刃嵌在亚克力而不是木头中,这样您可以透过刀模看到正在裁切的材料(在上面链接的相册中可以看到)。

## 打印

### 地块

要用本应用打印与上述模切机匹配的地块,请在[设置](?config=true)中将地块布局选为“die”,或在您的设置中把 `tiles.layout` 属性设为 `die`:

```json
{ "tiles": { "layout": "die" }, "cards": { "layout": "miniEuroDie" } }
```

设置该属性后,地块的页面大小会被固定为 8.5" x 11"。

另外还有一个 `smallDie` 选项,用于在为制作 1"(对边距离)小地块而创建的刀模上打印。我没有这个刀模,所以没能完整测试。

如果您改为手工裁切地块,请把 `tiles.cutBorder` 设为 `true`,即可在每个地块周围按精确的裁切尺寸绘制一圈细黑线。它适用于所有地块布局。

### 卡牌

您可以根据自己拥有的刀模布局,把 `cards.layout` 属性设为 `dtgDie` 或 `miniEuroDie`。与地块一样,设置其中一个选项会覆盖许多其他选项,包括 `cards.sizes`(每种卡牌类型 `private`、`share`、`train` 和 `number` 可选的宽度和高度):刀模布局会忽略它。刀模布局的纸张、边距、裁切线和出血是固定的,但卡牌尺寸不是:它在 `cards.dice` 中,每种刀模一项,默认为上面刀模的尺寸:

```json
{
  "cards": {
    "layout": "dtgDie",
    "dice": {
      "dtgDie": {
        "width": 250,
        "height": 150,
        "sizes": { "share": { "width": 200 } }
      }
    }
  }
}
```

`width` 和 `height` 的单位为 1/100 英寸。可选的 `sizes` 与 `cards.sizes` 结构相同,用于设置该刀模上某种卡牌类型的尺寸。缺少宽度或高度时使用刀模的尺寸。

### 自由布局中的定位销

刀模布局始终会绘制用于对齐刀模的定位销标记。若要在自由布局中也绘制它们,请把 `cards.showPins` 或 `tiles.showPins` 设为 `true`。自由布局不会为定位销预留空间,因此使用默认位置时,它们可能与页面边缘附近的内容重叠。请通过 `cards.pins` 和 `tiles.pins` 移动它们,或调整边距。

## 订购

要订购定制刀模,我会通过 Ellison 的[网页](https://www.ellisoneducation.com/contact)联系他们。

我的订单包含运费共 770 美元。机器本身约 400 美元,两个刀模各约 150 美元。具体订单金额可能因当时的价格、您购买的刀模以及收货地点而异。您也可以关注公开的 18xx Slack 群组,因为大家经常在那里发起团购,从而大幅降低单个刀模的价格。
