import { Inspector } from "@/components/hexEditor/inspectors/parts";

// The elements that sit on the hex by a place (see the positioning of the
// docs): a few main fields, the place and the rest behind "More fields"

export const ValueInspector = (props) => (
  <Inspector {...props} primary={["value", "outerBorderColor"]} />
);

export const NameInspector = (props) => (
  <Inspector {...props} primary={["name", "color", "offset"]} />
);

export const ShapeInspector = (props) => (
  <Inspector {...props} primary={["type", "text", "color", "background"]} />
);

export const GoodInspector = (props) => (
  <Inspector {...props} primary={["text", "color", "textColor"]} />
);

export const IndustryInspector = (props) => (
  <Inspector {...props} primary={["top", "bottom"]} />
);

export const CompanyInspector = (props) => (
  <Inspector {...props} primary={["label", "color", "left", "right"]} />
);

// A bridge and a tunnel are drawn the same way: what they cost, in a box
export const CrossingInspector = (props) => (
  <Inspector {...props} primary={["cost", "color", "textColor"]} />
);

export const RouteBonusInspector = (props) => (
  <Inspector {...props} primary={["value"]} />
);
