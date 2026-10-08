import ConfigSection from "@/components/editPanel/ConfigSection";
import HexSection from "@/components/editPanel/HexSection";
import JsonSection from "@/components/editPanel/JsonSection";
import ProblemsSection from "@/components/editPanel/ProblemsSection";
import TilesSection from "@/components/editPanel/TilesSection";
import ColorsForm from "@/components/schemaForm/ColorsForm";
import CompaniesForm from "@/components/schemaForm/CompaniesForm";
import GameInfoForm from "@/components/schemaForm/GameInfoForm";
import MapForm from "@/components/schemaForm/MapForm";
import MarketForm from "@/components/schemaForm/MarketForm";
import OutputForm from "@/components/schemaForm/OutputForm";
import PhasesForm from "@/components/schemaForm/PhasesForm";
import PlayersForm from "@/components/schemaForm/PlayersForm";
import PrivatesForm from "@/components/schemaForm/PrivatesForm";
import RoundsForm from "@/components/schemaForm/RoundsForm";
import TokensForm from "@/components/schemaForm/TokensForm";
import TrainsForm from "@/components/schemaForm/TrainsForm";

// The groups of the form sections in the edit panel, in order. A section
// names its group; one without a group lands in "other" (editPanel.groups).
export const editGroups = ["game", "equipment", "output"];

// The sections of the edit panel, in order. Adding a section is adding an entry
// here and its editPanel.sections.<section> strings. A wide section gets more
// of the screen (the JSON editor). A pinned section is no chip: it is a segment
// of the Forms | JSON | Problems switch (JSON, Problems). The section names are in links
// (?edit=true&editSection=json): renaming one breaks them. A section with a
// page belongs to that page of the game (the map and hex tabs to the map, the
// tiles tab to the tiles): the tab is on every page, and choosing it from
// another page goes to that page.
export const editSections = [
  { section: "info", group: "game", Form: GameInfoForm },
  { section: "players", group: "game", Form: PlayersForm },
  { section: "phases", group: "game", Form: PhasesForm },
  { section: "rounds", group: "game", Form: RoundsForm },
  { section: "companies", group: "equipment", Form: CompaniesForm },
  { section: "privates", group: "equipment", Form: PrivatesForm },
  { section: "tokens", group: "equipment", Form: TokensForm },
  { section: "trains", group: "equipment", Form: TrainsForm },
  { section: "tiles", group: "equipment", Form: TilesSection, page: "tiles" },
  { section: "map", group: "output", Form: MapForm, page: "map" },
  { section: "hex", group: "output", Form: HexSection, page: "map" },
  { section: "market", group: "output", Form: MarketForm },
  { section: "colors", group: "output", Form: ColorsForm },
  { section: "output", group: "output", Form: OutputForm },
  { section: "config", group: "output", Form: ConfigSection, wide: true },
  { section: "json", Form: JsonSection, wide: true, pinned: true },
  { section: "problems", Form: ProblemsSection, wide: true, pinned: true },
];

// The sections with a chip of their own, the forms (the pinned ones are
// segments of the switch)
export const formSections = editSections.filter((s) => !s.pinned);

// The form sections by group, in the order of editGroups; a section without a
// known group is in "other" at the end. Only groups with a section are listed.
export const groupSections = (list) => {
  const known = (s) => editGroups.includes(s.group);
  const groups = [...editGroups, "other"].map((group) => ({
    group,
    sections: list.filter((s) =>
      group === "other" ? !known(s) : s.group === group,
    ),
  }));
  return groups.filter((g) => g.sections.length > 0);
};

export const DEFAULT_EDIT_SECTION = formSections[0].section;
