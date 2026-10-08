import BorderInspector from "@/components/hexEditor/inspectors/BorderInspector";
import {
  CityInspector,
  TownInspector,
} from "@/components/hexEditor/inspectors/CityInspector";
import GenericInspector from "@/components/hexEditor/inspectors/GenericInspector";
import {
  IconInspector,
  TerrainInspector,
} from "@/components/hexEditor/inspectors/IconTypeInspector";
import LabelInspector from "@/components/hexEditor/inspectors/LabelInspector";
import OffboardInspector from "@/components/hexEditor/inspectors/OffboardInspector";
import {
  CompanyInspector,
  CrossingInspector,
  GoodInspector,
  IndustryInspector,
  NameInspector,
  RouteBonusInspector,
  ShapeInspector,
  ValueInspector,
} from "@/components/hexEditor/inspectors/PlacedInspectors";
import {
  DivideInspector,
  TunnelEntranceInspector,
} from "@/components/hexEditor/inspectors/SideInspector";
import TrackInspector from "@/components/hexEditor/inspectors/TrackInspector";

// The inspectors made for an element, by the key of the list; every other
// element (the tokens, which are text, numbers or objects) gets the generic
// one, made from its schema
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
  values: ValueInspector,
  names: NameInspector,
  icons: IconInspector,
  terrain: TerrainInspector,
  shapes: ShapeInspector,
  goods: GoodInspector,
  industries: IndustryInspector,
  companies: CompanyInspector,
  bridges: CrossingInspector,
  tunnels: CrossingInspector,
  tunnelEntrances: TunnelEntranceInspector,
  routeBonuses: RouteBonusInspector,
  divides: DivideInspector,
};

export const inspectorFor = (key) => INSPECTORS[key] ?? GenericInspector;
