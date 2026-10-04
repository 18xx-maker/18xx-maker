import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { isEmpty } from "ramda";

import DocsPager from "@/components/DocsPager";
import DocsToc from "@/components/DocsToc";
import Markdown from "@/components/Markdown";

const mds = import.meta.glob("../../docs/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const Docs = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  const pathname = location.pathname.replace(/\/docs\/?/, "");
  const file = isEmpty(pathname) ? "index" : pathname;
  // i18n.languages is the detected language then the fallbacks (["de", "en"]),
  // and only English docs exist, so use the first one with a file.
  const source = i18n.languages
    .map((language) => mds[`../../docs/${file}.${language}.md`])
    .find((md) => md !== undefined);

  const article = useRef(null);
  const [headings, setHeadings] = useState([]);

  // The list comes from the rendered headings (their ids are set by Markdown)
  useEffect(() => {
    setHeadings(
      Array.from(article.current.querySelectorAll("h2[id], h3[id]")).map(
        (heading) => {
          const copy = heading.cloneNode(true);
          copy.querySelector("[data-anchor]")?.remove();
          return {
            id: heading.id,
            text: copy.textContent,
            level: Number(heading.tagName[1]),
          };
        },
      ),
    );
  }, [source]);

  // The router does not scroll to a #heading, so a deep link or an anchor
  // click does it here, once the page is rendered.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) {
      document.getElementById(id)?.scrollIntoView();
    }
  }, [location.pathname, location.hash]);

  return (
    <div data-testid={`docs-${file}`} className="flex">
      <div ref={article} className="min-w-0 max-w-200 flex-1">
        {/* Wider than the default so tables and code have room, text stays at
            65 characters */}
        <Markdown className="max-w-200 [&_p]:max-w-[65ch] [&_ul]:max-w-[65ch]">
          {source}
        </Markdown>
        <div className="max-w-200 px-4 pb-4">
          <DocsPager />
        </div>
      </div>
      {headings.length > 1 && <DocsToc headings={headings} />}
    </div>
  );
};

export default Docs;
