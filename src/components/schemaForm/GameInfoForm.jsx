import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import { GAME_INFO_KEYS } from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";

// A form for the game info, generated from the game schema: a property, type
// or enum value added to the schema in these sections shows up here.
const GameInfoForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <div className="flex flex-col gap-4">
      {GAME_INFO_KEYS.map((key) => (
        <SchemaField key={key} keys={[key]} schema={schema.properties[key]} />
      ))}
    </div>
  </SchemaFormProvider>
);

export default GameInfoForm;
