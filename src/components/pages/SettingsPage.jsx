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
import { Switch } from "@/components/ui/switch";

import { useSettings } from "@/hooks";
import { availableLanguages, detectedLanguage } from "@/locales/language";
import {
  createSetEditorKeys,
  createSetLanguage,
  createSetOpenExportFolder,
} from "@/state";
import {
  selectEditorKeys,
  selectLanguage,
  selectOpenExportFolder,
} from "@/state/selectors";
import capability from "@/util/capability";

const languageName = (code, display = code) =>
  new Intl.DisplayNames([display], { type: "language" }).of(code);

const SettingsPage = () => {
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

  const editorKeys = useSelector(selectEditorKeys);

  const openExportFolder = useSelector(selectOpenExportFolder);

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
      <div className="flex flex-row gap-4 justify-start items-center mt-4 max-w-sm">
        <Label htmlFor="settings-editor-keys">
          {t("settings.editorKeys.title")}
        </Label>
        <Select
          id="settings-editor-keys"
          value={editorKeys}
          onValueChange={(keys) => dispatch(createSetEditorKeys(keys))}
        >
          <SelectTrigger aria-label={t("settings.editorKeys.title")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">
              {t("settings.editorKeys.normal")}
            </SelectItem>
            <SelectItem value="emacs">
              {t("settings.editorKeys.emacs")}
            </SelectItem>
            <SelectItem value="vim">{t("settings.editorKeys.vim")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("settings.editorKeys.description")}
      </p>
      {capability.electron && (
        <div className="mt-4 max-w-sm">
          <div className="flex flex-row gap-4 justify-start items-center">
            <Switch
              id="settings-open-export-folder"
              checked={openExportFolder}
              onCheckedChange={(open) =>
                dispatch(createSetOpenExportFolder(open))
              }
            />
            <Label htmlFor="settings-open-export-folder">
              {t("settings.openExportFolder.title")}
            </Label>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("settings.openExportFolder.description")}
          </p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
