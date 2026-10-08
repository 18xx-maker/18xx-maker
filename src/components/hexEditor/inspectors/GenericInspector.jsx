import { elementSchema } from "@/components/hexEditor/hexSchema";
import { Inspector } from "@/components/hexEditor/inspectors/parts";

// Any other element: the fields of its schema, the first few in view
const PRIMARY = 4;

const GenericInspector = (props) => {
  const names = Object.keys(elementSchema(props.elementKey).properties ?? {});
  return <Inspector {...props} primary={names.slice(0, PRIMARY)} />;
};

export default GenericInspector;
