import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";

import schema from "@/schemas/game.schema.json";

// The privates of the game, generated from the game schema. Only the name is
// required, so a new private needs nothing else.
const PrivatesForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <SchemaField
      keys={["privates"]}
      schema={schema.properties.privates}
      defaults={{}}
      filterable
    />
  </SchemaFormProvider>
);

export default PrivatesForm;
