import { useTranslation } from "react-i18next";

import Markdown from "@/components/Markdown";

const Home = () => {
  const { i18n } = useTranslation();
  const language = i18n.languages[0];

  const homes = import.meta.glob("../../pages/home.*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  });
  const home = homes[`../../pages/home.${language}.md`];

  return <Markdown>{home}</Markdown>;
};

export default Home;
