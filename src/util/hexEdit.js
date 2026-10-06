import { equals } from "ramda";

import { maxMapX, maxMapY, toAlpha } from "@/util/map";

// The pure parts of the hex editor: the groups of `map.hexes` (an object with
// a `hexes` list of coordinates and what is drawn on them), the cells of the
// map a pointer can pick and the changes a click makes. The groups are
// handled by their coordinates, never by a stored index: an index moves when
// a group before it goes away.

export const COORD_PATTERN = /^[A-Z]+[0-9]+$/;

// A coordinate as text. An array [x, y] is not valid in a game file, but the
// map draws it.
export const coordName = (coord) =>
  Array.isArray(coord) ? `${toAlpha(coord[1])}${coord[0]}` : coord;

const names = (group) => (group?.hexes ?? []).map(coordName);

// The coordinate that stands for a group: its first one
export const anchorOf = (group) => names(group)[0];

export const hexCount = (hexes) =>
  hexes.reduce((sum, group) => sum + names(group).length, 0);

// The groups that list the coordinate. One coordinate may be in several groups
// (a hex drawn over another one), the last one is drawn on top.
export const findGroups = (hexes, coord) =>
  hexes.flatMap((group, index) =>
    names(group).includes(coord) ? [index] : [],
  );

export const findGroup = (hexes, coord) =>
  findGroups(hexes, coord).at(-1) ?? -1;

// A group of one coordinate, ready to be edited
export const newGroup = (coord) => ({ color: "plain", hexes: [coord] });

// The groups with the group at the index replaced, or added when there is no
// group at the index
export const replaceGroup = (hexes, index, group) => {
  if (index < 0 || index >= hexes.length) return [...hexes, group];
  if (equals(hexes[index], group)) return hexes;
  return hexes.map((item, i) => (i === index ? group : item));
};

// The group without the coordinate (the same group when it has none)
const strip = (group, coord) =>
  names(group).includes(coord)
    ? { ...group, hexes: group.hexes.filter((c) => coordName(c) !== coord) }
    : group;

// What a click does to the groups. Each change gives the new groups, the index
// of the selected group in them and its anchor.

// Adds the coordinate to the group and takes it from every other group, a group
// left empty goes away
export const addHexToGroup = (hexes, index, coord) => {
  const target = hexes[index];
  if (!target) return { hexes, index, anchor: undefined };
  const stripped = hexes.map((group, i) =>
    i === index ? group : strip(group, coord),
  );
  const added = names(target).includes(coord)
    ? target
    : { ...target, hexes: [...(target.hexes ?? []), coord] };
  const next = stripped
    .map((group, i) => (i === index ? added : group))
    .filter((group, i) => i === index || names(group).length > 0);
  const at = next.indexOf(added);
  return { hexes: next, index: at, anchor: anchorOf(added) };
};

// Takes the coordinate from every group that lists it, a group left empty goes
// away. `keep` is the number of hexes the map has besides these groups (those
// of a copied variation). The last hex of the map stays: { blocked: "last" }.
export const removeHexFromGroup = (hexes, index, coord, keep = 0) => {
  const selected = hexes[index];
  const stripped = hexes.map((group) => strip(group, coord));
  const next = stripped.filter((group) => names(group).length > 0);
  if (hexCount(next) + keep === 0) return { blocked: "last" };
  const at = selected ? next.indexOf(stripped[index]) : -1;
  return {
    hexes: next,
    index: at,
    anchor: at < 0 ? undefined : anchorOf(next[at]),
  };
};

// The cells of a map, as { x, y, coord }: every position of the map, the
// empty ones inside it and one row and one column after it. Rows and columns
// start at 1, and only the cells the hexes can sit on (see the parity of the
// first hex) are valid.
export const validCells = (data) => {
  if (!data?.hexes) return [];
  const maxX = maxMapX(data.hexes);
  const maxY = maxMapY(data.hexes);
  const parity = data.a1Valid ? 0 : 1;
  const cells = [];
  for (let y = 1; y <= maxY + 1; y++) {
    for (let x = 1; x <= maxX + 1; x++) {
      if ((x + y) % 2 === parity) {
        cells.push({ x, y, coord: `${toAlpha(y)}${x}` });
      }
    }
  }
  return cells;
};

// The map of the variation as the game file has it (not resolved)
export const variationMap = (game, variation = 0) =>
  Array.isArray(game.map) ? game.map[variation] : game.map;

// The groups of the variation itself, without the ones it copies
export const localHexes = (game, variation = 0) =>
  variationMap(game, variation)?.hexes ?? [];

// The game with the groups of the variation replaced
export const setLocalHexes = (game, variation, hexes) => {
  const map = variationMap(game, variation);
  if (!map) return game;
  const next = { ...map, hexes };
  if (!Array.isArray(game.map)) return { ...game, map: next };
  return {
    ...game,
    map: game.map.map((item, i) => (i === variation ? next : item)),
  };
};

// The variation a copy takes its hexes from
const copied = (game, variation) => {
  const map = variationMap(game, variation);
  if (map?.copy === undefined || !Array.isArray(game.map)) return null;
  return game.map[map.copy] ? map.copy : null;
};

