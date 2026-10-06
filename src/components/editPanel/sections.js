import JsonSection from "@/components/editPanel/JsonSection";
import CompaniesForm from "@/components/schemaForm/CompaniesForm";
import GameInfoForm from "@/components/schemaForm/GameInfoForm";
import MarketForm from "@/components/schemaForm/MarketForm";
import PhasesForm from "@/components/schemaForm/PhasesForm";
import PrivatesForm from "@/components/schemaForm/PrivatesForm";
import TrainsForm from "@/components/schemaForm/TrainsForm";

// The tabs of the edit panel, in order. Adding a section is adding an entry
// here and its editPanel.sections.<section> strings. A wide section gets more
// of the screen (the JSON editor). The section names are in links
// (?edit=true&editSection=json): renaming one breaks them.
export const editSections = [
  { section: "info", Form: GameInfoForm },
  { section: "trains", Form: TrainsForm },
  { section: "privates", Form: PrivatesForm },
  { section: "companies", Form: CompaniesForm },
  { section: "phases", Form: PhasesForm },
  { section: "market", Form: MarketForm },
  { section: "json", Form: JsonSection, wide: true },
];

export const DEFAULT_EDIT_SECTION = editSections[0].section;
