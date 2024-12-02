import { useTranslation } from "react-i18next";

import { assoc, dissoc } from "ramda";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSettings } from "@/hooks";

const Settings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useSettings();

  const theme = settings.theme || "system";
  const setTheme = (theme) => {
    if (theme === "system") {
      setSettings(dissoc("theme", settings));
    } else {
      setSettings(assoc("theme", theme, settings));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold">{t("settings.title")}</h1>
      <div className="flex flex-row gap-4 justify-start items-center mt-4 max-w-sm">
        <Label htmlFor="settings-theme">{t("settings.theme.title")}</Label>
        <Select
          id="settings-theme"
          defaultValue={theme}
          onValueChange={setTheme}
        >
          <SelectTrigger>
            <SelectValue value={theme} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">{t("settings.theme.system")}</SelectItem>
            <SelectItem value="light">{t("settings.theme.light")}</SelectItem>
            <SelectItem value="dark">{t("settings.theme.dark")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Settings;
