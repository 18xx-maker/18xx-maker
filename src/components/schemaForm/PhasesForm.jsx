import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import { PHASE_PRIMARY_KEYS } from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";

// What a new phase needs to be valid besides its name or train
const defaults = { limit: 4, tiles: "yellow" };

// The phases of the game, generated from the game schema. The name is only
// for games that name their phases: the others are keyed by train.
const PhasesForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <SchemaField
      keys={["phases"]}
      schema={schema.properties.phases}
      defaults={defaults}
      primary={PHASE_PRIMARY_KEYS}
      unique="named"
    />
  </SchemaFormProvider>
);

export default PhasesForm;
