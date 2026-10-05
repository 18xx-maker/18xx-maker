import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import json from "shiki/langs/json.mjs";
import dark from "shiki/themes/github-dark-default.mjs";
import light from "shiki/themes/github-light.mjs";

import { cn } from "@/util/cn";

// The JavaScript regex engine needs no WASM, and only the grammars the docs
// and config views use are bundled. Anything else renders as plain text.
const highlighter = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
  langs: [json, bash],
  themes: [light, dark],
});

const languages = new Set(highlighter.getLoadedLanguages());

// Both themes ride on each token as --shiki-light/--shiki-dark variables, the
// `.shiki` styles in ui.css pick one by the current theme
export const tokenize = (code, language) =>
  languages.has(language)
    ? highlighter.codeToTokens(code, {
        defaultColor: false,
        lang: language,
        themes: { dark: "github-dark-default", light: "github-light" },
      }).tokens
    : code.split("\n").map((line) => (line ? [{ content: line }] : []));

const CodeHighlighted = ({ children, className, language, ...props }) => {
  const lines = tokenize(String(children), language);

  return (
    <div
      {...props}
      className={cn(
        "shiki overflow-auto p-4 font-mono whitespace-pre",
        className,
      )}
    >
      <code>
        {lines.map((tokens, i) => (
          <span key={i}>
            {i > 0 && "\n"}
            {tokens.map((token, j) => (
              <span key={j} style={token.htmlStyle}>
                {token.content}
              </span>
            ))}
          </span>
        ))}
      </code>
    </div>
  );
};

export default CodeHighlighted;
