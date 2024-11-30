import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { isEmpty } from "ramda";

import Markdown from "@/components/Markdown";

const mds = import.meta.glob("../../docs/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const Docs = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  const language = i18n.languages[0];

  const pathname = location.pathname.replace(/\/docs\/?/, "");
  const file = isEmpty(pathname) ? "index" : pathname;
  const source = mds[`../../docs/${file}.${language}.md`];

  return <Markdown>{source}</Markdown>;
};

export default Docs;
