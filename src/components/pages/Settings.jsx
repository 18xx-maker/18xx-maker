import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

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
import { availableLanguages, detectedLanguage } from "@/locales/language";
import { createSetLanguage } from "@/state";
import { selectLanguage } from "@/state/selectors";

const languageName = (code, display = code) =>
  new Intl.DisplayNames([display], { type: "language" }).of(code);

const Settings = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [settings, setSettings] = useSettings();

  const theme = settings.theme || "system";
  const setTheme = (theme) => {
    if (theme === "system") {
      setSettings(dissoc("theme", settings));
    } else {
      setSettings(assoc("theme", theme, settings));
    }
  };

  const language = useSelector(selectLanguage) ?? "system";
  const setLanguage = (language) =>
    dispatch(createSetLanguage(language === "system" ? undefined : language));

  const languages = availableLanguages(i18n);
  const detected = detectedLanguage();
  const supported = languages.includes(detected.split("-")[0]);
  const display = i18n.resolvedLanguage;

  return (
    <div className="p-4" data-testid="settings">
      <h1 className="text-4xl font-extrabold">{t("settings.title")}</h1>
      <div className="flex flex-row gap-4 justify-start items-center mt-4 max-w-sm">
        <Label htmlFor="settings-theme">{t("settings.theme.title")}</Label>
        <Select
          id="settings-theme"
          defaultValue={theme}
          onValueChange={setTheme}
        >
          <SelectTrigger aria-label={t("settings.theme.title")}>
            <SelectValue value={theme} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">{t("settings.theme.system")}</SelectItem>
            <SelectItem value="light">{t("settings.theme.light")}</SelectItem>
            <SelectItem value="dark">{t("settings.theme.dark")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row gap-4 justify-start items-center mt-4 max-w-sm">
        <Label htmlFor="settings-language">
          {t("settings.language.title")}
        </Label>
        <Select
          id="settings-language"
          value={language}
          onValueChange={setLanguage}
        >
          <SelectTrigger aria-label={t("settings.language.title")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">
              {t("settings.language.system")}
            </SelectItem>
            {languages.map((code) => (
              <SelectItem key={code} value={code}>
                {languageName(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="mt-2 text-sm text-muted-foreground" data-testid="detected">
        {supported
          ? t("settings.language.detected", {
              language: languageName(detected, display),
            })
          : t("settings.language.unavailable", {
              language: languageName(detected, display),
              fallback: languageName(i18n.options.fallbackLng[0], display),
            })}
      </p>
    </div>
  );
};

export default Settings;
