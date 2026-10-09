import { isSingle } from "@/components/hexEditor/hexModel";
import { elementSchema } from "@/components/hexEditor/hexSchema";
import { Inspector, keysOf } from "@/components/hexEditor/inspectors/parts";
import { ChoiceField } from "@/components/schemaForm/SchemaField";

import { icons } from "@/data";
import { useAssets } from "@/hooks";
import { customIds } from "@/util/assets";

const BUILT_IN_NAMES = Object.keys(icons).sort();

// An element drawn from an icon of the library (an icon, a piece of terrain):
// the icon is picked from the list, a name the library does not have stays
const IconTypeInspector = ({ primary, ...props }) => {
  const { elementKey, index, element } = props;
  const type = element?.type;
  const assets = useAssets();
  const ICON_NAMES = [...customIds("icons", assets), ...BUILT_IN_NAMES];
  const options =
    typeof type === "string" && !ICON_NAMES.includes(type)
      ? [...ICON_NAMES, type]
      : ICON_NAMES;

  return (
    <Inspector
      {...props}
      primary={primary}
      except={["type"]}
      before={
        <ChoiceField
          keys={[...keysOf(elementKey, index, isSingle(elementKey)), "type"]}
          schema={elementSchema(elementKey).properties.type}
          options={options}
        />
      }
    />
  );
};

export const IconInspector = (props) => (
  <IconTypeInspector {...props} primary={["width", "noCircle"]} />
);

export const TerrainInspector = (props) => (
  <IconTypeInspector {...props} primary={["cost", "size"]} />
);
