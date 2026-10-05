import { useTranslation } from "react-i18next";

import Markdown from "@/components/docs/Markdown";

const HomePage = () => {
  const { i18n } = useTranslation();

  const homes = import.meta.glob("../../home/home.*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  });
  const home = i18n.languages
    .map((language) => homes[`../../home/home.${language}.md`])
    .find((md) => md !== undefined);

  return (
    <div data-testid="home">
      <Markdown className="[&_img]:float-right [&_img]:pl-2 [&_img]:pb-3">
        {home}
      </Markdown>
    </div>
  );
};

export default HomePage;
