import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Link } from "@/router";

// The "On this page" column of a docs page: a link for each heading, with the
// section being read highlighted.
const DocsToc = ({ headings }) => {
  const { t } = useTranslation();
  const [active, setActive] = useState(null);

  useEffect(() => {
    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) =>
          isIntersecting ? visible.add(target.id) : visible.delete(target.id),
        );
        // The first heading in view, else the section stays as it was
        const first = headings.find(({ id }) => visible.has(id));
        if (first) setActive(first.id);
      },
      // Only the top of the page counts as being read
      { rootMargin: "0px 0px -70% 0px" },
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav
      aria-label={t("docs.toc")}
      className="hidden xl:block w-56 shrink-0 sticky top-4 self-start p-4 text-sm"
    >
      <p className="mb-2 font-semibold">{t("docs.toc")}</p>
      <ul className="flex flex-col gap-2 border-l pl-4">
        {headings.map(({ id, text, level }) => (
          <li key={id} className={clsx(level === 3 && "pl-3")}>
            <Link
              to={{ hash: id }}
              aria-current={id === active ? "location" : undefined}
              className={clsx(
                "text-muted-foreground hover:text-foreground",
                id === active && "font-semibold text-foreground",
              )}
            >
              {text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DocsToc;
