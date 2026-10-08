import BorderInspector from "@/components/hexEditor/inspectors/BorderInspector";
import {
  CityInspector,
  TownInspector,
} from "@/components/hexEditor/inspectors/CityInspector";
import GenericInspector from "@/components/hexEditor/inspectors/GenericInspector";
import LabelInspector from "@/components/hexEditor/inspectors/LabelInspector";
import OffboardInspector from "@/components/hexEditor/inspectors/OffboardInspector";
import TrackInspector from "@/components/hexEditor/inspectors/TrackInspector";

// The inspectors made for an element, by the key of the list; every other
// element gets the generic one, made from its schema
export const INSPECTORS = {
  track: TrackInspector,
  cities: CityInspector,
  mediumCities: CityInspector,
  centerTowns: TownInspector,
  boomtowns: TownInspector,
  towns: TownInspector,
  offBoardRevenue: OffboardInspector,
  labels: LabelInspector,
  borders: BorderInspector,
};

export const inspectorFor = (key) => INSPECTORS[key] ?? GenericInspector;
