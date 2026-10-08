import { useTranslation } from "react-i18next";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { docsPages } from "@/components/nav";

import { Link, useLocation } from "@/router";

const PagerLink = ({ page, label, children }) => {
  const { t } = useTranslation();
  return (
    <Link
      to={page.to}
      className="flex flex-1 flex-col gap-1 rounded-lg border p-3 hover:bg-accent first:items-start last:items-end"
    >
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        {children(label)}
      </span>
      <span className="font-semibold text-primary-foreground">
        {t(page.label)}
      </span>
    </Link>
  );
};

// Links to the docs page before and after this one in the sidebar. The side
// with no page is left empty so the other keeps its edge.
const DocsPager = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const path = location.pathname.replace(/(?<=.)\/$/, "");
  const index = docsPages.findIndex(({ to }) => to === path);
  if (index < 0) return null;

  const previous = docsPages[index - 1];
  const next = docsPages[index + 1];

  return (
    <nav aria-label={t("docs.pager")} className="mt-10 flex gap-3">
      {previous ? (
        <PagerLink page={previous} label={t("docs.previous")}>
          {(label) => (
            <>
              <ArrowLeft className="size-4" aria-hidden="true" />
              {label}
            </>
          )}
        </PagerLink>
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <PagerLink page={next} label={t("docs.next")}>
          {(label) => (
            <>
              {label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </PagerLink>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
};

export default DocsPager;
