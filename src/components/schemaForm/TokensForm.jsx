import { useState } from "react";

import SchemaField from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import {
  CHARTER_TOKEN_PRIMARY_KEYS,
  GAME_TOKEN_PRIMARY_KEYS,
  SHARE_PRIMARY_KEYS,
  TOKEN_KEYS,
  mixedItem,
  resolveAllOf,
} from "@/components/schemaForm/resolve";
import { TokenEditItem } from "@/components/tokenEditor/TokenEditButton";
import TokenEditorDialog from "@/components/tokenEditor/TokenEditorDialog";

import schema from "@/schemas/game.schema.json";

// The items of the lists of the tokens tab: the tokens of the game, and the
// tokens and shares inside each token type and share type. A record names its
// rows, so the items are named for what they are.
// A token or share without a name is titled by the first of titleKeys it has.
// Companies name a type by its row name, so a row says how many companies use
// it (usedBy) when it is renamed or removed.
const TITLE_KEYS = ["label", "icon", "logo", "cost"];
// The schema of a token of the game that is an object
const gameToken = () =>
  mixedItem(resolveAllOf(schema.properties.tokens, schema).items, schema);

const PROPS = {
  tokens: {
    primary: GAME_TOKEN_PRIMARY_KEYS,
    titleKeys: TITLE_KEYS,
  },
  tokenTypes: {
    usedBy: "tokens",
    rows: {
      itemKey: "tokens",
      primary: CHARTER_TOKEN_PRIMARY_KEYS,
      titleKeys: TITLE_KEYS,
    },
  },
  shareTypes: {
    usedBy: "shares",
    rows: {
      itemKey: "shares",
      primary: SHARE_PRIMARY_KEYS,
      titleKeys: TITLE_KEYS,
    },
  },
};

// The tokens, token types and share types of the game, generated from the game
// schema. The editor of a token is here, not in its item: see TokenEditItem.
const TokenLists = () => {
  const [editing, setEditing] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      {TOKEN_KEYS.map((key) => (
        <SchemaField
          key={key}
          keys={[key]}
          schema={schema.properties[key]}
          {...PROPS[key]}
          {...(key === "tokens" && {
            // The editor of a token, beside the buttons of each token
            itemAction: (value, keys, title) => (
              <TokenEditItem
                keys={keys}
                title={title}
                onOpen={() => setEditing({ keys, title })}
              />
            ),
          })}
        />
      ))}
      {editing && (
        <TokenEditorDialog
          open
          onOpenChange={(open) => !open && setEditing(null)}
          keys={editing.keys}
          schema={gameToken()}
          source="game"
          bare
          subject={editing.title}
        />
      )}
    </div>
  );
};

const TokensForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <TokenLists />
  </SchemaFormProvider>
);

export default TokensForm;
