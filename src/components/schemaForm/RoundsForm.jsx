import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import { ROUND_KEYS } from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";

// The rounds, turns, pools and number cards of the game, generated from the
// game schema
const RoundsForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <div className="flex flex-col gap-4">
      {ROUND_KEYS.map((key) => (
        <SchemaField key={key} keys={[key]} schema={schema.properties[key]} />
      ))}
    </div>
  </SchemaFormProvider>
);

export default RoundsForm;
