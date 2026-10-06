import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import { COLOR_KEYS } from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";

// The colors of the game by name, generated from the game schema
const ColorsForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <div className="flex flex-col gap-4">
      {COLOR_KEYS.map((key) => (
        <SchemaField key={key} keys={[key]} schema={schema.properties[key]} />
      ))}
    </div>
  </SchemaFormProvider>
);

export default ColorsForm;
