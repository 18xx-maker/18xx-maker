import { useMemo } from "react";

import JsonSection from "@/components/editPanel/JsonSection";

import { configLens } from "@/util/jsonEditor";

// The Config tab: the config of the game as JSON, in the JSON editor
const ConfigSection = ({ game }) => {
  const slug = game.meta.slug;
  const lens = useMemo(() => configLens(slug), [slug]);

  return (
    <div className="flex flex-1 flex-col gap-2 min-h-0">
      <JsonSection key={slug} game={game} lens={lens} />
    </div>
  );
};

export default ConfigSection;
