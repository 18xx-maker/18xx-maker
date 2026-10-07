import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { addIndex, chain } from "ramda";

import FontRoleInput from "@/components/config/FontRoleInput";
import Input from "@/components/config/Input";
import PinConfig from "@/components/config/PinConfig";
import ThemePreview from "@/components/config/ThemePreview";

import { useConfig } from "@/hooks";
import { isDieLayout } from "@/util/cards";

const Items = ({ section, items }) => {
  const { t } = useTranslation();
  const { config, gameConfig, userLayerConfig } = useConfig();

  return addIndex(chain)((item, index) => {
    if (item.group) {
      return (
        <div
          key={`${section}-group-${index}`}
          className="flex flex-row flex-wrap gap-6 *:flex-1 *:min-w-40"
        >
          <Items section={section} items={item.group} />
        </div>
      );
    }

    if (item.pins) {
      return [<PinConfig key={`${section}.pins`} prefix={section} />];
    }

    if (item.fontRole) {
      return [
        <FontRoleInput
          key={`${section}.${item.fontRole}`}
          role={item.fontRole}
          fields={item.fields}
          label={t(`config.${section}.roles.${item.fontRole}.label`)}
          description={t(
            `config.${section}.roles.${item.fontRole}.description`,
          )}
        />,
      ];
    }

    if (item.note) {
      // The note about a setting the game has too only shows when the game's
      // config is used, and it wins
      if (
        item.gameKey &&
        !(userLayerConfig.allowGameConfig && gameConfig?.[item.gameKey])
      ) {
        return [];
      }

      // A note for the die layouts only shows with one of them
      if (item.dieOnly && !isDieLayout(config.cards.layout)) {
        return [];
      }

      return [
        <div
          key={`${section}.${item.note}`}
          className="text-sm text-muted-foreground"
        >
          <ReactMarkdown>{t(`config.${section}.${item.note}`)}</ReactMarkdown>
        </div>,
      ];
    }

    const preview = item.themePreview ? (
      <ThemePreview
        key={`theme-preview-${item.themePreview}`}
        companies={item.themePreview === "companies"}
      />
    ) : null;

    const path =
      item.path || (item.root ? item.name : `${section}.${item.name}`);

    return [
      <Input
        key={path}
        name={path}
        options={item.options}
        dimension={item.dimension}
        clearable={item.clearable}
        inherit={item.inherit}
        fallback={item.fallback}
        label={t(`config.${section}.${item.name}.label`)}
        description={
          item.description !== false &&
          t(`config.${section}.${item.name}.description`)
        }
        large={!!item.themePreview}
      />,
      preview,
    ];
  }, items);
};

export default Items;
