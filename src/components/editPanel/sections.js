import GameInfoForm from "@/components/schemaForm/GameInfoForm";
import MarketForm from "@/components/schemaForm/MarketForm";
import TrainsForm from "@/components/schemaForm/TrainsForm";

// The tabs of the edit panel, in order. Adding a section is adding an entry
// here and its editPanel.sections.<section> strings.
export const editSections = [
  { section: "info", Form: GameInfoForm },
  { section: "trains", Form: TrainsForm },
  { section: "market", Form: MarketForm },
];

export const DEFAULT_EDIT_SECTION = editSections[0].section;
