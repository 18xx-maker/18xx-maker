# 标记

18xx Maker 为标记提供了许多自定义功能,您可以在[设置页面](?config=true)中进行设置。本页将帮助您了解它们。

## 定义

本工具将标记称为“股市标记”(Market Tokens)或“车站标记”(Station Tokens)。股市标记用于股市、发行价表和收益轨(用来记录收益)。车站标记用于地图上的车站。“通用标记”(General Tokens)是在游戏层面定义的标记,用于私有公司或其他通用用途。

## 游戏文件选项

在游戏文件主要的 `info` 字段中,您可以放入两个字段,用来定义为公司打印多少标记。

`marketTokens` 定义要打印多少个股市标记,默认为 3。因此在带有发行价表的标准游戏中,您不需要定义这个字段。您也可以在公司的定义中设置此字段,仅为该公司覆盖它的值。

```json
{
  "info": { "title": "My Game", "marketTokens": 2, "extraStationTokens": 1 },
  "companies": [
    {
      "name": "Blue Railroad",
      "abbrev": "BLU",
      "color": "blue",
      "marketTokens": 4
    }
  ]
}
```

`extraStationTokens` 定义除公司自身定义的车站标记之外,还要为每家公司额外打印多少个车站标记。您也可以在某家公司上设置此字段,仅为该公司覆盖它的值。

## 第二行文字

代币可以在标签上方或下方显示第二行较小的文字，例如公司名称或运营顺序。在公司的
`token` 字段中设置 `label2`。`label2Position` 为 `"below"`（默认）或
`"above"`，`label2Color` 设置其颜色（默认与标签颜色相同）。标志代币不显示文字，
以普通地图代币绘制的公司会忽略 `token` 字段。

```json
{
  "name": "Berlin Railroad",
  "abbrev": "BR",
  "color": "orange",
  "token": { "label2": "Berlin", "label2Position": "below" }
}
```

## 私有公司图标大小

私有公司的图标、标记、公司、板块或六边形图形以默认大小绘制。在私有公司上设置
`iconSize` 即可缩放:它是默认大小的倍数,`1.5` 表示放大一半,`0.75` 表示缩小。
它同时适用于 small 和 big 两种样式。在 small 样式下有多个图形时,宽度会受到限制,
使它们仍然共享同一行。在 big 样式下,大于 1 的值在小卡片上可能会与描述和收益框重叠。

```json
{ "name": "Big Icon", "icon": "share", "iconSize": 1.5 }
```

## 工具设置选项

您可以在工具中设置每种标记的大小。大小以百分之一英寸为单位。我们默认股市标记为 50(0.5 英寸),车站标记为 37.5(0.375 英寸)。这些尺寸的打孔器相对容易买到,打出来的贴纸正好适合 [Rails on Boards](https://www.railsonboards.com/) 的 15 毫米和 12 毫米标记。

如果将标记布局设为 GSP,所有尺寸都会设为 0.5 英寸,并按照可在[这些纸张](https://www.amazon.com/Round-Circle-Labels-White-Printer/dp/B0731PSJLR/)上打印的方式排布标记。

您还可以告诉工具要为多少个股市标记打印背面图案。有三种设置:无、1 个或全部。我更喜欢为所有股市标记都打印背面,但每个人的偏好不同。

请记住,标记页上的所有标记都带有少量出血,以防裁切误差。放在地图上的标记是精确尺寸,但在标记页上,它们打印出来的圆会比您在工具中设置的更大。这是正常现象。

```json
{
  "tokens": {
    "layout": "free",
    "marketTokenSize": 50,
    "stationTokenSize": 37.5,
    "reverseMarketTokens": "all"
  }
}
```

![圆形公司标记的页面:大的股市标记及其背面,以及较小的车站标记](/images/tokens-example.png "每家公司都有一个股市标记、它的背面和车站标记。")

## 自制建议

我使用 [Rails on Boards](https://www.railsonboards.com/) 的标记(12 毫米和 15 毫米的标记及圆柱体),并使用亚马逊上的 [3/8 英寸](https://www.amazon.com/gp/product/B0090JVDMQ/)和 [1/2 英寸](https://www.amazon.com/gp/product/B0090JVDNA/)打孔器。
