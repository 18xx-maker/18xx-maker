import { useTranslation } from "react-i18next";

const HeaderTitle = ({ Icon, label }) => {
  const { t } = useTranslation();

  return (
    <>
      {Icon && <Icon className="w-4 h-4" />}
      <span className="font-medium">{t(label)}</span>
    </>
  );
};

export default HeaderTitle;
