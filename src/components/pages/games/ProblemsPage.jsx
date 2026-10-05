import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";

import { useGame } from "@/hooks";
import { selectGameProblems } from "@/state";

// More rows than this are a sign of one mistake repeated, not worth the page
const MAX_ISSUES = 200;

const Problem = ({ issue }) => {
  const { t } = useTranslation();
  const label =
    issue.code === "deprecated"
      ? "problems.deprecated"
      : issue.code === "failed"
        ? "problems.warning"
        : "problems.error";

  const text =
    issue.code === "deprecated"
      ? t([
          `problems.deprecations.${issue.params.key}`,
          "problems.deprecated-generic",
        ])
      : t(`problems.${issue.code}`, issue.params);

  return (
    <li className="flex flex-row gap-3 py-3 border-t first:border-t-0">
      <div>
        <Badge
          variant={issue.severity === "warning" ? "outline" : "destructive"}
        >
          {t(label)}
        </Badge>
      </div>
      <div className="min-w-0">
        <p className="font-mono text-sm break-words">
          {issue.pointer || t("problems.root")}
        </p>
        <p>{text}</p>
      </div>
    </li>
  );
};

const ProblemsPage = () => {
  const game = useGame();
  const { t } = useTranslation();
  const slug = game.meta.slug;
  const issues = useSelector((state) => selectGameProblems(state, slug));

  const shown = issues?.slice(0, MAX_ISSUES) || [];

  return (
    <div className="p-4" data-testid={`game-${slug}-problems`}>
      <h1 className="text-4xl font-extrabold">{t("problems.title")}</h1>
      {issues === undefined ? (
        <p className="my-4">{t("problems.checking")}</p>
      ) : issues.length === 0 ? (
        <p className="my-4">{t("problems.none")}</p>
      ) : (
        <>
          <p className="my-4">
            {t("problems.count", {
              count: issues.length,
              title: game.info.title,
            })}
          </p>
          <ul className="px-4 border rounded-xl max-w-3xl">
            {shown.map((issue, index) => (
              <Problem key={index} issue={issue} />
            ))}
          </ul>
          {issues.length > shown.length && (
            <p className="my-2">
              {t("problems.more", { count: issues.length - shown.length })}
            </p>
          )}
        </>
      )}
      <p className="my-4">
        <Link className="underline" to="/docs/games/schemas">
          {t("problems.docs")}
        </Link>
      </p>
    </div>
  );
};

export default ProblemsPage;
