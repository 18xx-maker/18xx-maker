import { useContext } from "react";
import { useTranslation } from "react-i18next";

import SidePicker from "@/components/hexEditor/SidePicker";
import {
  replaceElement,
  setTrackEnds,
  trackEnds,
} from "@/components/hexEditor/hexModel";
import { Inspector } from "@/components/hexEditor/inspectors/parts";
import { SchemaFormContext } from "@/components/schemaForm/SchemaField";

// A track: the sides it joins on a drawing of the hex (the first click is
// where it starts, the second where it ends), then its look
const TrackInspector = ({ elementKey, index, element, orientation }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);

  return (
    <Inspector
      elementKey={elementKey}
      index={index}
      element={element}
      primary={["type", "gauge", "width", "color"]}
      except={["side", "sides"]}
      before={
        <SidePicker
          label={t("hexEditor.form.trackSides")}
          sideLabel={(side) => t("hexEditor.form.sideN", { side })}
          value={trackEnds(element)}
          max={2}
          orientation={orientation}
          onChange={(ends) =>
            form.edit((g) => ({
              hex: replaceElement(
                g.hex,
                elementKey,
                index,
                setTrackEnds(element, ends),
              ),
            }))
          }
        />
      }
    />
  );
};

export default TrackInspector;
