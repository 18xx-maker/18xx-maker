import { useState } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

// Text compared without case, spaces, dashes and underscores: "token size"
// finds "tokenSize" and "Token Size"
const norm = (text) => text.toLowerCase().replace(/[\s_-]+/g, "");

// The fields of the form that match a query, in page order: a label or a
// legend (an object) that has the text, with what takes the focus. Fields in a
// closed card are in the page too, hidden.
export const findFields = (root, query) => {
  const wanted = norm(query);
  if (!root || !wanted) return [];
  return [...root.querySelectorAll("label[for], legend")]
    .filter((el) => norm(el.textContent).includes(wanted))
    .map((el) => ({
      el,
      name: el.textContent.replace(/\s\*$/, "").trim(),
      target:
        el.tagName === "LABEL"
          ? document.getElementById(el.htmlFor)
          : el.parentElement.querySelector("input, button, select, textarea"),
    }))
    .filter(({ target }) => target);
};

// Opens the cards that hold a field, the outermost first, then scrolls to the
// field and focuses it
export const revealField = ({ el, target }) => {
  const titles = [];
  for (let node = el, hidden; (hidden = node.closest("[hidden]"));) {
    const card = hidden.closest("[data-item]");
    const title = card?.querySelector("[data-title]");
    if (!title) break;
    titles.unshift(title);
    node = card;
  }
  // The field is rendered once the card is open
  flushSync(() => {
    for (const title of titles) {
      if (title.getAttribute("aria-expanded") !== "true") title.click();
    }
  });
  target.scrollIntoView({ block: "center" });
  target.focus();
};

// The title of the card a field is in, to tell the same field of several cards
// apart
const cardTitle = (el) => {
  const title = el.closest("[data-item]")?.querySelector("[data-title]");
  if (!title) return undefined;
  // The token of a company has text of its own
  const copy = title.cloneNode(true);
  copy.querySelectorAll("svg").forEach((svg) => svg.remove());
  return copy.textContent.replace(/\s+/g, " ").trim();
};

// Finds a field of the open form by its name: Enter goes to the first match,
// opening the card it is in, and again to the next one (Shift+Enter goes
// back). Escape clears the text first.
const FieldSearch = ({ panel }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [index, setIndex] = useState(-1);

  const change = (value) => {
    setQuery(value);
    setIndex(-1);
    setStatus("");
  };

  const go = (step) => {
    const found = findFields(document.getElementById(panel), query);
    if (found.length === 0) {
      setStatus(t("editPanel.search.none"));
      return;
    }
    const next =
      index < 0
        ? step > 0
          ? 0
          : found.length - 1
        : (index + step + found.length) % found.length;
    const field = found[next];
    const context = cardTitle(field.el);
    setIndex(next);
    setStatus(
      t("editPanel.search.found", {
        field: context ? `${field.name} (${context})` : field.name,
        index: next + 1,
        count: found.length,
      }),
    );
    revealField(field);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      go(event.shiftKey ? -1 : 1);
    } else if (event.key === "Escape" && query) {
      // The panel closes on the next one
      event.preventDefault();
      change("");
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          className="pl-8"
          data-field-search
          value={query}
          placeholder={t("editPanel.search.label")}
          aria-label={t("editPanel.search.label")}
          onChange={(event) => change(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <p
        aria-live="polite"
        className="text-xs text-muted-foreground empty:hidden"
      >
        {status}
      </p>
    </div>
  );
};

export default FieldSearch;
