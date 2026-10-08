import { Inspector } from "@/components/hexEditor/inspectors/parts";

// The revenue of an offboard hex: its name and the revenue of each phase
const OffboardInspector = (props) => (
  <Inspector {...props} primary={["name", "revenues", "rows", "reverse"]} />
);

export default OffboardInspector;
