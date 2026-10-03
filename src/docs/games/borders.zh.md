# 地图边界与线条

在地图上逐个六边格定义边界效率很低,也很费时间,而且我不喜欢它的外观,所以地图上提供了一种新的边界方法。需要边界的地块仍应使用旧方法。这种方法还允许您在地图上绘制任意宽度的线条,可用于河流等。

## 坐标

每个坐标可以用以下方式指定:

- `A5x10y20` - 距六边格 A5 中心的 X、Y 坐标 (10, 20)。
- `A5a30p0.5` - 从六边格 A5 的中心到角度 30 处边的一半位置 (0.5)。这与大多数地块定位方式类似。
- `A5s1` - 六边格 A5 的第 1 条边的中点。
- `A5p2` - 六边格 A5 的第 2 个顶点。

使用顶点坐标可以轻松绘制边界。同一条边界中可以混用多种写法:

```json
{ "color": "water", "coords": ["A15s1", "A15a30p0.5", "A15x10y20", "A15p2"] }
```

## 示例

这是 1867 地图中的两条河流(完整地图中还有更多):

![沿着米色地图六边格边缘绘制的两条蓝色河流边界](/images/borders-example.png "边界沿着六边格的边和顶点绘制,而不属于某一个单独的六边格。")

```json
{
  "map": {
    "borders": [
      {
        "color": "water",
        "coords": ["C13p2", "C13p3"]
      },
      {
        "color": "water",
        "coords": ["C11p2", "C11p3", "C11p4", "D12p3", "D12p4"]
      }
    ]
  }
}
```

您也可以使用 `lines` 字段(语法相同),以便把边界与地图中其他各种线条区分开。例如:

```json
{
  "map": {
    "lines": [
      { "color": "mountain", "dashed": true, "coords": ["A15p1", "A15p4"] }
    ]
  }
}
```

## 选项

下面是一个用到了所有选项的定义。

```json
{
  "map": {
    "borders": [
      {
        "color": "mountain",
        "dashed": true,
        "dashArray": 20,
        "offset": 4,
        "border": false,
        "width": 8,
        "borderWidth": 12,
        "coords": ["F8p3", "F8p4"]
      }
    ]
  }
}
```

这里的 `width` 和 `borderWidth` 就是默认值(`borderWidth` 默认为 `width` 加 4)。如果把 `border` 设为 `false`,那么设置 `borderWidth` 就没有实际意义了。如果把 `dashed` 设为 `true`,可以设置 `offset` 来调整虚线的位置使其更美观,并用 `dashArray` 设置虚线的长度。`dashArray` 只对 `borders` 有效,对 `lines` 无效。
