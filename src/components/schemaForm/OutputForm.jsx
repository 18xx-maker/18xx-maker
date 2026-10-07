import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import { OUTPUT_KEYS } from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";

// The revenue chart range and the export defaults, generated from the game
// schema
const OutputForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <div className="flex flex-col gap-4">
      {OUTPUT_KEYS.map((key) => (
        <SchemaField key={key} keys={[key]} schema={schema.properties[key]} />
      ))}
    </div>
  </SchemaFormProvider>
);

export default OutputForm;
