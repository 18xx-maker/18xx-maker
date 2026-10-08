import { useState } from "react";

import HexEditor from "@/components/hexEditor/HexEditor";
import SidePicker from "@/components/hexEditor/SidePicker";

import { tiles } from "@/data";
import { useGame } from "@/hooks";

// The clip paths normally live in the Root component's svg
const Clip = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <clipPath id="hexClipPath">
        <polygon points="-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5" />
      </clipPath>
    </defs>
  </svg>
);

// The editor is controlled: the story keeps the hex
const Editor = ({ start, orientation, ...rest }) => {
  const game = useGame();
  const [value, setValue] = useState(start);
  return (
    <div className="w-96">
      <Clip />
      <HexEditor
        value={value}
        onChange={setValue}
        orientation={orientation}
        game={game}
        {...rest}
      />
    </div>
  );
};

const GROUPS = {
  // A hex of the map with a city, a label and track
  city: {
    color: "yellow",
    track: [
      { side: 1, type: "sharp" },
      { side: 4, type: "sharp" },
    ],
    cities: [{ size: 2, name: { name: "Albany" } }],
    labels: [{ label: "A", angle: 150, percent: 0.7 }],
    hexes: ["B12"],
  },
  // An offboard hex of the map
  offboard: {
    color: "offboard",
    track: [{ type: "offboard", side: 4 }],
    offBoardRevenue: {
      name: { name: "Montreal" },
      revenues: [
        { color: "yellow", value: 30 },
        { color: "brown", value: 60 },
      ],
    },
    removeBorders: [1],
    hexes: ["A11"],
  },
  // A tile of the game, with the fields of its printing
  tile: {
    quantity: 2,
    print: 3,
    color: "green",
    track: [
      { side: 1, type: "gentle" },
      { side: 3, type: "gentle" },
    ],
    cities: [{ size: 1 }],
    values: [{ value: 40, x: 0, y: 0 }],
  },
  // A hex with nothing on it
  empty: { color: "plain", hexes: ["C11", "C13", "C15"] },
};

export default {
  title: "Chrome/HexEditor",
  component: Editor,
  // An interface component of a loaded game, not an svg of the print pages
  parameters: { layout: "centered", chrome: true, game: "18Test" },
  argTypes: {
    orientation: { control: "select", options: [0, 90] },
  },
  args: { start: GROUPS.city, orientation: 0 },
};

// A hex of the map, with the hexes of the map turned like the game's
export const Map = { args: { orientation: 90 } };

export const Offboard = { args: { start: GROUPS.offboard } };

// A tile of the game (the Tiles tab): drawn as the tile sheets draw it, with
// its quantity, print and group, and without the fields only the map uses
export const Tile = { args: { start: GROUPS.tile, tile: true } };

// A tile drawn from the library (an alias here): only its printing is edited,
// the tile itself is never changed
export const LibraryTile = {
  args: {
    start: { tile: "57", quantity: 2 },
    tile: true,
    library: true,
    alias: true,
    preview: tiles["57"],
  },
};

// Nothing drawn yet: the list says how to start
export const Empty = { args: { start: GROUPS.empty } };

const Picker = ({ max, orientation }) => {
  const [value, setValue] = useState([1, 4]);
  return (
    <SidePicker
      label="Sides"
      sideLabel={(side) => `Side ${side}`}
      value={value}
      max={max}
      orientation={orientation}
      onChange={setValue}
    />
  );
};

// The control that picks sides: two (the ends of a track) or one
export const Sides = {
  render: (args) => <Picker {...args} />,
  args: { max: 2, orientation: 0 },
  argTypes: { max: { control: "select", options: [1, 2, 6] } },
};
