import { diff } from "deep-object-diff";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";

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

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Code from "@/components/Code";
import File from "@/components/File";
import { sections } from "@/components/config";
import Items from "@/components/config/Items";

import defaultConfig from "@/defaults.json";
import { useConfig } from "@/hooks";
import schema from "@/schemas/config.schema.json";
import { createAlert } from "@/state";
import { useStringParam } from "@/util/query";

export const getPath = split(".");
export const getSchemaPath = compose(
  chain((n) => ["properties", n]),
  filter(complement(isEmpty)),
  split("."),
);
export const getSchema = (name) => path(getSchemaPath(name), schema);

const Config = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { config, resetConfig, importConfig } = useConfig();
  const [importText, setImportText] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [section, setSection] = useStringParam("section", "colors");

  const items = prop("items", find(propEq(section, "section"), sections)) || [];

  const onImport = async () => {
    let imported;
    try {
      imported = JSON.parse(importText);
    } catch {
      return dispatch(
        createAlert(
          t("alerts.configInvalidJson"),
          t("alerts.configInvalidJsonMessage"),
          "error",
        ),
      );
    }

    if (await importConfig(imported)) {
      setImportText("");
    }
  };

  const onClose = () => {
    const params = new URLSearchParams(location.search);
    params.delete("section");
    params.delete("config");
    navigate({ search: params.toString() });
  };

  return (
    <div className="print:hidden z-50 fixed inset-0 md:left-auto md:w-1/3 md:min-w-96 flex flex-col bg-background md:border-l shadow-lg">
      <div className="flex flex-row items-center justify-between gap-4 p-4 border-b">
        <h1 className="text-3xl font-bold">{t("config.title")}</h1>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("config.close")}
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col gap-6">
        <Select value={section} onValueChange={setSection}>
          <SelectTrigger
            className="text-xl p-2 w-full"
            aria-label={t("config.sectionLabel")}
          >
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
        <div className="flex flex-col gap-6">
          <Items section={section} items={items} />
          {section === "data" && [
            <p key="reset-p" className="my-4">
              {t("config.data.resetDescription")}
            </p>,
            <Button
              key="reset-button"
              variant="outline"
              onClick={resetConfig}
              className="self-start"
            >
              {t("config.data.reset")}
            </Button>,
            <p key="local-p" className="mb-4">
              {t("config.data.local")}
            </p>,
            <h3 key="json-header" className="text-xl mb-2">
              {t("config.data.json")}
            </h3>,
            <p key="file-p" className="mb-4">
              {t("config.data.file")}
            </p>,
            <Code key="config-diff" language="json" className="w-full">
              {JSON.stringify(diff(defaultConfig, config), null, 2)}
            </Code>,
            <File
              key="config-file"
              data={diff(defaultConfig, config)}
              filename="config.json"
              className="my-5"
            />,
            <h3 key="import-header" className="text-xl mb-2">
              {t("config.data.importTitle")}
            </h3>,
            <p key="import-p" className="mb-4">
              {t("config.data.importDescription")}
            </p>,
            <textarea
              key="import-text"
              aria-label={t("config.data.importTitle")}
              placeholder={t("config.data.importPlaceholder")}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            />,
            <Button
              key="import-button"
              variant="outline"
              onClick={onImport}
              disabled={!importText.trim()}
              className="self-start"
            >
              {t("config.data.importButton")}
            </Button>,
          ]}
        </div>
      </div>
    </div>
  );
};

export default Config;
