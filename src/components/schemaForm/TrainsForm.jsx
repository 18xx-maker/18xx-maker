import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";

import schema from "@/schemas/game.schema.json";

// The trains of the game, generated from the game schema
const TrainsForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <SchemaField keys={["trains"]} schema={schema.properties.trains} />
  </SchemaFormProvider>
);

export default TrainsForm;
