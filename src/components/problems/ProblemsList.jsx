import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Badge } from "@/components/ui/badge";

import { getDraft } from "@/components/editPanel/draftStore";
import { issueText } from "@/components/schemaForm/issueText";

import { Link } from "@/router";
import { selectGameProblems } from "@/state";
import { gameText } from "@/util/download";

// More rows than this are a sign of one mistake repeated, not worth the page
const MAX_ISSUES = 200;

const Problem = ({ issue, to }) => {
  const { t } = useTranslation();
  const label =
    issue.code === "deprecated"
      ? "problems.deprecated"
      : issue.code === "failed"
        ? "problems.warning"
        : "problems.error";

  const text = issueText(t, issue);

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
          {to ? (
            <Link
              className="underline"
              to={to}
              aria-label={t("problems.openInEditor", {
                pointer: issue.pointer,
              })}
            >
              {issue.pointer}
            </Link>
          ) : (
            issue.pointer || t("problems.root")
          )}
        </p>
        <p>{text}</p>
      </div>
    </li>
  );
};

// The problems of the game as rows, on the problems page and in the edit panel.
// linkTo(line) is where a row opens: line is the line of the problem in the
// text, null when the text is a draft (its lines are not the game's).
// className: of the list box.
const ProblemsList = ({ game, linkTo, className }) => {
  const { t } = useTranslation();
  const slug = game.meta.slug;
  const issues = useSelector((state) => selectGameProblems(state, slug));

  const shown = useMemo(() => issues?.slice(0, MAX_ISSUES) || [], [issues]);

  // CodeMirror loads after the first render: the rows are plain text until
  // the lines of the text are known
  const [json, setJson] = useState(null);
  useEffect(() => {
    let current = true;
    import("@/util/jsonEditor")
      .then((module) => {
        if (current) setJson(module);
      })
      // If it fails to load the rows stay plain text
      .catch(() => {});
    return () => {
      current = false;
    };
  }, []);

  const links = useMemo(() => {
    if (!json || shown.length === 0) return [];
    const text = gameText(game);
    const tree = json.parseTree(text);
    return shown.map((issue) => {
      const line = json.pointerToLine(tree, text, issue.pointer);
      return line ? linkTo(getDraft(slug) ? null : line) : null;
    });
  }, [json, game, slug, shown, linkTo]);

  return (
    <>
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
          <ul className={className}>
            {shown.map((issue, index) => (
              <Problem key={index} issue={issue} to={links[index]} />
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
    </>
  );
};

export default ProblemsList;