// The group of the copied variation that has the coordinate, when the
// variation has no group of its own for it: { variation, group }
export const inheritedGroup = (game, variation, coord) => {
  const source = copied(game, variation);
  if (source === null) return null;
  if (variationMap(game, variation).remove?.includes(coord)) return null;
  const hexes = game.map[source].hexes ?? [];
  const at = findGroup(hexes, coord);
  return at < 0 ? null : { variation: source, group: hexes[at] };
};

// Whether the copy takes the coordinate away
export const isRemoved = (game, variation, coord) =>
  !!variationMap(game, variation)?.remove?.includes(coord);

// The number of hexes the variation has from the one it copies
export const inheritedCount = (game, variation) => {
  const source = copied(game, variation);
  if (source === null) return 0;
  const remove = variationMap(game, variation).remove ?? [];
  return game.map[source].hexes
    .flatMap(names)
    .filter((coord) => !remove.includes(coord)).length;
};

// What a click selects for a coordinate: the anchor of the group that lists
// it, or the coordinate itself when no group does (an empty position, a hex of
// a copied variation, which is only shown)
export const selectionFor = (game, variation, coord) => {
  const hexes = localHexes(game, variation);
  const at = findGroup(hexes, coord);
  if (at >= 0) {
    const anchor = anchorOf(hexes[at]);
    // The anchor stands for the group when no later group lists it too
    return findGroup(hexes, anchor) === at ? anchor : coord;
  }
  const inherited = inheritedGroup(game, variation, coord);
  return inherited ? anchorOf(inherited.group) : coord;
};

// The coordinates of the selected group as drawn: the group of the variation,
// else the one it copies, else the position alone
export const selectedCoords = (game, variation, selected) => {
  if (!selected) return [];
  const hexes = localHexes(game, variation);
  const at = findGroup(hexes, selected);
  if (at >= 0) return names(hexes[at]);
  const inherited = inheritedGroup(game, variation, selected);
  return inherited ? names(inherited.group) : [selected];
};

// A click with the modifier on a coordinate while a group is selected: the
// hex joins the group, taken from the groups that had it, or leaves it when it
// was in it. The result is the new game and the anchor of the group (none when
// it is gone), or why nothing happened: "last" (the last hex of the map),
// "removed" (the variation takes the hex away) or "inherited" (the group is
// the one of a copied variation).
export const moveHex = (game, variation, selected, coord) => {
  if (!COORD_PATTERN.test(selected) || !COORD_PATTERN.test(coord)) {
    return { blocked: "invalid" };
  }
  const hexes = localHexes(game, variation);
  const index = findGroup(hexes, selected);
  const keep = inheritedCount(game, variation);

  if (index >= 0 && names(hexes[index]).includes(coord)) {
    const result = removeHexFromGroup(hexes, index, coord, keep);
    if (result.blocked) return { blocked: result.blocked };
    return {
      game: setLocalHexes(game, variation, result.hexes),
      anchor: result.anchor,
    };
  }

  if (
    isRemoved(game, variation, coord) ||
    isRemoved(game, variation, selected)
  ) {
    return { blocked: "removed" };
  }
  if (index < 0 && inheritedGroup(game, variation, selected)) {
    return { blocked: "inherited" };
  }
  const groups = index < 0 ? [...hexes, newGroup(selected)] : hexes;
  const result = addHexToGroup(
    groups,
    index < 0 ? groups.length - 1 : index,
    coord,
  );
  return {
    game: setLocalHexes(game, variation, result.hexes),
    anchor: result.anchor,
  };
};

// Whether a click moves hexes between groups: Cmd on macOS, Ctrl elsewhere (a
// Ctrl click on macOS opens the context menu)
const onMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

export const moveKey = (mac = onMac()) => (mac ? "Cmd" : "Ctrl");

export const isMoveClick = (event, mac = onMac()) =>
  mac ? event.metaKey : event.ctrlKey;

// Why a parsed value is not a group of hexes the map can draw, or null: it is
// "group" when it is no object and "hexes" when its coordinates are not a
// list with at least one text like B2. A group with other coordinates (or
// none) would crash the map, so the editor keeps it as a draft.
export const groupInvalid = (value) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return "group";
  }
  const { hexes } = value;
  return Array.isArray(hexes) &&
    hexes.length > 0 &&
    hexes.every(
      (coord) => typeof coord === "string" && COORD_PATTERN.test(coord),
    )
    ? null
    : "hexes";
};

// The pointer of a problem of the game as a pointer into the group at the
// pointer prefix ("map.hexes[3]", "map[1].hexes[3]"), or null when the problem
// is not in the group
export const rerootPointer = (pointer = "", prefix) => {
  if (!pointer.startsWith(prefix)) return null;
  const rest = pointer.slice(prefix.length);
  if (rest === "") return "";
  if (rest[0] === ".") return rest.slice(1);
  return rest[0] === "[" ? rest : null;
};

// The pointer of the group at the index in the problems of the game
export const groupPrefix = (game, variation, index) =>
  Array.isArray(game.map)
    ? `map[${variation}].hexes[${index}]`
    : `map.hexes[${index}]`;
