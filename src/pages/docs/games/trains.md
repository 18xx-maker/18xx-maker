# Phases and Trains

Phases and Trains have changed in version 1.0.0 to support the behavior data
needed for programs like [18xx.games](https://www.18xx.games/).

## Phase Fields

* **name** _required_ The name of the phase
* **limit** _required_ The number of trains that each company is able to have in
  this phase
* **tiles** _required_ The color of tiles that are allowed in this phase.
  Currently you only list that highest color and it's implied that colors
  beneath it are allowed. This matches what most phase charts do by showing only
  the highest color.
* **minor** A boolean that says that this phase is only valid for minor
  companies.
* **company** A string that is the company abbreviation to show that this phase
  should only be shown on that companies charter.
* **train** If the phase name matches the relevant train name than this field
  isn't needed. This field can either be a single string of the relevant train,
  or an array of all trains that are available for this phase. Check out 1844
  and 1846 for examples of these.
* **rounds** How many ORs are played for each set in this phase. Usefull for
  games like 1830 in which the number of rounds change per phase.
* **on** What train triggers this phase to start, when that train is bought this
  phase starts. This can be a single train name, or an array of train names. It
  can also be a single (or array) of objects where each object has an `on` field
  (train name) and an `index` field specifing which train triggers this phase.
* **notes** A string or array of strings of notes for this phase. Some notes
  will be added from other fields, this is for custom ones.
* **buy_companies** A boolean that says if privates can be bought in during this
  phase.
* **events** An object full of boolean fields that state that other events
  happen when this phase triggers (such as privates closing or tokens being
  removed).

## Train Fields

* **name*** _required_
* **quantity** _required_ Either a number or the string "∞" representing the
  number of available trains.
* **color** _required_ The color to display for this trains title.
* **price** The cost of this train.
* **image** The image to use for this train (See schema, code or 18Test file for
  available images).
* **phase** Set this to `false` if you want this train to not appear on phase charts.
* **print** This is the number of this train to print. Overrides the `quantity`
  field for printing. Required when quantity is set to "∞".
* **discount** An object of train names to discount amount.
* **description** A description string printed on the train card. Useful for
  random information for play.
* **available** If this train becomes available when another train is sold you
  can list that train here as a string. A good example is D trains in 1830
  become avaialble when the 6 is bought.
* **variant** If this train is only used on a variant you can list it here.
* **rust** The name of the train that rusts this one. Can be an array of names.
  Can also be a single object (or array of objects) where each object as a `on`
  field and a `index` field representing which train name (`on`) and which index
  of that train (2 or later) causes the rusting.
* **phased** Identical to `rust` but specifies that this train is phased out
  instead of rusted.
* **obsolete** Identical to `rust` but specifies that this train is now obsolete
  instead of rusted.
* **permanent** Set to false if this train is not permenent. Not needed if any
  of `rust`, `obsolete` or `phased` is set.
* **players** A number of players that this train is used for _(Might be moving
  to min/max players like on privates soon)_.

## Examples

Please look at the 18Test file to see examples of most of these fields.
