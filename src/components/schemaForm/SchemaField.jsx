import { useContext } from "react";

import {
  BooleanField,
  ChoiceField,
  EnumListField,
} from "@/components/schemaForm/fields/ChoiceFields";
import {
  BoolOrColorField,
  ColorTupleField,
  ColorValueField,
} from "@/components/schemaForm/fields/ColorFields";
import { ArrayField } from "@/components/schemaForm/fields/ListFields";
import {
  CountField,
  NumberValueField,
} from "@/components/schemaForm/fields/NumberFields";
import { ObjectField } from "@/components/schemaForm/fields/ObjectField";
import { RecordField } from "@/components/schemaForm/fields/RecordField";
import {
  JsonField,
  RevenueField,
  StringArrayField,
  StringField,
  StringListField,
  StringOrNumberField,
} from "@/components/schemaForm/fields/StringFields";
import { SchemaFormContext } from "@/components/schemaForm/fields/shared";
import { overrideFor } from "@/components/schemaForm/overrides";
import {
  kindOf,
  parseLimit,
  resolveAllOf,
} from "@/components/schemaForm/resolve";

export { ChoiceField, JsonField, SchemaFormContext };
export {
  FieldShell,
  useDraft,
  useField,
} from "@/components/schemaForm/fields/shared";

const SchemaField = ({ keys, schema, ...rest }) => {
  const form = useContext(SchemaFormContext);
  const { root } = form;
  const node = resolveAllOf(schema, root);
  const props = { keys, schema: node };

  const custom = overrideFor(node, keys, form);
  if (custom) return custom.override.render({ ...props, ...custom.props });

  switch (kindOf(node, keys[keys.length - 1], root, keys)) {
    case "string":
      return <StringField {...props} />;
    case "text":
      return <StringField {...props} long />;
    case "number":
      return <NumberValueField {...props} />;
    case "boolean":
      return <BooleanField {...props} />;
    case "enum":
      return <ChoiceField {...props} options={node.enum} />;
    case "stringOrNumber":
      return <StringOrNumberField {...props} />;
    case "limit":
      return (
        <CountField
          {...props}
          parse={parseLimit}
          invalid="editPanel.invalidLimit"
        />
      );
    case "color":
      return <ColorValueField {...props} />;
    case "stringList":
      return <StringListField {...props} />;
    case "revenue":
      return <RevenueField {...props} />;
    case "count":
      return <CountField {...props} />;
    case "object":
      return <ObjectField {...props} {...rest} />;
    case "record":
      return <RecordField {...props} {...rest} />;
    case "stringArray":
      return <StringArrayField {...props} />;
    case "enumList":
      return <EnumListField {...props} />;
    case "boolOrColor":
      return <BoolOrColorField {...props} />;
    case "colorTuple":
      return <ColorTupleField {...props} />;
    case "array":
      return <ArrayField {...props} {...rest} />;
    default:
      return <JsonField {...props} />;
  }
};

export default SchemaField;
