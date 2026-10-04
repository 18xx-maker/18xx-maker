// The svg of a document of the page, as a standalone file for vector graphics
// software (Inkscape, Illustrator). The page styles its svgs with css classes
// and a style element that do not exist outside of it, so the svg is copied
// with the presentation properties that apply to each element (fill, stroke,
// fonts, ...) written as attributes.
// Plain JS: no Node APIs. serializeSvg runs inside the page, so it must stay
// one function that uses nothing from outside of it.

// The real font family of each alias the page defines in styles/fonts.css
// (its @font-face local() names), and the generic family that follows it
export const FONT_ALIASES = {
  display: { family: "Bitter", generic: "serif" },
  serif: { family: "Yrsa", generic: "serif" },
  "sans-serif": { family: "Lato", generic: "sans-serif" },
};

// The expression the capture evaluates in the page for the element of a
// selector. It is { text } with the svg file, or { error } with a reason the
// element can not be one.
export const svgExpression = (selector) =>
  `(${serializeSvg.toString()})(${JSON.stringify(selector)}, ${JSON.stringify(FONT_ALIASES)})`;

// Runs in the page. The element is an svg or has svgs inside: the first
// (outermost) one is the file, several (a token has one for each side and
// size) are placed side by side in an svg of the element's size.
export function serializeSvg(selector, aliases) {
  const SVG = "http://www.w3.org/2000/svg";
  const XLINK = "http://www.w3.org/1999/xlink";
  const XMLNS = "http://www.w3.org/2000/xmlns/";

  // The presentation properties copied from the computed style, with their
  // default. An inherited one is only written where it differs from the parent
  // (or the element has the attribute, which the style may override).
  const INHERITED = {
    fill: "rgb(0, 0, 0)",
    "fill-opacity": "1",
    "fill-rule": "nonzero",
    "clip-rule": "nonzero",
    stroke: "none",
    "stroke-width": "1px",
    "stroke-opacity": "1",
    "stroke-linecap": "butt",
    "stroke-linejoin": "miter",
    "stroke-miterlimit": "4",
    "stroke-dasharray": "none",
    "stroke-dashoffset": "0px",
    "font-family": null,
    "font-size": null,
    "font-weight": "400",
    "font-style": "normal",
    "letter-spacing": "normal",
    "text-anchor": "start",
    visibility: "visible",
    "paint-order": "normal",
    "shape-rendering": "auto",
  };
  const OWN = {
    opacity: "1",
    "dominant-baseline": "auto",
    "alignment-baseline": "auto",
    "stop-color": "rgb(0, 0, 0)",
    "stop-opacity": "1",
    "mix-blend-mode": "normal",
  };
  // Elements that are not drawn where they are, and have no display
  const DEFINITIONS = [
    "defs",
    "symbol",
    "clipPath",
    "mask",
    "marker",
    "pattern",
    "linearGradient",
    "radialGradient",
    "filter",
  ];
  const DROPPED = ["style", "script"];

  const element = document.querySelector(selector);
  if (!element) return { error: `The page has no ${selector}` };

  const sources = element.matches("svg")
    ? [element]
    : [...element.querySelectorAll("svg")].filter(
        (svg) => !svg.parentElement.closest("svg"),
      );
  if (sources.length === 0) return { error: `${selector} has no svg` };

  for (const source of sources) {
    if (source.querySelector("foreignObject")) {
      return {
        error: `${selector} has a foreignObject, which vector graphics software does not read`,
      };
    }
    for (const image of source.querySelectorAll("image")) {
      const href =
        image.getAttribute("href") || image.getAttribute("xlink:href");
      if (!(href || "").startsWith("data:")) {
        return { error: `${selector} has an image that is not embedded` };
      }
    }
  }

  const unquote = (name) => name.trim().replace(/^(["'])(.*)\1$/, "$2");

  // A font-family of the page with the real families in place of its aliases:
  // the alias display is the family Bitter, and a family named serif or
  // sans-serif in quotes (the generic family is not quoted) is Yrsa or Lato
  const fontFamily = (value) => {
    const names = value.split(",").map((name) => {
      const quoted = /^\s*["']/.test(name);
      const plain = unquote(name);
      const alias = aliases[plain];
      return alias && (plain === "display" || quoted)
        ? alias
        : { family: plain, generic: null, quoted };
    });
    const out = [];
    const add = (name) => {
      if (!out.includes(name)) out.push(name);
    };
    const generics = ["serif", "sans-serif", "monospace", "cursive"];
    for (const { family, generic, quoted } of names) {
      const bare = generics.includes(family) && !generic && !quoted;
      add(/^[\w-]+$/.test(family) || bare ? family : `"${family}"`);
      if (generic) add(generic);
    }
    // The family to fall back to when the fonts are not installed
    if (!out.some((name) => generics.includes(name))) out.push("serif");
    return out.join(", ");
  };

  const reference = /url\(\s*["']?#([^"')\s]+)["']?\s*\)/g;
  const px = (value) => Math.round(parseFloat(value) * 1000) / 1000;

  // The copy of an element and what is in it, the properties written as
  // attributes. root is the svg that is a file, its parent is the page
  const copy = (source, parent, root) => {
    const clone = source.cloneNode(false);
    for (const { name } of [...clone.attributes]) {
      if (
        name === "class" ||
        name === "style" ||
        name === "xmlns" ||
        name.startsWith("xmlns:") ||
        name.startsWith("data-")
      ) {
        clone.removeAttribute(name);
      }
    }

    const style = getComputedStyle(source);
    const above = parent && getComputedStyle(parent);
    const tag = source.localName;

    for (const [property, initial] of Object.entries(INHERITED)) {
      const value = style.getPropertyValue(property);
      if (!value) continue;
      const base = above ? above.getPropertyValue(property) : initial;
      if (
        clone.hasAttribute(property) ||
        value !== base ||
        (root && (property === "font-family" || property === "font-size"))
      ) {
        clone.setAttribute(
          property,
          property === "font-family"
            ? fontFamily(value)
            : value.replace(reference, "url(#$1)"),
        );
      }
    }
    for (const [property, initial] of Object.entries(OWN)) {
      const value = style.getPropertyValue(property);
      if (clone.hasAttribute(property) || (value && value !== initial)) {
        clone.setAttribute(property, value);
      }
    }
    if (style.display === "none" && !DEFINITIONS.includes(tag)) {
      clone.setAttribute("display", "none");
    }
    if (tag === "svg" && style.overflow === "visible") {
      clone.setAttribute("overflow", "visible");
    }

    for (const child of source.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        clone.append(document.createTextNode(child.textContent));
      } else if (
        child.nodeType === Node.ELEMENT_NODE &&
        !DROPPED.includes(child.localName)
      ) {
        clone.append(copy(child, source, false));
      }
    }

    // href also as xlink:href, for software that reads only the old one
    const href = source.getAttribute("href");
    if (href !== null && !source.hasAttribute("xlink:href")) {
      clone.setAttributeNS(XLINK, "xlink:href", href);
    }
    return clone;
  };

  // An svg of the page as an svg of its own: sized in pixels, which a
  // software reads as 1/96 inch like the page does
  const file = (source) => {
    const clone = copy(source, null, true);
    const style = getComputedStyle(source);
    const rect = source.getBoundingClientRect();
    clone.setAttribute("width", px(style.width) || px(rect.width));
    clone.setAttribute("height", px(style.height) || px(rect.height));
    return clone;
  };

  let root;
  if (sources.length === 1) {
    root = file(sources[0]);
  } else {
    const box = element.getBoundingClientRect();
    root = document.createElementNS(SVG, "svg");
    root.setAttribute("version", "1.1");
    root.setAttribute("width", px(box.width));
    root.setAttribute("height", px(box.height));
    root.setAttribute("viewBox", `0 0 ${px(box.width)} ${px(box.height)}`);
    for (const source of sources) {
      const clone = file(source);
      const rect = source.getBoundingClientRect();
      const style = getComputedStyle(source);
      clone.setAttribute(
        "x",
        px(rect.left - box.left + parseFloat(style.paddingLeft)),
      );
      clone.setAttribute(
        "y",
        px(rect.top - box.top + parseFloat(style.paddingTop)),
      );
      root.append(clone);
    }
  }

  // What the svg uses that is outside of it (a clip path or gradient that the
  // page defines once for all its svgs) is copied into its defs
  const ids = () =>
    new Set([...root.querySelectorAll("[id]")].map((node) => node.id));
  const used = () => {
    const found = new Set();
    for (const node of [root, ...root.querySelectorAll("*")]) {
      for (const { name, value } of node.attributes) {
        for (const match of value.matchAll(reference)) found.add(match[1]);
        if ((name === "href" || name === "xlink:href") && value[0] === "#") {
          found.add(value.slice(1));
        }
      }
    }
    return found;
  };
  let defs;
  for (let again = true; again;) {
    again = false;
    const have = ids();
    for (const id of used()) {
      const outside = !have.has(id) && document.getElementById(id);
      if (!outside) continue;
      if (!defs) {
        defs = document.createElementNS(SVG, "defs");
        root.insertBefore(defs, root.firstChild);
      }
      defs.append(copy(outside, outside.parentElement, false));
      again = true;
    }
  }

  root.setAttributeNS(XMLNS, "xmlns:xlink", XLINK);

  // Fonts of the text, to install before the file is opened
  const fonts = new Set();
  const generics = ["serif", "sans-serif", "monospace", "cursive"];
  for (const node of root.querySelectorAll("text, tspan, textPath")) {
    const family = node.closest("[font-family]")?.getAttribute("font-family");
    for (const name of (family || "").split(",")) {
      const plain = unquote(name);
      if (plain && !generics.includes(plain)) fonts.add(plain);
    }
  }
  const comment =
    fonts.size > 0
      ? `<!-- The text is text, in the fonts ${[...fonts].join(", ").replace(/--+/g, "-")}: install them to see it as designed, or convert the text to paths. -->\n`
      : "";

  return {
    text:
      '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
      comment +
      new XMLSerializer().serializeToString(root) +
      "\n",
  };
}
