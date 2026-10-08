import { useContext } from "react";
import { useTranslation } from "react-i18next";

import SidePicker from "@/components/hexEditor/SidePicker";
import { setElementKey } from "@/components/hexEditor/hexModel";
import { Inspector } from "@/components/hexEditor/inspectors/parts";
import { SchemaFormContext } from "@/components/schemaForm/SchemaField";

// A colored border on one side of the hex
const BorderInspector = ({ elementKey, index, element, orientation }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const side = Number.isInteger(element?.side) ? [element.side] : [];

  return (
    <Inspector
      elementKey={elementKey}
      index={index}
      element={element}
      primary={["color", "dashed", "width"]}
      except={["side"]}
      before={
        <SidePicker
          label={t("hexEditor.form.borderSide")}
          sideLabel={(n) => t("hexEditor.form.sideN", { side: n })}
          value={side}
          max={1}
          orientation={orientation}
          onChange={([next]) =>
            form.edit((g) => ({
              hex: setElementKey(g.hex, elementKey, index, "side", next),
            }))
          }
        />
      }
    />
  );
};

export default BorderInspector;
