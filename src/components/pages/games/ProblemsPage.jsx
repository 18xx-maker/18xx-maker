import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";

import { getDraft } from "@/components/editPanel/draftStore";
import { issueText } from "@/components/schemaForm/issueText";

import { useGame } from "@/hooks";
import { selectGameProblems } from "@/state";
import { gameText } from "@/util/download";
import { firstSection } from "@/util/gameNav";
import { formatLines } from "@/util/lineSpec";

// More rows than this are a sign of one mistake repeated, not worth the page
const MAX_ISSUES = 200;

// Where the row opens: the JSON editor of the first section with the line of
// the problem selected (not when the text is a draft, its lines are not the
// game's)
const editorLink = (game, line) => {
  const params = new URLSearchParams({ edit: "true", editSection: "json" });
  if (line && !getDraft(game.meta.slug)) {
    params.set("lines", formatLines([[line, line]]));
  }
  return `/games/${game.meta.slug}/${firstSection(game)}?${params}`;
};

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

const ProblemsPage = () => {
  const game = useGame();
  const { t } = useTranslation();
  const slug = game.meta.slug;
  const issues = useSelector((state) => selectGameProblems(state, slug));

  const shown = useMemo(() => issues?.slice(0, MAX_ISSUES) || [], [issues]);

  // CodeMirror loads after the first render: the rows are plain text until
  // the lines of the text are known
  const [json, setJson] = useState(null);
  useEffect(() => {
    let current = true;
    import("@/util/jsonEditor").then((module) => {
      if (current) setJson(module);
    });
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
      return line ? editorLink(game, line) : null;
    });
  }, [json, game, shown]);

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
    </div>
  );
};

export default ProblemsPage;
