import { Inspector } from "@/components/hexEditor/inspectors/parts";

// A label: the text, its size and color
const LabelInspector = (props) => (
  <Inspector {...props} primary={["label", "size", "color"]} />
);

export default LabelInspector;
