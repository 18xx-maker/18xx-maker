import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import {
  PLAYER_KEYS,
  PLAYER_PRIMARY_KEYS,
} from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";

// The players table (a card for each player count, titled "3 players" and
// identified by its number) and the bank, capital and certificate limit of the
// game, generated from the game schema
const PlayersForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <div className="flex flex-col gap-4">
      {PLAYER_KEYS.map((key) => (
        <SchemaField key={key} keys={[key]} schema={schema.properties[key]} />
      ))}
      <SchemaField
        keys={["players"]}
        schema={schema.properties.players}
        primary={PLAYER_PRIMARY_KEYS}
        titleKey="number"
        idKey="number"
        title="editPanel.titles.players"
      />
    </div>
  </SchemaFormProvider>
);

export default PlayersForm;
