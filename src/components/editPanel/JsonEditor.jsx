import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import {
  HighlightStyle,
  bracketMatching,
  foldEffect,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  diagnosticCount,
  lintGutter,
  linter,
  nextDiagnostic,
} from "@codemirror/lint";
import { Annotation, EditorState, StateEffect } from "@codemirror/state";
import {
  EditorView,
  closeHoverTooltips,
  drawSelection,
  highlightActiveLine,
  keymap,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useStore } from "react-redux";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

import {
  clearDraft,
  getDraft,
  setDraft,
} from "@/components/editPanel/draftStore";
import {
  lineSelection,
  scrollToLines,
  selectedLines,
  setSelectedLines,
  unfoldLines,
} from "@/components/editPanel/lineSelection";
import { issueText } from "@/components/schemaForm/issueText";

import { editGame, selectGameProblems } from "@/state";
import { gameText } from "@/util/download";
import {
  debounceDelay,
  duplicateKeys,
  foldRanges,
  invalidReason,
  lossyNumbers,
  minimalChange,
  parseGameText,
  parseTree,
  pointerToRange,
  sameGame,
  shareUnchanged,
} from "@/util/jsonEditor";
import { sameLines } from "@/util/lineSpec";
import { useLinesParam } from "@/util/query";

// The text of the editor changed because the game did, not because of typing
const external = Annotation.define();

// The problems of the game changed: the linter runs again
const recheck = StateEffect.define();

// Documents this long are checked later after typing
const BIG = 200_000;

const highlight = HighlightStyle.define([
  { tag: tags.propertyName, color: "var(--json-key)" },
  { tag: tags.string, color: "var(--json-string)" },
  { tag: tags.number, color: "var(--json-number)" },
  { tag: [tags.bool, tags.null], color: "var(--json-literal)" },
  { tag: [tags.punctuation, tags.separator], color: "var(--json-punctuation)" },
  { tag: tags.invalid, color: "var(--json-invalid)" },
]);

const theme = EditorView.theme({
  "&": {
    height: "100%",
    color: "hsl(var(--foreground))",
    backgroundColor: "hsl(var(--background))",
  },
  "&.cm-focused": { outline: "2px solid var(--ring)", outlineOffset: "-2px" },
  ".cm-scroller": { fontFamily: "var(--font-mono, monospace)" },
  ".cm-gutters": {
    color: "hsl(var(--muted-foreground))",
    backgroundColor: "hsl(var(--background))",
    borderRight: "1px solid hsl(var(--border))",
  },
  ".cm-activeLine, .cm-activeLineGutter": {
    backgroundColor: "hsl(var(--accent))",
  },
  // The lines of the url (distinct from the active line and the selection).
  // Translucent: the selection is drawn behind the lines and shows through
  // (uiContrast.test.js checks the text on the blend).
  ".cm-line.cm-selected-line": {
    backgroundColor: "hsl(var(--line-selected) / 0.5)",
  },
  ".cm-gutterElement.cm-selected-gutter": {
    backgroundColor: "hsl(var(--line-selected))",
    color: "hsl(var(--foreground))",
  },
  ".cm-lineNumbers .cm-gutterElement": { cursor: "pointer" },
  ".cm-cursor": { borderLeftColor: "hsl(var(--foreground))" },
  // As specific as the base theme's rule, which else wins with a light grey
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground":
    {
      backgroundColor: "hsl(var(--accent))",
    },
  ".cm-tooltip": {
    color: "hsl(var(--popover-foreground))",
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid var(--border)",
  },
});

// Strings of the editor's own controls, from the locale files
const PHRASES = {
  "Fold line": "foldLine",
  "Unfold line": "unfoldLine",
  "Folded lines": "foldedLines",
  "Unfolded lines": "unfoldedLines",
  "folded code": "foldedCode",
  unfold: "unfold",
  to: "to",
  Diagnostics: "diagnostics",
  "No diagnostics": "noDiagnostics",
  close: "close",
};

