import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import { ROUND_KEYS, TURN_PRIMARY_KEYS } from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";

const PRIMARY = { turns: TURN_PRIMARY_KEYS };

// The rounds, turns and number cards of the game, generated from the
// game schema
const RoundsForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <div className="flex flex-col gap-4">
      {ROUND_KEYS.map((key) => (
        <SchemaField
          key={key}
          keys={[key]}
          schema={schema.properties[key]}
          primary={PRIMARY[key]}
        />
      ))}
    </div>
  </SchemaFormProvider>
);

export default RoundsForm;
