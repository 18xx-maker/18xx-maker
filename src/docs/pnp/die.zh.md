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

### 卡牌

您可以根据自己拥有的刀模布局,把 `cards.layout` 属性设为 `dtgDie` 或 `miniEuroDie`。与地块一样,设置其中一个选项会覆盖许多其他选项,包括 `cards.sizes`(每种卡牌类型 `private`、`share`、`train` 和 `number` 可选的宽度和高度):刀模布局会忽略它,所有卡牌使用同一种尺寸。

## 订购

要订购定制刀模,我会通过 Ellison 的[网页](https://www.ellisoneducation.com/contact)联系他们。

我的订单包含运费共 770 美元。机器本身约 400 美元,两个刀模各约 150 美元。具体订单金额可能因当时的价格、您购买的刀模以及收货地点而异。您也可以关注公开的 18xx Slack 群组,因为大家经常在那里发起团购,从而大幅降低单个刀模的价格。
