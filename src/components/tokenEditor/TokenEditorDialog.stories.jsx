import { useState } from "react";

import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import { mixedItem, resolveAllOf } from "@/components/schemaForm/resolve";
import {
  TokenEditField,
  TokenEditItem,
} from "@/components/tokenEditor/TokenEditButton";
import TokenEditorDialog from "@/components/tokenEditor/TokenEditorDialog";

import { useGame } from "@/hooks";
import schema from "@/schemas/game.schema.json";

// Where each token of the story is in the game, and its schema
const PLACES = {
  company: {
    keys: ["companies", 0, "token"],
    schema: resolveAllOf(
      schema.properties.companies.items.properties.token,
      schema,
    ),
  },
  private: {
    keys: ["privates", 2, "token"],
    schema: resolveAllOf(
      schema.properties.privates.items.properties.token,
      schema,
    ),
  },
  game: {
    keys: ["tokens", 0],
    schema: mixedItem(
      resolveAllOf(schema.properties.tokens, schema).items,
      schema,
    ),
  },
};

// The token editor of a token of the loaded game: the field that opens it,
// or with open the dialog itself
const Editor = ({ source, open }) => {
  const game = useGame();
  const [opened, setOpened] = useState(false);
  const { keys, schema: node } = PLACES[source];

  return (
    <SchemaFormProvider game={game}>
      {source === "game" ? (
        // A token of the list of tokens has a button beside the item buttons
        <TokenEditItem
          keys={keys}
          title="Round"
          onOpen={() => setOpened(true)}
        />
      ) : (
        <TokenEditField keys={keys} schema={node} source={source} />
      )}
      {(open || opened) && (
        <TokenEditorDialog
          open
          onOpenChange={setOpened}
          keys={keys}
          schema={node}
          source={source}
          bare={source === "game"}
        />
      )}
    </SchemaFormProvider>
  );
};

export default {
  title: "Chrome/TokenEditorDialog",
  component: Editor,
  // An interface component of a loaded game, not an svg of the print pages
  parameters: { layout: "centered", chrome: true, game: "18Test" },
  argTypes: {
    source: { control: "select", options: Object.keys(PLACES) },
    open: { control: "boolean" },
  },
  args: { source: "company", open: false },
};

export const Company = {};

export const Private = { args: { source: "private" } };

export const GameToken = { args: { source: "game" } };

export const Open = { args: { open: true } };
