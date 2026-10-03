import { useEffect } from "react";
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

  // The router does not scroll to a #heading, so a deep link or an anchor
  // click does it here, once the page is rendered.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) {
      document.getElementById(id)?.scrollIntoView();
    }
  }, [location.pathname, location.hash]);

  return (
    <div data-testid={`docs-${file}`}>
      <Markdown>{source}</Markdown>
    </div>
  );
};

export default Docs;
