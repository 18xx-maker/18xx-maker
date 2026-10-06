import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import SchemaField, {
  ChoiceField,
  JsonField,
  SchemaFormContext,
} from "@/components/schemaForm/SchemaField";
import {
  clearValue,
  issuesFor,
  kindOf,
  pointerOf,
  resolveAllOf,
  setValue,
  valueAt,
} from "@/components/schemaForm/resolve";
import AssetPicker from "@/components/tokenEditor/AssetPicker";
import ColorField from "@/components/tokenEditor/ColorField";
import DecorationGroups from "@/components/tokenEditor/DecorationGroups";
import TokenPreview from "@/components/tokenEditor/TokenPreview";
import {
  TOKEN_GROUPS,
  advancedKeys,
  setTokenKey,
  tokenFromObject,
  tokenToObject,
} from "@/components/tokenEditor/tokenModel";

// The fields of the editor work on a game of their own, { token }: the token as
// an object, whatever it is in the game. A change is made to that object and
// then stored as the token of the game: text or a number for a token that has
// only a label (in the list of tokens), no value for a token with nothing in
// it (of a company or a private), the object otherwise. What the schema does
// not know stays in the object.
const VIRTUAL = ["token"];

const editorForm = (form, keys, bare) => {
  const real = pointerOf(keys);
  const objectOf = (game) => ({ token: tokenToObject(valueAt(keys, game)) });
  const store = (token) => {
    const next = tokenFromObject(token, {
      bare,
      original: valueAt(keys, form.latest()),
    });
    return next === undefined ? form.clear(keys) : form.set(keys, next);
  };

  return {
    ...form,
    game: objectOf(form.game),
    latest: () => objectOf(form.latest()),
    issues: issuesFor(form.issues, keys).map((issue) => ({
      ...issue,
      pointer: `token${issue.pointer.slice(real.length)}`,
    })),
    set: (path, value) => {
      const object = objectOf(form.latest()).token;
      // A value that says nothing clears the key it is set at, no other key
      return store(
        path.length === 2
          ? setTokenKey(object, path[1], value)
          : setValue({ token: object }, path, value).token,
      );
    },
    clear: (path) =>
      store(clearValue(objectOf(form.latest()), path).token ?? {}),
  };
};

const SHAPES = ["circle", "square"];

// The fields of a property of the token: the pickers of icons, logos and
// colors, a choice for the shape, and the field of its kind for the rest
const TokenProp = ({ name, properties }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const node = properties[name];
  if (!node) return null;
  const schema = resolveAllOf(node, form.root);
  const keys = [...VIRTUAL, name];

  if (name === "icon" || name === "logo") {
    return <AssetPicker keys={keys} schema={schema} asset={name} />;
  }
  if (name === "tokenShape") {
    const value = valueAt(keys, form.game);
    return (
      <ChoiceField
        keys={keys}
        schema={schema}
        options={
          typeof value === "string" && !SHAPES.includes(value)
            ? [...SHAPES, value]
            : SHAPES
        }
        labelOf={(shape) =>
          t(`editPanel.tokenEditor.shapes.${shape}`, { defaultValue: shape })
        }
      />
    );
  }
  if (
    kindOf(schema, name, form.root, keys) === "string" &&
    /\bcolou?rs?\b/i.test(schema.description ?? "")
  ) {
    return <ColorField keys={keys} schema={schema} />;
  }
  return <SchemaField keys={keys} schema={schema} />;
};

const Group = ({ title, children }) => (
  <section className="flex flex-col gap-3">
    <h3 className="text-sm font-semibold">{title}</h3>
    {children}
  </section>
);

const Grid = ({ children }) => (
  <div className="grid gap-4 sm:grid-cols-2">{children}</div>
);

// A background to see the token on, as the sheets it is printed on are light
// or dark
const BACKGROUNDS = ["light", "dark"];

