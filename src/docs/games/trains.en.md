# Phases and Trains

Phases and Trains have changed in version 1.0.0 to support the behavior data
needed for programs like [18xx.games](https://www.18xx.games/).

## Phase Fields

- **name** _required_ The name of the phase
- **limit** _required_ The number of trains that each company is able to have in
  this phase
- **tiles** _required_ The color of tiles that are allowed in this phase.
  Currently you only list that highest color and it's implied that colors
  beneath it are allowed. This matches what most phase charts do by showing only
  the highest color.
- **minor** A boolean that says that this phase is only valid for minor
  companies.
- **company** A string that is the company abbreviation to show that this phase
  should only be shown on that companies charter.
- **train** If the phase name matches the relevant train name then this field
  isn't needed. This field can either be a single string of the relevant train,
  or an array of all trains that are available for this phase. Games on
  [18xx.games](https://18xx.games) like 1844 and 1846 use these.
- **rounds** How many ORs are played for each set in this phase. Useful for
  games like 1830 in which the number of rounds change per phase.
- **on** What train triggers this phase to start, when that train is bought this
  phase starts. This can be a single train name, or an array of train names. It
  can also be a single (or array) of objects where each object has an `on` field
  (train name) and an `index` field specifying which train triggers this phase.
- **notes** A string or array of strings of notes for this phase. Some notes
  will be added from other fields, this is for custom ones.
- **buy_companies** A boolean that says if privates can be bought in during this
  phase.
- **events** An object full of boolean fields that state that other events
  happen when this phase triggers (such as privates closing or tokens being
  removed). The exact format of these events is tied to the implementation of
  games on [18xx.games](https://18xx.games).

## Train Fields

- **name** _required_
- **quantity** _required_ Either a number or the string "∞" representing the
  number of available trains.
- **color** _required_ The color to display for this trains title.
- **price** The cost of this train.
- **image** The image to use for this train (See schema, code or 18Test file for
  available images).
- **phase** Set this to `false` if you want this train to not appear on phase charts.
- **print** This is the number of this train to print. Overrides the `quantity`
  field for printing. Required when quantity is set to "∞".
- **discount** An object of train names to discount amount.
- **upgrade** The cost of this train when bought as an upgrade. Shown with an
  arrow under the price.
- **tradeIn** The value of this train when traded in. Shown in parentheses under
  the price.
- **description** A description string printed on the train card. Useful for
  random information for play.
- **available** If this train becomes available when another train is sold you
  can list that train here as a string. A good example is D trains in 1830
  become available when the 6 is bought.
- **variant** If this train is only used on a variant you can list it here.
- **rust** The name of the train that rusts this one. Can be an array of names.
  Can also be a single object (or array of objects) where each object as a `on`
  field and a `index` field representing which train name (`on`) and which index
  of that train (2 or later) causes the rusting.
- **phased** Identical to `rust` but specifies that this train is phased out
  instead of rusted.
- **obsolete** Identical to `rust` but specifies that this train is now obsolete
  instead of rusted.
- **permanent** Set to false if this train is not permanent. Not needed if any
  of `rust`, `obsolete` or `phased` is set.
- **players** A number of players that this train is used for _(Might be moving
  to min/max players like on privates soon)_.

## Examples

Please look at the 18Test file to see examples of most of these fields. The
following is a **synthetic** example (it validates, but it is not taken from a
bundled game) that shows `on`, `index`, `rust`, `events`, `notes`, `print`,
`discount` and `available`:

```json
{
  "phases": [
    { "name": "2", "limit": 4, "rounds": 1, "tiles": "yellow" },
    {
      "name": "3",
      "limit": 4,
      "rounds": 2,
      "tiles": "green",
      "on": "3",
      "buy_companies": true,
      "notes": "Privates may be bought"
    },
    {
      "name": "5",
      "limit": 2,
      "rounds": 3,
      "tiles": "brown",
      "on": { "on": "5", "index": 2 },
      "events": { "close_companies": true }
    },
    { "name": "D", "limit": 2, "tiles": "brown", "on": ["6", "D"] }
  ],
  "trains": [
    { "name": "2", "quantity": 6, "price": 80, "color": "yellow", "rust": "4" },
    { "name": "3", "quantity": 5, "price": 180, "color": "green", "rust": "6" },
    {
      "name": "5",
      "quantity": 3,
      "price": 450,
      "color": "brown",
      "rust": { "on": "D", "index": 2 }
    },
    {
      "name": "D",
      "quantity": "∞",
      "print": 2,
      "price": 1000,
      "color": "brown",
      "discount": { "4": 300, "5": 300, "6": 300 },
      "available": "6",
      "description": "Buy at a discount by trading in a 4, 5 or 6"
    }
  ]
}
```

## Company Trains

A company can own trains that are not part of the game's train supply, like
a starting train. List them in the company's `trains` field. Each entry is one
of:

- a train name (`"4"`), one copy of that train of the game,
- a reference with a quantity (`{ "name": "4", "quantity": 2 }`), several copies
  of a train of the game,
- a full train (the fields above), with an optional `quantity` (default 1).
  Use `print` instead when the quantity is "∞".

Names the game does not have are skipped. These are extra copies on top of
`quantity` in the game's `trains`, and they never change the phase chart. Set
`trains` to `false` to hide the "Trains" label on the charter.

```json
{
  "name": "Awa Railroad",
  "abbrev": "AR",
  "trains": ["2", { "name": "3", "quantity": 2 }]
}
```

By default the trains print as small train cards on the charter. The
**Train Cards** option of the charter config (`charters.trainCards`) set to
`cards` prints them on the train card sheet instead. Charters without room for
them (half width) always use the train card sheet. The trains on a charter have
a black border and rounded corners like cards; the **Train Card Border**
(`charters.trainCardBorder`) and **Train Card Rounded Corners**
(`charters.trainCardRound`) options turn either off.
