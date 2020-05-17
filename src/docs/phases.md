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
  phase starts.
* **onIndex** If this stage only starts when the _n_th train is bought, you can
  specify this here. This is a integer index pointing out which of the **on**
  train triggers the phase.
* **notes** A string or array of strings of notes for this phase. Some notes
  will be added from other fields, this is for custom ones.
* **buy_companies** A boolean that says if privates can be bought in during this
  phase.
* **events** An object full of boolean fields that state that other events
  happen when this phase triggers (such as privates closing or tokens being
  removed).

## Usage

Instead of defining tokens and shares for a company you can replace the
definition with a single string. This string needs to be a reference to one of
the fields of the `shareTypes` or `tokenTypes` object defined in the file.

The definitions in `shareTypes` and `tokenTypes` work exactly as they did before
as part of each company.

Special behavior exists for the names `default` and `minor`. If you define a
token or share type named `minor` and have companies with `"minor": true`
defined, than xxMaker will use those definitions for any minor that doesn't have
it's own share or tokens definition. If you define a token or share type named
`default` than xxMaker will use those definitions for any company that was
included in the `minor` definitions, and that didn't define it's own definitions
for shares or tokens.

## Examples

Please look at how it's defined in 1830.