const TokenEditor = ({ keys, schema, source, subject, bare }) => {
  const { t } = useTranslation();
  const outer = useContext(SchemaFormContext);
  // What the token was when the editor opened, for Reset
  const [initial] = useState(() =>
    structuredClone(valueAt(keys, outer.latest())),
  );
  const [background, setBackground] = useState("light");
  const [advanced, setAdvanced] = useState(false);
  // A new key for the decorations at each Reset, so what they added is gone
  const [resets, setResets] = useState(0);
  const form = useMemo(
    () => editorForm(outer, keys, bare),
    // keys is a new array on each render, what it says is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outer, pointerOf(keys), bare],
  );

  const properties = schema.properties ?? {};
  const token = form.game.token;
  // What the schema does not know is shown as JSON, so it can be removed
  const unknownKeys = Object.keys(token).filter(
    (key) => !Object.hasOwn(properties, key),
  );
  const company =
    source === "company" ? valueAt(keys.slice(0, -1), outer.game) : undefined;
  const prop = (name) =>
    Object.hasOwn(properties, name) && (
      <TokenProp key={name} name={name} properties={properties} />
    );

  const reset = () => {
    setResets((count) => count + 1);
    return initial === undefined ? outer.clear(keys) : outer.set(keys, initial);
  };

  return (
    <SchemaFormContext.Provider value={form}>
      <div className="flex flex-row items-start gap-4 pr-8">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div
            className={
              background === "dark"
                ? "rounded-md border bg-neutral-900 p-2"
                : "rounded-md border bg-white p-2"
            }
            data-testid="token-editor-preview"
            data-background={background}
          >
            <TokenPreview
              source={source}
              token={token}
              company={company}
              className="size-28"
              role="img"
              aria-label={t("editPanel.tokenEditor.preview")}
            />
          </div>
          <div
            className="flex flex-row gap-1"
            role="group"
            aria-label={t("editPanel.tokenEditor.background")}
          >
            {BACKGROUNDS.map((name) => (
              <Button
                key={name}
                type="button"
                size="sm"
                variant={background === name ? "secondary" : "ghost"}
                aria-pressed={background === name}
                onClick={() => setBackground(name)}
              >
                {t(`editPanel.tokenEditor.backgrounds.${name}`)}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <DialogTitle>
            {subject
              ? t("editPanel.tokenEditor.titleFor", { subject })
              : t("editPanel.tokenEditor.title")}
          </DialogTitle>
          <DialogDescription>
            {t("editPanel.tokenEditor.description")}
          </DialogDescription>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={reset}
          >
            <RotateCcw />
            {t("editPanel.tokenEditor.reset")}
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-1">
        <Group title={t("editPanel.tokenEditor.groups.shape")}>
          <Grid>{TOKEN_GROUPS.shape.map(prop)}</Grid>
        </Group>
        <Group title={t("editPanel.tokenEditor.groups.content")}>
          <Grid>{TOKEN_GROUPS.content.map(prop)}</Grid>
        </Group>
        <Group title={t("editPanel.tokenEditor.groups.colors")}>
          <Grid>{TOKEN_GROUPS.colors.map(prop)}</Grid>
        </Group>
        <Group title={t("editPanel.tokenEditor.groups.decorations")}>
          <DecorationGroups
            key={resets}
            properties={properties}
            token={token}
            prop={prop}
          />
        </Group>
        <section className="flex flex-col gap-3">
          <button
            type="button"
            className="flex flex-row items-center gap-1 self-start rounded-sm text-sm font-semibold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            aria-expanded={advanced}
            onClick={() => setAdvanced(!advanced)}
          >
            {advanced ? (
              <ChevronDown className="size-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4" aria-hidden="true" />
            )}
            {t("editPanel.tokenEditor.groups.advanced")}
          </button>
          {advanced && (
            <Grid>
              {advancedKeys(properties).map(prop)}
              {unknownKeys.map((key) => (
                <JsonField key={key} keys={[...VIRTUAL, key]} schema={{}} />
              ))}
            </Grid>
          )}
        </section>
      </div>
    </SchemaFormContext.Provider>
  );
};

// The editor of a token in a dialog. keys is where the token is in the game,
// schema the object schema of the token, source the place it is drawn for
// ("company", "private" or "game", see TokenPreview). A token of a list of
// tokens is bare (text or a number) when it has only a label. Every change is
// made to the game at once; there is nothing to save or cancel. When it closes
// the focus goes where onCloseAutoFocus says (default: where it was).
const TokenEditorDialog = ({
  open,
  onOpenChange,
  onCloseAutoFocus,
  ...props
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="max-w-3xl focus:outline-hidden"
      onCloseAutoFocus={onCloseAutoFocus}
    >
      <TokenEditor {...props} />
    </DialogContent>
  </Dialog>
);

export default TokenEditorDialog;
