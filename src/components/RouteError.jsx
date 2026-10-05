import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useRouteError } from "react-router";

import { Button } from "@/components/ui/button";

import File from "@/components/File";
import Code from "@/components/docs/Code";

import { createResetConfig } from "@/state";

// Shown when a page fails to render. A config that cannot be laid out is the
// usual cause, so offer the saved config to keep before resetting it
const RouteError = () => {
  const { t } = useTranslation();
  const error = useRouteError();
  const dispatch = useDispatch();
  const storedConfig = useSelector((state) => state.config);

  const reset = () => {
    dispatch(createResetConfig());
    window.location.reload();
  };

  return (
    <div
      className="max-w-2xl mx-auto p-6 flex flex-col gap-4"
      data-testid="route-error"
    >
      <h1 className="text-3xl font-bold">{t("routeError.title")}</h1>
      <p>{t("routeError.description")}</p>
      <pre className="whitespace-pre-wrap text-sm">
        {String(error?.message || error?.statusText || error)}
      </pre>
      <h2 className="text-xl">{t("routeError.config")}</h2>
      <Code language="json" className="w-full">
        {JSON.stringify(storedConfig, null, 2)}
      </Code>
      <div className="flex flex-row gap-4">
        <File data={storedConfig} filename="config.json">
          {t("routeError.download")}
        </File>
        <Button variant="outline" onClick={reset}>
          {t("routeError.reset")}
        </Button>
      </div>
    </div>
  );
};

export default RouteError;
