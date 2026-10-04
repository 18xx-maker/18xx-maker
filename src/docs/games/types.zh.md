# 股票与标记类型

现在,您可以在游戏文件中为所有公司添加股票和标记,而无需把同一个定义复制粘贴到每家公司。

## 用法

您不必为每家公司分别定义标记和股票,而是可以用一个字符串代替定义。这个字符串必须引用文件中定义的 `shareTypes` 或 `tokenTypes` 对象的某个字段。

`shareTypes` 和 `tokenTypes` 中的定义与以前作为各公司一部分时的作用完全相同。

名称 `default` 和 `minor` 有特殊行为。如果您定义了名为 `minor` 的标记或股票类型,并且有设置了 `"minor": true` 的公司,那么 xxMaker 会把这些定义用于所有没有自己的股票或标记定义的小公司。如果您定义了名为 `default` 的标记或股票类型,那么 xxMaker 会把这些定义用于所有未被 `minor` 定义覆盖、且没有自己的股票或标记定义的公司。

## 示例

下面的游戏有 `minor` 和 `default` 两种类型,以及三家公司。第一家是小公司,第二家没有自己的定义,第三家按名称选用了 `default` 类型:

```json
{
  "tokenTypes": {
    "minor": ["Home"],
    "default": ["Home", 40, 100]
  },
  "shareTypes": {
    "minor": [{ "quantity": 2, "percent": 50, "shares": 1 }],
    "default": [
      {
        "quantity": 1,
        "label": "President's Certificate",
        "percent": 20,
        "shares": 2
      },
      { "quantity": 8, "percent": 10, "shares": 1 }
    ]
  },
  "companies": [
    {
      "name": "Black Railroad",
      "abbrev": "BLRR",
      "color": "black",
      "minor": true
    },
    { "name": "Blue Railroad", "abbrev": "BLU", "color": "blue" },
    {
      "name": "Red Railroad",
      "abbrev": "RED",
      "color": "red",
      "tokens": "default",
      "shares": "default"
    }
  ]
}
```

类型可以使用任意名称,公司通过字符串引用它们,例如
`"tokenTypes": { "default": ["Free", 40], "one": ["Free"] }` 搭配
`{ "abbrev": "KU", "tokens": "one" }`。`src/data/games` 中的 1889 和 1867 文件用到了这些。

## 贷款格

公司还可以有 `loans`,即公司执照上的额外格子,例如用于游戏中的贷款。每个条目是格子下方的标签,
每个格子都会印成一个空的方块,位于公司执照正文右侧、标题栏下方,每列最多 5 个,因此不会与标记混淆。空字符串或 `null` 表示该格没有标签:

```json
{ "abbrev": "RED", "tokens": [0, 40], "loans": [50, 50, ""] }
```

贷款过多时,半宽公司执照可能放不下。
