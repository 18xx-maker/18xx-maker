import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { prop } from "ramda";

import { Check, Download, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import Code from "@/components/Code";

import { logos } from "@/data";
import { createDownloadPercent } from "@/state";

const ChromeIcon = () => {
  const Component = logos["webdev/chrome"];
  return <Component width="24" height="24" />;
};

const ElectronIcon = () => {
  const Component = logos["webdev/electron"];
  return <Component width="24" height="24" />;
};

const PlatformIcon = ({ platform, ...pass }) => {
  let Component;
  switch (platform) {
    case "darwin":
      Component = logos["dev/apple"];
      break;
    case "win32":
      Component = logos["dev/microsoft"];
      break;
    case "linux":
      Component = logos["dev/linux"];
      break;
    default:
      return null;
  }

  return <Component width="24" height="24" {...pass} />;
};

const Update = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const update = useSelector(prop("update"));

  const checkForUpdates = () => {
    window.api.checkForUpdates();
  };

  const quitAndInstall = () => {
    dispatch(createDownloadPercent(0));
    window.api.downloadUpdate();
  };

  if (!update) {
    return null;
  }

  if (update.checking) {
    return <LoaderCircle className="animate-spin" />;
  }

  if (update.downloading !== undefined) {
    return <Progress value={update.downloading} />;
  }

  if (!update.available && update.dev) {
    return <p>{t("app.updates.dev")}</p>;
  }

  if (!update.available) {
    return (
      <>
        <p>
          {update.error
            ? t("app.updates.error")
            : t("app.updates.latest", { version: update.info.version })}
        </p>
        <p>
          <Button variant="outline" onClick={checkForUpdates}>
            <Check />
            {t("app.updates.check")}
          </Button>
        </p>
      </>
    );
  }

  return (
    <div>
      <p>{t("app.updates.available", { version: update.info.version })}</p>
      <p>
        <Button variant="outline" onClick={quitAndInstall}>
          <Download />
          {t("app.updates.update")}
        </Button>
      </p>
    </div>
  );
};

const App = () => {
  const { t } = useTranslation();

  const [data, setData] = useState();

  useEffect(() => {
    window.api.loadConfig().then(setData);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold">{t("app.title")}</h1>
      {data && (
        <div className="p-4 border rounded-xl my-4">
          <h2 className="text-2xl font-bold">{t("app.versions")}</h2>
          <div className="flex flex-row gap-4 mt-4">
            <PlatformIcon
              platform={data.platform}
              className="fill-white stroke-white"
            />
            {data.versions.system}
          </div>
          <div className="flex flex-row gap-4 mt-4">
            <ElectronIcon />
            {data.versions.electron}
          </div>
          <div className="flex flex-row gap-4 mt-4">
            <ChromeIcon />
            {data.versions.chrome}
          </div>
          <div className="flex flex-row gap-4 mt-4">
            <img src="./logo.png" width="24" height="24" />
            {data.versions.app}
          </div>
        </div>
      )}
      <div className="p-4 border rounded-xl mb-4">
        <h2 className="text-2xl font-bold mb-4">{t("app.updates.title")}</h2>
        <Update />
      </div>
      {data && (
        <div className="border rounded-xl overflow-hidden">
          <p className="p-4">{t("app.config.what")}</p>
          <p className="px-4 pb-4">
            {t("app.config.file")} <code>{data.path}</code>
          </p>
          <Code language="json">{JSON.stringify(data.config, null, 2)}</Code>
        </div>
      )}
    </div>
  );
};
export default App;
