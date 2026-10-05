import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { tokenize } from "@/components/docs/CodeHighlighted";

import { cn } from "@/util/cn";
import { gameText } from "@/util/download";
import { diffText } from "@/util/gameDiff";

const marks = { add: "+", delete: "-", context: " " };

const Line = ({ line, tokens }) => (
  <div
    className={cn(
      "flex min-w-max",
      line.type === "add" && "diff-add",
      line.type === "delete" && "diff-delete",
    )}
  >
    <span className="w-12 shrink-0 select-none px-1 text-right opacity-50">
      {line.oldLine}
    </span>
    <span className="w-12 shrink-0 select-none px-1 text-right opacity-50">
      {line.newLine}
    </span>
    <span className="w-4 shrink-0 select-none text-center">
      {marks[line.type]}
    </span>
    <span className="whitespace-pre pr-4">
      {tokens.map((token, i) => (
        <span key={i} style={token.htmlStyle}>
          {token.content}
        </span>
      ))}
    </span>
  </div>
);

// The line diff of two games. Both sides are highlighted whole, so the colors
// of a line that starts inside a string or object stay right.
const DiffView = ({ original, edited }) => {
  const { t } = useTranslation();
  const { hunks, added, removed, tokens } = useMemo(() => {
    const oldText = gameText(original);
    const newText = gameText(edited);
    return {
      ...diffText(oldText, newText),
      tokens: {
        old: tokenize(oldText, "json"),
        new: tokenize(newText, "json"),
      },
    };
  }, [original, edited]);

  return (
    <div data-testid="diff">
      <p className="my-2 text-sm" data-testid="diff-summary">
        {t("changes.summary", { added, removed })}
      </p>
      {hunks.length === 0 ? (
        <p className="my-4">{t("changes.none")}</p>
      ) : (
        <div className="shiki overflow-auto rounded-xl border font-mono text-sm">
          {hunks.map((hunk, i) => (
            <div key={i} className={cn(i > 0 && "border-t")}>
              {hunk.map((line, j) => (
                <Line
                  key={j}
                  line={line}
                  tokens={
                    line.type === "add"
                      ? tokens.new[line.newLine - 1]
                      : tokens.old[line.oldLine - 1]
                  }
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiffView;
