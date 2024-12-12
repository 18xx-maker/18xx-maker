import { diff } from "deep-object-diff";
import { useTranslation } from "react-i18next";

import {
  chain,
  complement,
  compose,
  filter,
  find,
  isEmpty,
  map,
  path,
  prop,
  propEq,
  split,
} from "ramda";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import Code from "@/components/Code";
import File from "@/components/File";
import { sections } from "@/components/config";
import Items from "@/components/config/Items";

import defaultConfig from "@/defaults.json";
import { useConfig } from "@/hooks";
import schema from "@/schemas/config.schema.json";
import { useBooleanParam, useStringParam } from "@/util/query";

export const getPath = split(".");
export const getSchemaPath = compose(
  chain((n) => ["properties", n]),
  filter(complement(isEmpty)),
  split("."),
);
export const getSchema = (name) => path(getSchemaPath(name), schema);

const Config = () => {
  const { t } = useTranslation();
  const { config, resetConfig } = useConfig();
  const [section, setSection] = useStringParam("section", "colors");
  const [, toggleConfig] = useBooleanParam("config");

  const items = prop("items", find(propEq(section, "section"), sections)) || [];

  const onClose = () => {
    setSection("colors");
    toggleConfig();
  };

  return (
    <div className="print:hidden z-50 absolute top-0 left-0 md:left-auto md:max-w-md md:bottom-0 md:overflow-scroll md:border right-0 min-h-screen bg-background p-4 overscroll-contain overscroll-none">
      <h1 className="text-4xl font-bold">{t("config.title")}</h1>
      <button onClick={onClose}>Close</button>
      <Separator orientation="horizontal" className="my-4" />
      <Select value={section} onValueChange={setSection}>
        <SelectTrigger className="text-xl p-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {map((item) => {
              return (
                <SelectItem key={item.section} value={item.section}>
                  {t(`config.${item.section}.title`)}
                </SelectItem>
              );
            }, sections)}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex flex-row flex-wrap gap-4">
        <Items section={section} items={items} />
        {section === "data" && [
          <p key="reset-p" className="my-4">
            You can remove any custom settings and revert back to the defaults
            with this button.
          </p>,
          <Button
            key="reset-button"
            variant="outline"
            onClick={resetConfig}
            className="mb-4"
          >
            Reset To Defaults
          </Button>,
          <p key="local-p" className="mb-4">
            These values are saved on this browser in local storage.
          </p>,
          <h3 key="json-header" className="text-xl mb-2">
            JSON
          </h3>,
          <p key="file-p" className="mb-4">
            You can copy and paste this json value into the file in
            src/config.json if you want to apply these settings to command line
            or local servers.
          </p>,
          <Code key="config-diff" language="json" className="w-full">
            {JSON.stringify(diff(defaultConfig, config), null, 2)}
          </Code>,
          <File
            key="config-file"
            data={diff(defaultConfig, config)}
            filename="config.json"
            className="my-5"
          >
            Download config.json
          </File>,
        ]}
      </div>
    </div>
  );
};

export default Config;
