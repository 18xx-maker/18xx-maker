import HexSection from "@/components/editPanel/HexSection";
import JsonSection from "@/components/editPanel/JsonSection";
import ColorsForm from "@/components/schemaForm/ColorsForm";
import CompaniesForm from "@/components/schemaForm/CompaniesForm";
import GameInfoForm from "@/components/schemaForm/GameInfoForm";
import MarketForm from "@/components/schemaForm/MarketForm";
import OutputForm from "@/components/schemaForm/OutputForm";
import PhasesForm from "@/components/schemaForm/PhasesForm";
import PlayersForm from "@/components/schemaForm/PlayersForm";
import PrivatesForm from "@/components/schemaForm/PrivatesForm";
import RoundsForm from "@/components/schemaForm/RoundsForm";
import TokensForm from "@/components/schemaForm/TokensForm";
import TrainsForm from "@/components/schemaForm/TrainsForm";

// The tabs of the edit panel, in order. Adding a section is adding an entry
// here and its editPanel.sections.<section> strings. A wide section gets more
// of the screen (the JSON editor). The section names are in links
// (?edit=true&editSection=json): renaming one breaks them. A section with a
// page is only for that page of the game (the hex tab is for the map).
export const editSections = [
  { section: "info", Form: GameInfoForm },
  { section: "trains", Form: TrainsForm },
  { section: "privates", Form: PrivatesForm },
  { section: "companies", Form: CompaniesForm },
  { section: "phases", Form: PhasesForm },
  { section: "market", Form: MarketForm },
  { section: "players", Form: PlayersForm },
  { section: "rounds", Form: RoundsForm },
  { section: "tokens", Form: TokensForm },
  { section: "colors", Form: ColorsForm },
  { section: "output", Form: OutputForm },
  { section: "hex", Form: HexSection, page: "map" },
  { section: "json", Form: JsonSection, wide: true },
];

// The sections of the page: the ones for every page and the ones for it
export const sectionsFor = (page) =>
  editSections.filter((s) => !s.page || s.page === page);

export const DEFAULT_EDIT_SECTION = editSections[0].section;
