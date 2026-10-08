import { useTranslation } from "react-i18next";

import JsonSection from "@/components/editPanel/JsonSection";

import { useHexGroup } from "@/hooks/useHexGroup";
import {
  findGroup,
  inheritedGroup,
  isRemoved,
  localHexes,
  moveKey,
  variationMap,
} from "@/util/hexEdit";

const text = (value) => JSON.stringify(value, null, 2);

// The Hex tab: the group of hexes selected on the map, as JSON, in the JSON
// editor. The group is found by its first coordinate, the one in the url
// (?hex=C11): an edit of the text that changes the first coordinate moves the
// url along (and not the editor, which keeps the text and its cursor).
const HexSection = ({ game }) => {
  const { t } = useTranslation();
  const { current, generation, lens, variation, slug } = useHexGroup(game);

  if (!variationMap(game, variation)) return null;
  if (!current) return <p className="text-sm">{t("hexEditor.hint")}</p>;

  const index = findGroup(localHexes(game, variation), current);
  if (index < 0) {
    const inherited = inheritedGroup(game, variation, current);
    if (inherited) {
      return (
        <div className="flex flex-col gap-2">
          <p role="note" className="text-sm">
            {t("hexEditor.inherited", {
              variation:
                variationMap(game, inherited.variation).name ??
                inherited.variation + 1,
            })}
          </p>
          <pre className="text-sm font-mono border rounded-md p-2 overflow-auto">
            {text(inherited.group)}
          </pre>
        </div>
      );
    }
  }

  const removed = index < 0 && isRemoved(game, variation, current);

  return (
    <div className="flex flex-1 flex-col gap-2 min-h-0" data-anchor={current}>
      {index < 0 && (
        <p role="note" className="text-sm">
          {removed
            ? t("hexEditor.removed", { coord: current })
            : t("hexEditor.pending", { coord: current })}
        </p>
      )}
      {!removed && (
        <p className="text-sm text-muted-foreground">
          {t("hexEditor.moveHint", { key: moveKey() })}
        </p>
      )}
      <JsonSection
        key={`${slug}:${variation}:${generation}`}
        game={game}
        lens={lens}
      />
    </div>
  );
};

export default HexSection;
