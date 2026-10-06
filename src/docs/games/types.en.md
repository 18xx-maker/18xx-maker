# Share and Token Types

You can now add shares and tokens to all of you companies in a game file without
copy and pasting the same definition to each company.

## Usage

Instead of defining tokens and shares for a company you can replace the
definition with a single string. This string needs to be a reference to one of
the fields of the `shareTypes` or `tokenTypes` object defined in the file.

The definitions in `shareTypes` and `tokenTypes` work exactly as they did before
as part of each company.

Special behavior exists for the names `default` and `minor`. If you define a
token or share type named `minor` and have companies with `"minor": true`
defined, then xxMaker will use those definitions for any minor that doesn't have
its own share or tokens definition. If you define a token or share type named
`default` then xxMaker will use those definitions for any company that was
included in the `minor` definitions, and that didn't define its own definitions
for shares or tokens.

## Examples

A game with a `minor` and a `default` type, and three companies. The first is a
minor, the second has no definitions of its own, and the third picks the
`default` types by name:

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

Types can have any name, and companies refer to them with a string, for example
`"tokenTypes": { "default": ["Free", 40], "one": ["Free"] }` with
`{ "abbrev": "KU", "tokens": "one" }`. The 1889 and 1867 files in
`src/data/games` use these.

## Starting tokens

An entry in `tokens` can also be an object with a `cost` (the label under the
space) and `start`, for a company that begins the game with a token in that
space. A starting token is already on the map, so the charter shows it
differently from the other spaces: the color style shows the company logo in the
space instead of an empty circle, and the carth style, which shows the logo in
every space, leaves the space empty. `start: false` is the same as leaving it
out, and `cost` is optional:

```json
{ "abbrev": "RED", "tokens": [{ "cost": "Home", "start": true }, 40, 100] }
```

## Loan slots

A company can also have `loans`, extra slots on its charter, for example for
the loans of a game. Each entry is the label under the slot, and every slot is
printed as an empty square in the body of the charter, on the right below the
header, in columns that fit the height of the charter, so it is never mistaken for a token. An empty string or `null` leaves the slot without a label:

```json
{ "abbrev": "RED", "tokens": [0, 40], "loans": [50, 50, ""] }
```

The first loan is in the right column and the loans fill it from top to bottom, then continue in the column to its left. Loans that do not fit are cut off, so keep the number small on minors and half width charters.

## Tokens below the name

A company with many tokens can set `tokensBelow` to print its token slots in a
row under the company name instead of to the right of it, so they do not squeeze
the name. The tokens get smaller to fit the width of the charter, and the name has room for one line, so keep it short and leave out the subtext. Half width
charters already stack their tokens and ignore it:

```json
{
  "abbrev": "RED",
  "tokens": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  "tokensBelow": true
}
```

## Charter banner

A company can set `banner` to print a label in a strip along the bottom edge of its charter, in the color of the company, for example to mark a system or another special charter. The text is printed as written and is not translated. The strip sits inside the charter, so the charter keeps its size and the contents move up to stay clear of it:

```json
{ "abbrev": "RED", "banner": "SYSTEM" }
```

## Charter subtitle

A company can print one line of small text under its name on the charter, with
three slots: the home hex or starting city on the left, the destination in the
middle and a special power on the right. Set `home` (a string or a list, joined
with " / "), `destination` and `ability` and the slots print as `Home: ...`,
`Dest: ...` and the ability as written. `ability` is not the same as the
unprinted private `abilities`. A slot without a value stays empty and the others
keep their place. To print your own text, set `charterSubtitle` with `left`,
`middle` or `right`; an empty string blanks a slot. The text is not translated
and a slot that is too long is cut with an ellipsis. On small headers (minors,
`tokensBelow` and half width carth charters) the subtitle takes the place of the
subtext:

```json
{
  "abbrev": "RED",
  "home": ["H5", "H7"],
  "destination": "A1",
  "ability": "Lay a free tile",
  "charterSubtitle": { "middle": "Goal: A1" }
}
```

## Company aliases

A company can have an `alias`, a second name such as a short form or the name
in another language. The `companyNames` config (on the config page) chooses
what the charters and the share cards print: `name` (the default) prints the
name, `alias` prints the alias instead (the name for a company without one),
and `both` prints the name with the alias under it, in place of the `subtext`
of the company:

```json
{ "name": "Baltimore & Ohio Railroad", "abbrev": "B&O", "alias": "B&O" }
```
