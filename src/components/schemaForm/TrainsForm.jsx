import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";

import schema from "@/schemas/game.schema.json";

// What a new train needs to be valid
const defaults = { color: "gray", quantity: 1 };

// The trains of the game, generated from the game schema
const TrainsForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <SchemaField
      keys={["trains"]}
      schema={schema.properties.trains}
      defaults={defaults}
    />
  </SchemaFormProvider>
);

export default TrainsForm;