// The fixes for a trailing comma and single quotes: the two ways a hand
// edit most often breaks the file
const fixes = (text, offset, t) => {
  const char = text[offset];
  if (char === "}" || char === "]") {
    const comma = text.slice(0, offset).search(/,\s*$/);
    if (comma >= 0) {
      return [
        {
          name: t("jsonEditor.fixComma"),
          apply: (view) =>
            view.dispatch({ changes: { from: comma, to: comma + 1 } }),
        },
      ];
    }
  }
  if (char === "'") {
    const end = text.indexOf("'", offset + 1);
    if (end > offset && !text.slice(offset, end).includes("\n")) {
      return [
        {
          name: t("jsonEditor.fixQuotes"),
          apply: (view) =>
            view.dispatch({
              changes: [
                { from: offset, to: offset + 1, insert: '"' },
                { from: end, to: end + 1, insert: '"' },
              ],
            }),
        },
      ];
    }
  }
  return [];
};

const JsonEditor = ({ game }) => {
  const { t } = useTranslation();
  const store = useStore();
  const slug = game.meta.slug;
  const issues = useSelector((state) => selectGameProblems(state, slug));

  const host = useRef();
  const view = useRef();
  const timer = useRef();
  const applied = useRef(); // the game our last dispatch made
  const lastMs = useRef(0);
  const issuesRef = useRef(issues);
  const tRef = useRef(t);
  const [lines, setLines] = useLinesParam();
  const linesRef = useRef(lines);
  const setLinesRef = useRef(setLines);
  issuesRef.current = issues;
  tRef.current = t;
  linesRef.current = lines;
  setLinesRef.current = setLines;

  // The state of the text: "ok", or why it is not the game
  const [status, setStatus] = useState({ kind: "ok" });
  const [changed, setChanged] = useState(false);
  const [warning, setWarning] = useState(null);
  const [problemCount, setProblemCount] = useState(0);
  const problems = useRef(0);

  const statusOf = (text) => {
    const parsed = parseGameText(text);
    if (!parsed.ok) return { kind: "syntax", ...parsed };
    const reason = invalidReason(parsed.value);
    return reason ? { kind: "structure", reason } : { kind: "ok" };
  };

  // Puts the text on the game when it is one, else keeps the game as it was
  const apply = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
    if (!view.current) return;

    const text = view.current.state.doc.toString();
    const next = statusOf(text);
    setStatus(next);
    if (next.kind !== "ok") {
      setDraft(slug, text, store.getState().game);
      return;
    }
    clearDraft(slug);
    setChanged(false);

    const { value } = parseGameText(text);
    const current = store.getState().game;
    if (!current || sameGame(current, value)) return;

    const start = performance.now();
    store.dispatch(editGame(() => shareUnchanged(current, value)));
    applied.current = store.getState().game;
    lastMs.current = performance.now() - start;
  };
  const applyRef = useRef(apply);
  applyRef.current = apply;

  // The view lives as long as the game of the slug is the same
  useEffect(() => {
    const draft = getDraft(slug);
    const start = draft?.text ?? gameText(store.getState().game);
    const phrases = Object.fromEntries(
      Object.entries(PHRASES).map(([english, key]) => [
        english,
        tRef.current(`jsonEditor.phrases.${key}`),
      ]),
    );

    const lint = (v) => {
      const text = v.state.doc.toString();
      const translate = tRef.current;
      const parsed = parseGameText(text);
      if (!parsed.ok) {
        const at = Math.min(parsed.offset, text.length);
        return [
          {
            from: at,
            to: Math.min(at + 1, text.length),
            severity: "error",
            message: translate("jsonEditor.syntaxError", parsed),
            actions: fixes(text, at, translate),
          },
        ];
      }
      const tree = parseTree(text);
      const found = [
        ...duplicateKeys(tree, text).map((range) => ({
          ...range,
          severity: "warning",
          message: translate("jsonEditor.duplicateKey"),
        })),
        ...(issuesRef.current || []).map((issue) => ({
          ...pointerToRange(tree, text, issue.pointer),
          severity: issue.severity === "warning" ? "warning" : "error",
          message: issueText(translate, issue),
        })),
      ];
      return found;
    };

    const leave = (v) => {
      // Escape leaves the editor unless it has a popup of its own to close
      if (v.dom.querySelector(".cm-tooltip")) {
        v.dispatch({ effects: closeHoverTooltips });
        return true;
      }
      v.contentDOM.blur();
      return true;
    };

    const state = EditorState.create({
      doc: start,
      extensions: [
        EditorState.phrases.of(phrases),
        lineSelection(linesRef.current, (next) => setLinesRef.current(next)),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        highlightActiveLine(),
        foldGutter(),
        lintGutter(),
        json(),
        syntaxHighlighting(highlight),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          "aria-multiline": "true",
          tabindex: "0",
          "aria-label": tRef.current("jsonEditor.label"),
          "aria-describedby": "json-editor-status",
        }),
        keymap.of([
          { key: "Escape", run: leave },
          // Shift makes the key a capital: where the platform reports it so
          // (macOS), only the capital name matches
          ...["Shift-Alt-f", "Shift-Alt-F"].map((key) => ({
            key,
            run: () => {
              document.getElementById("json-editor-format")?.click();
              return true;
            },
          })),
          indentWithTab,
          ...foldKeymap,
          ...historyKeymap,
          ...defaultKeymap,
        ]),
        linter(lint, {
          delay: start.length > BIG ? 1000 : 300,
          needsRefresh: (update) =>
            update.transactions.some((tr) =>
              tr.effects.some((effect) => effect.is(recheck)),
            ),
        }),
        theme,
        EditorView.updateListener.of((update) => {
          // Every update, but React only hears of a change: the linter reports
          // on its own timer, and an update with the same count is no render
          const count = diagnosticCount(update.state);
          if (count !== problems.current) {
            problems.current = count;
            setProblemCount(count);
          }
          if (!update.docChanged) return;
          if (update.transactions.some((tr) => tr.annotation(external))) return;
          clearTimeout(timer.current);
          timer.current = setTimeout(
            () => applyRef.current(),
            debounceDelay(lastMs.current),
          );
        }),
        EditorView.domEventHandlers({
          blur: () => {
            applyRef.current();
          },
        }),
      ],
    });

    const scrollTo = scrollToLines(state, linesRef.current);
    const v = new EditorView({
      state,
      parent: host.current,
      scrollTo,
    });
    view.current = v;
    problems.current = 0;
    setProblemCount(0);
    const initial = statusOf(start);
    setStatus(initial);
    // The editor starts folded: the parts of the game other than info. Not
    // when it was opened on lines or on the text of a draft.
    if (!scrollTo && !draft && initial.kind === "ok") {
      const effects = foldRanges(start).map((range) => foldEffect.of(range));
      if (effects.length) v.dispatch({ effects });
    }
    // The game changed while the draft was away
    if (draft && draft.base !== store.getState().game) setChanged(true);

    return () => {
      // Typing that is waiting for its turn is not lost
      if (timer.current) applyRef.current();
      clearTimeout(timer.current);
      view.current = undefined;
      v.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // The lines of the url changed (back, forward, a pasted link): our own
  // clicks are already in the editor
  useEffect(() => {
    const v = view.current;
    if (!v || sameLines(selectedLines(v.state), lines)) return;
    // A fold hides its lines: open the ones the link points into
    const unfold = unfoldLines(v.state, lines);
    if (unfold.length) v.dispatch({ effects: unfold });
    const scroll = scrollToLines(v.state, lines);
    setSelectedLines(v, lines, scroll);
  }, [lines, slug]);

  // The problems of the game changed: check the text against them again
  useEffect(() => {
    view.current?.dispatch({ effects: recheck.of(null) });
  }, [issues]);

  // The game changed
  const previous = useRef(game);
  useEffect(() => {
    if (previous.current === game) return;
    previous.current = game;
    const v = view.current;
    // What the editor itself put on the game is already the text
    if (!v || applied.current === game) return;

    // Whatever was typed and waiting is older than this change
    clearTimeout(timer.current);
    timer.current = undefined;

    const text = v.state.doc.toString();
    const parsed = parseGameText(text);
    if (parsed.ok && sameGame(game, parsed.value)) return;

    if (!parsed.ok) {
      setChanged(true);
      return;
    }
    const change = minimalChange(text, gameText(game));
    if (change) {
      v.dispatch({ changes: change, annotations: external.of(true) });
    }
    setStatus({ kind: "ok" });
  }, [game]);

  const text = () => view.current?.state.doc.toString() ?? "";
  const valid = status.kind === "ok";

  const format = (confirmed = false) => {
    const source = text();
    // The text may be ahead of the status: the key can come before the check
    if (statusOf(source).kind !== "ok") return;
    const tree = parseTree(source);
    if (!confirmed) {
      if (duplicateKeys(tree, source).length) return setWarning("duplicates");
      if (lossyNumbers(tree, source).length) return setWarning("precision");
    }
    setWarning(null);
    const change = minimalChange(
      source,
      JSON.stringify(JSON.parse(source), null, 2),
    );
    if (change) view.current.dispatch({ changes: change });
  };

  const nextProblem = () => {
    if (view.current && nextDiagnostic(view.current)) view.current.focus();
  };

  const discard = () => {
    const v = view.current;
    const change = minimalChange(text(), gameText(store.getState().game));
    clearDraft(slug);
    setChanged(false);
    setWarning(null);
    if (change) v.dispatch({ changes: change, annotations: external.of(true) });
    setStatus({ kind: "ok" });
  };

  const message =
    status.kind === "syntax"
      ? t("jsonEditor.syntaxError", status)
      : status.kind === "structure"
        ? t(`jsonEditor.invalid.${status.reason}`)
        : t("jsonEditor.valid");

  return (
    <div className="flex flex-1 flex-col gap-2 min-h-0">
      <div className="flex flex-row flex-wrap items-center gap-2">
        <Button
          id="json-editor-format"
          type="button"
          variant="outline"
          size="sm"
          aria-disabled={!valid}
          aria-describedby="json-editor-status"
          onClick={() => format()}
        >
          {t("jsonEditor.format")}
        </Button>
        <Button
          id="json-editor-next-problem"
          type="button"
          variant="outline"
          size="sm"
          aria-disabled={problemCount === 0}
          aria-describedby="json-editor-status"
          onClick={nextProblem}
        >
          {t("jsonEditor.nextProblem")}
        </Button>
        {!valid && (
          <Button type="button" variant="outline" size="sm" onClick={discard}>
            {t("jsonEditor.discard")}
          </Button>
        )}
      </div>
      <div className="relative flex-1 min-h-96 md:min-h-64 border rounded-md overflow-hidden">
        <div
          ref={host}
          data-testid="json-editor"
          className="absolute inset-0"
        />
      </div>
      <div
        id="json-editor-status"
        role="status"
        aria-live="polite"
        className={
          valid
            ? "text-sm text-muted-foreground"
            : "text-sm text-red-700 dark:text-red-400"
        }
      >
        <p>
          {!valid && <span aria-hidden="true">⚠ </span>}
          {message}
        </p>
        {status.kind === "syntax" && (
          <p className="font-mono">{status.detail}</p>
        )}
        {!valid && <p>{t("jsonEditor.notUpdated")}</p>}
        {changed && <p>{t("jsonEditor.changed")}</p>}
        {warning && (
          <p>
            {t(`jsonEditor.warn.${warning}`)}{" "}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => format(true)}
            >
              {t("jsonEditor.formatAnyway")}
            </Button>
          </p>
        )}
      </div>
      {valid && issues?.length > 0 && (
        <p className="text-sm">
          {t("jsonEditor.problems", { count: issues.length })}{" "}
          <Link className="underline" to={`/games/${slug}/problems`}>
            {t("jsonEditor.problemsLink")}
          </Link>
        </p>
      )}
    </div>
  );
};

export default JsonEditor;
