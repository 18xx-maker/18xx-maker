# 自动定位

自动定位系统会按照一些非常简单的规则,为它找到的元素自动应用定位。这个系统并不追求面面俱到,只是为了帮助处理常见的 95% 的定位情况。

例如:18xx-maker 对简单地块有一套自己偏好的标准。如果一个地图六边格只有一座城市和一项地形费用,只要该六边格上没有其他定位数据,自动定位就会把地形费用放到“标准”位置。如果您想自定义元素的位置,尽管去做,本系统只是在您不指定时提供合理的默认值。

如果您想为某个元素关闭自动定位,只需给该元素添加一个定位字段(`angle`、`percent`、`rotate`、`rotation`、`side`、`mid`、`align`、`x` 或 `y`)。例如添加 `"angle": 0` 就会有效地关闭自动定位,同时让元素保持在六边格中央。这只会关闭该元素的自动定位,六边格上的其他元素仍会被定位。

下面的每条规则都在[自动定位](/elements/positioning)示例页面上实时绘制,并附有对应的 JSON。

## 规则

### 图标

图标(位于有城市或 centerTown 的地块上时)会被移动到([示例](/elements/positioning#icons)):

```json
{
  "angle": 0,
  "percent": 0.6
}
```

如果同时还有地形费用,则图标会向左移到:

```json
{
  "angle": 30,
  "percent": 0.6
}
```

### 数值

每个地块的第一个数值会被自动定位到右上角([示例](/elements/positioning#values)),其他数值不会被移动:

```json
{
  "angle": 210,
  "percent": 0.7
}
```

### 标签

地块上的第一个标签会被自动定位到左上角([示例](/elements/positioning#labels)):

```json
{
  "angle": 150,
  "percent": 0.7
}
```

地块上的第二个标签会被自动定位到右侧,其他标签不会被移动:

```json
{
  "angle": 270,
  "percent": 0.7
}
```

### 地形

地形费用(位于有城市或 centerTown 的地块上时)会被移动到([示例](/elements/positioning#terrain)):

```json
{
  "angle": 0,
  "percent": 0.7
}
```

如果同时还有图标,则地形费用会向右移到:

```json
{
  "angle": 330,
  "percent": 0.7
}
```

## 命名位置

除了自己计算 `angle` 和 `percent`,元素还可以用 `mid` 指定轨道上的一个点,并用 `align` 使其朝向该处的轨道。它们适用于所有带位置的元素(小镇、centerTown、数值、标签、图标等)。与其他定位字段一样,它们会关闭该元素的自动定位。每个点都对应从边 1 开始的轨道,可用 `side` 将其移到其他边。

- `mid` 是某种轨道类型的中点:`straight`(`angle` 0、`percent` 0,即中心)、`sharp`(`angle` 30、`percent` 0.577)或 `gentle`(`angle` 60、`percent` 0.268)。
- `side` 与 `mid` 一起使用时,会像从该边开始的轨道一样旋转该点,因此边 3 上的 `gentle` 位于 `angle` 180。没有 `mid` 时,`side` 仍然是旋转元素。
- `align` 为 `perpendicular`(垂直)或 `parallel`(平行)于该点处的轨道。`sharp` 上的小镇条为 `perpendicular` 时 `rotation` 是 120,`gentle` 上是 150。`rotate` 和 `rotation` 会作为偏移量叠加。
- 明确给出的 `angle` 或 `percent` 会替换 `mid` 的值,`x` 和 `y` 则从该点开始微调。

```json
{
  "track": [{ "type": "gentle", "side": 1 }],
  "towns": [{ "mid": "gentle", "align": "perpendicular" }]
}
```

([示例](/elements/positioning#named))

## 绘制顺序

位置只决定元素放在哪里。哪个元素画在哪个之上,由按类型固定的顺序决定(城市,然后是数值、标签、标记、地形、图标等)。要改变它,给元素加上 `order`。它会在该地块所有没有 `order` 的元素之后绘制,`order` 小的先画,它的位置不变。例如,让城市画在数值之上:

```json
{
  "cities": [{ "order": 1 }],
  "values": [{ "value": 30, "x": 0, "y": 0 }]
}
```

- 负数让元素画在所有其他元素之前,`true` 让它最后绘制,`0` 让它画在没有 `order` 的元素之后。
- `order` 相同的元素保持通常的类型顺序。
- 元素始终留在地块边框和编号的同一侧:内部元素不能画到边框之上,画在外面的元素(如外部城市或名称)不能画到边框之下。
- 它可以盖住轨道。
- 轨道、边外轨道、分隔线和边框没有 `order`。
