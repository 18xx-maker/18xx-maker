import { useContext } from "react";
import { useTranslation } from "react-i18next";

import SidePicker from "@/components/hexEditor/SidePicker";
import { setElementKey } from "@/components/hexEditor/hexModel";
import { Inspector } from "@/components/hexEditor/inspectors/parts";
import { SchemaFormContext } from "@/components/schemaForm/SchemaField";

// An element that sits on one side of the hex: the side is picked on a drawing
// of the hex
const SideInspector = ({ label, primary, ...props }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const { elementKey, index, element, orientation } = props;
  const side = Number.isInteger(element?.side) ? [element.side] : [];

  return (
    <Inspector
      {...props}
      primary={primary}
      except={["side"]}
      before={
        <SidePicker
          label={t(label)}
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

// A divide, the line along a side that splits the hex of two companies
export const DivideInspector = (props) => (
  <SideInspector {...props} label="hexEditor.form.divideSide" primary={[]} />
);

// Where a tunnel comes out of the hex
export const TunnelEntranceInspector = (props) => (
  <SideInspector
    {...props}
    label="hexEditor.form.tunnelEntranceSide"
    primary={[]}
  />
);
