import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { addIndex, chain } from "ramda";

import Input from "@/components/config/Input";
import PinConfig from "@/components/config/PinConfig";
import ThemePreview from "@/components/config/ThemePreview";

const Items = ({ section, items }) => {
  const { t } = useTranslation();

  return addIndex(chain)((item, index) => {
    if (item.group) {
      return (
        <div key={`${section}-group-${index}`} className="flex flex-row gap-4">
          <Items section={section} items={item.group} />
        </div>
      );
    }

    if (item.pins) {
      return [<PinConfig key={`${section}.pins`} prefix={section} />];
    }

    if (item.note) {
      return [
        <ReactMarkdown
          key={`${section}.${item.note}`}
          className="text-sm mb-4 mt-1 text-muted-foreground"
        >
          {t(`config.${section}.${item.note}`)}
        </ReactMarkdown>,
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
