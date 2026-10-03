# 公司替换

您现在可以定义一组公司列表,把它们覆盖到游戏原有的公司之上。如果您曾梦想用自己喜欢的运动队来玩 1849,或者用自己喜欢的编程语言来玩 1830……那么这个功能就是为您准备的。

## 用法

编辑 `config.json` 中的 `overrideCompanies` 字段,或在配置页面中编辑该字段。完成后,您查看和打印的每一款游戏都会使用这些替换。如果想看到图片标志,请确保同时选择了某一个标志选项!

公司按一一对应的方式替换,顺序为它们在游戏文件和替换文件中定义的顺序。如果游戏文件中的公司比替换文件中的多,多出来的公司将保持默认状态。

## 示例

您可以查看目前[已定义的替换列表](https://github.com/18xx-maker/18xx-maker/tree/main/src/data/companies)。要创建新的替换列表,只需在该文件夹中新建 json 文件,它会被自动识别(`src/data/index.js` 会通过 glob 匹配 `companies/*.json`)。不过,配置模式中的 `overrideCompanies` 选项是一个封闭列表,因此还需要把新名称添加到 `src/schemas/config.schema.json`(以及 `public/schemas`)中的 `overrideCompanies` 枚举里,否则配置将无法通过校验。

下面是 1832 亚特兰大(Atlanta)地图六边格使用语言列表中 Ruby 和 Python 替换后的示例:

![ruby and python in Atlanta](/images/ruby-and-python-in-atlanta.png)
