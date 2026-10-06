import { foldedRanges, unfoldEffect } from "@codemirror/language";
import {
  Facet,
  RangeSet,
  RangeSetBuilder,
  StateEffect,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  GutterMarker,
  ViewPlugin,
  gutterLineClass,
  lineNumbers,
} from "@codemirror/view";

import {
  extendTo,
  firstLine,
  hasLine,
  sameLines,
  toggleLine,
} from "@/util/lineSpec";

// The lines of the editor a link points at (the `lines` param). The state
// keeps the set as line numbers: it does not move with the text, the url is
// what says which lines.

const set = StateEffect.define();

const mac = () => /Mac|iPhone|iPad/.test(globalThis.navigator?.platform || "");

// A line of the gutter marked as selected: one marker for every line
class SelectedMarker extends GutterMarker {
  elementClass = "cm-selected-gutter";
}
const marker = new SelectedMarker();

const lineDecoration = Decoration.line({ class: "cm-selected-line" });

// The lines of the document in the set, clamped to the document
const gutterMarkers = (state, ranges) => {
  const { doc } = state;
  const markers = [];
  for (const [from, to] of ranges) {
    for (let n = from; n <= Math.min(to, doc.lines); n++) {
      markers.push(marker.range(doc.line(n).from));
    }
  }
  return RangeSet.of(markers);
};

// Whether a transaction adds or removes a line break
const breaksLines = (tr) => {
  let breaks = false;
  tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
    if (
      inserted.lines > 1 ||
      tr.startState.doc.lineAt(fromA).number !==
        tr.startState.doc.lineAt(toA).number
    ) {
      breaks = true;
    }
  });
  return breaks;
};

// The lines the view starts with
const initialLines = Facet.define({ combine: (values) => values[0] ?? [] });

const selectedField = StateField.define({
  create: (state) => {
    const lines = state.facet(initialLines);
    return { lines, markers: gutterMarkers(state, lines) };
  },
  update(value, tr) {
    let { lines } = value;
    for (const effect of tr.effects) if (effect.is(set)) lines = effect.value;
    if (lines === value.lines) {
      if (!tr.docChanged || lines.length === 0) return value;
      // An edit inside lines only moves the markers; one that adds or removes
      // a line break changes which lines exist and rebuilds them
      if (!breaksLines(tr)) {
        return { lines, markers: value.markers.map(tr.changes) };
      }
    }
    return { lines, markers: gutterMarkers(tr.state, lines) };
  },
  provide: (field) => gutterLineClass.from(field, (value) => value.markers),
});

// The selected lines of a state
export const selectedLines = (state) => state.field(selectedField).lines;

// Only the lines in view get a decoration: a link with lines=1-999999 is as
// cheap as one with a single line
const decorations = (view) => {
  const ranges = view.state.field(selectedField).lines;
  const builder = new RangeSetBuilder();
  if (ranges.length === 0) return builder.finish();

  const { doc } = view.state;
  let last = -1;
  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = doc.lineAt(pos);
      if (hasLine(ranges, line.number) && line.from > last) {
        builder.add(line.from, line.from, lineDecoration);
        last = line.from;
      }
      pos = line.to + 1;
    }
  }
  return builder.finish();
};

const highlighter = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = decorations(view);
    }

    update(update) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        update.startState.field(selectedField) !==
          update.state.field(selectedField)
      ) {
        this.decorations = decorations(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);

export const setSelectedLines = (view, lines, scroll) =>
  view.dispatch({ effects: scroll ? [set.of(lines), scroll] : set.of(lines) });

// The effects that open the folds hiding any of the lines: a highlight inside
// a fold would not be seen. The line a fold starts on stays visible.
export const unfoldLines = (state, lines) => {
  const effects = [];
  const { doc } = state;
  foldedRanges(state).between(0, doc.length, (from, to) => {
    const first = doc.lineAt(from).number + 1;
    const last = doc.lineAt(to).number;
    if (lines.some(([a, b]) => a <= last && b >= first)) {
      effects.push(unfoldEffect.of({ from, to }));
    }
  });
  return effects;
};

// The position of the start of a line, which may be past the end
const lineStart = (state, line) =>
  state.doc.line(Math.min(Math.max(line, 1), state.doc.lines)).from;

// The effect that brings the first of the lines into view, if there is one
export const scrollToLines = (state, lines) => {
  const first = firstLine(lines);
  return first === undefined || first > state.doc.lines
    ? undefined
    : EditorView.scrollIntoView(lineStart(state, first), {
        y: "start",
        yMargin: 24,
      });
};

// The extensions: the line numbers (always shown) and their click, the set of
// lines seeded from `initial`, the highlight of the lines and of their numbers.
// `onChange(lines)` is called with the set a click made.
export const lineSelection = (initial, onChange) => {
  return [
    initialLines.of(initial),
    selectedField,
    highlighter,
    lineNumbers({
      domEventHandlers: {
        mousedown(view, block, event) {
          // Only the primary button (and not a ctrl-click, the context menu
          // of a Mac) selects
          if (event.button !== 0 || (mac() && event.ctrlKey)) return false;
          const line = view.state.doc.lineAt(block.from).number;
          const current = view.state.field(selectedField).lines;
          const modifier = mac() ? event.metaKey : event.ctrlKey;

          let next;
          if (event.shiftKey) next = extendTo(current, line, modifier);
          else if (modifier) next = toggleLine(current, line);
          else next = sameLines(current, [[line, line]]) ? [] : [[line, line]];

          event.preventDefault();
          setSelectedLines(view, next);
          onChange(next);
          return true;
        },
      },
    }),
  ];
};
