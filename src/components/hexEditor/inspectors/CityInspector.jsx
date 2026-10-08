import { Inspector } from "@/components/hexEditor/inspectors/parts";

// A city (and its kin): how many companies it holds, its name, where it sits
export const CityInspector = (props) => (
  <Inspector {...props} primary={["size", "name", "companies"]} />
);

export const TownInspector = (props) => (
  <Inspector {...props} primary={["name"]} />
);
