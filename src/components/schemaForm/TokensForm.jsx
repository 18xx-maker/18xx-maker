import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import {
  CHARTER_TOKEN_PRIMARY_KEYS,
  GAME_TOKEN_PRIMARY_KEYS,
  SHARE_PRIMARY_KEYS,
  TOKEN_KEYS,
} from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";

// The items of the lists of the tokens tab: the tokens of the game, and the
// tokens and shares inside each token type and share type. A record names its
// rows, so the items are named for what they are.
const PROPS = {
  tokens: { primary: GAME_TOKEN_PRIMARY_KEYS },
  tokenTypes: {
    rows: { itemKey: "tokens", primary: CHARTER_TOKEN_PRIMARY_KEYS },
  },
  shareTypes: { rows: { itemKey: "shares", primary: SHARE_PRIMARY_KEYS } },
};

// The tokens, token types and share types of the game, generated from the
// game schema
const TokensForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <div className="flex flex-col gap-4">
      {TOKEN_KEYS.map((key) => (
        <SchemaField
          key={key}
          keys={[key]}
          schema={schema.properties[key]}
          {...PROPS[key]}
        />
      ))}
    </div>
  </SchemaFormProvider>
);

export default TokensForm;
