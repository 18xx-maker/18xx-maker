# 18xx Maker CLI

We expose some useful commands in the form of a NodeJS command line program.

The normal way to run this command is via pnpm or node directly:

```shell
# Run via pnpm
pnpm maker help

# Run via node
node ./bin/maker.js help
```

> [!TIP]
> I find it useful to create this alias so I can use the CLI directly as `maker`
> in my shell without pnpm's default output:
>
> ```shell
> alias maker='pnpm --silent maker'
> ```
>
> That way I can run commands much easier: `maker --version`

## Commands

| Command                                   | Use                                         |
| ----------------------------------------- | ------------------------------------------- |
| `config`                                  | inspect or edit the CLI config              |
| `compile`                                 | compile JSON files                          |
| `validate <files...>`                     | validate any 18xx Maker JSON file or schema |
| `b18 [options] <game> <version> [author]` | create a Board 18 game box from a game      |
| `print [options] [game]`                  | create PDF files for a game                 |
| `help [command]`                          | get help on any command                     |

As noted above you can always get help on any command:

```shell
# Global help
pnpm maker help

# Individual command help
pnpm maker help compile
pnpm maker help compile schemas
pnpm maker help b18

# ... etc
```
