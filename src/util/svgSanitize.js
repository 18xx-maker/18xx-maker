// Allowlist sanitizer for the SVG of custom images (src/util/assetNames.js).
//
// The text is parsed with DOMParser (a browser, so not in Node) and the DOM is
// walked into a plain tree { tag, attrs, children }. Only the elements and
// attributes below survive, and nothing is ever serialized back to a string:
// CustomSvg builds React elements from the tree, so there is no markup
// round-trip that could mutate into something else (mXSS).
//
// Dropped: script, foreignObject, animation (animate, set, animateMotion,
// animateTransform), a, image, style elements, filters, anything outside the
// SVG namespace, on* attributes, hrefs that are not a "#id" of the same
// document, urls that are not "#id", DOCTYPE and entities.

const SVG_NS = "http://www.w3.org/2000/svg";

const ELEMENTS = new Set([
  "svg",
  "g",
  "path",
  "circle",
  "ellipse",
  "rect",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "defs",
  "clipPath",
  "mask",
  "linearGradient",
  "radialGradient",
  "stop",
  "pattern",
  "symbol",
  "marker",
  "use",
]);

const ATTRIBUTES = new Set([
  "class",
  "clip-path",
  "clip-rule",
  "clipPathUnits",
  "color",
  "cx",
  "cy",
  "d",
  "display",
  "dominant-baseline",
  "dx",
  "dy",
  "fill",
  "fill-opacity",
  "fill-rule",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "fx",
  "fy",
  "gradientTransform",
  "gradientUnits",
  "height",
  "href",
  "id",
  "marker-end",
  "marker-mid",
  "marker-start",
  "markerHeight",
  "markerUnits",
  "markerWidth",
  "mask",
  "maskContentUnits",
  "maskUnits",
  "offset",
  "opacity",
  "orient",
  "patternContentUnits",
  "patternTransform",
  "patternUnits",
  "points",
  "preserveAspectRatio",
  "r",
  "refX",
  "refY",
  "rx",
  "ry",
  "spreadMethod",
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "style",
  "text-anchor",
  "transform",
  "vector-effect",
  "viewBox",
  "visibility",
  "width",
  "x",
  "x1",
  "x2",
  "xlink:href",
  "y",
  "y1",
  "y2",
]);

// The properties a style attribute may set: the presentation attributes
const STYLE_PROPERTIES = new Set(
  [...ATTRIBUTES].filter(
    (name) =>
      !/^(class|id|style|href|xlink:href|d|points|transform|viewBox|preserveAspectRatio)$/.test(
        name,
      ) && name === name.toLowerCase(),
  ),
);

const MAX_NODES = 5000;
const MAX_DEPTH = 32;
const MAX_USES = 100;
const MAX_VALUE = 200000;
const ID = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
const CLASS = /^(icon-)?color-[A-Za-z0-9_-]+$/;

// A value is safe when every url() in it points at an id of the document and
// it carries none of the scripting or import forms
export const safeValue = (value) => {
  if (typeof value !== "string" || value.length > MAX_VALUE) return false;
  // Control characters and whitespace can hide a scheme ("java\nscript:")
  const squashed = Array.from(value)
    .filter((c) => c.charCodeAt(0) > 0x20 && !/[\x7f-\x9f]/.test(c))
    .join("");
  if (
    /javascript:|vbscript:|data:|expression\(|@import|<|\\|\/\*/i.test(squashed)
  )
    return false;
  const urls = value.match(/url\(([^)]*)\)/gi) ?? [];
  return urls.every((url) =>
    /^url\(\s*(['"]?)#[A-Za-z_][\w.-]*\1\s*\)$/i.test(url),
  );
};

const camel = (property) =>
  property.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const parseStyle = (text) => {
  const style = {};
  for (const declaration of text.split(";")) {
    const at = declaration.indexOf(":");
    if (at < 0) continue;
    const property = declaration.slice(0, at).trim().toLowerCase();
    const value = declaration.slice(at + 1).trim();
    if (STYLE_PROPERTIES.has(property) && safeValue(value)) {
      style[camel(property)] = value;
    }
  }
  return Object.keys(style).length ? style : undefined;
};

const cleanAttributes = (element) => {
  const attrs = {};
  for (const { name, value } of Array.from(element.attributes)) {
    if (!ATTRIBUTES.has(name)) continue;
    // A style is checked declaration by declaration
    if (name === "style") {
      const style = parseStyle(value);
      if (style) attrs.style = style;
      continue;
    }
    if (!safeValue(value)) continue;
    if (name === "id") {
      if (ID.test(value)) attrs.id = value;
    } else if (name === "class") {
      const classes = value
        .split(/\s+/)
        .filter((token) => CLASS.test(token))
        .join(" ");
      if (classes) attrs.class = classes;
    } else if (name === "href" || name === "xlink:href") {
      // Only a reference to an element of the same file
      if (element.localName === "use" && /^#[A-Za-z_][\w.-]*$/.test(value)) {
        attrs.href = value;
      }
    } else {
      attrs[name] = value;
    }
  }
  return attrs;
};

const walk = (element, state, depth) => {
  if (
    element.namespaceURI !== SVG_NS ||
    !ELEMENTS.has(element.localName) ||
    depth > MAX_DEPTH ||
    ++state.nodes > MAX_NODES
  ) {
    return null;
  }

  const tag = element.localName;
  const attrs = cleanAttributes(element);

  if (tag === "use") {
    // A use that points nowhere, or at another use (which could expand
    // exponentially), is dropped
    const target = attrs.href && state.ids.get(attrs.href.slice(1));
    if (
      !target ||
      target.localName === "use" ||
      target.querySelector("use") ||
      ++state.uses > MAX_USES
    ) {
      return null;
    }
  }

  const children = [];
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === 1) {
      const node = walk(child, state, depth + 1);
      if (node) children.push(node);
    } else if (
      (child.nodeType === 3 || child.nodeType === 4) &&
      (tag === "text" || tag === "tspan")
    ) {
      if (child.nodeValue) children.push(child.nodeValue);
    }
  }
  return { tag, attrs, children };
};

const CACHE_SIZE = 500;
const cache = new Map();

// The sanitized tree of an SVG text, or null when it is not an SVG document
// or has nothing left. Trees are shared for the same text.
export const sanitizeSvg = (text) => {
  if (typeof text !== "string") return null;
  if (cache.has(text)) return cache.get(text);

  const tree = parse(text);
  if (cache.size >= CACHE_SIZE) cache.delete(cache.keys().next().value);
  cache.set(text, tree);
  return tree;
};

const parse = (text) => {
  if (text.length > MAX_VALUE * 4) return null;
  // A DOCTYPE without an internal subset is common in exported files; any
  // other DOCTYPE or an entity declaration is refused
  const declared = text.replace(/<!DOCTYPE[^>[]*>/gi, "");
  if (/<!(DOCTYPE|ENTITY)/i.test(declared)) return null;

  // Files made by hand often lack the namespace, which a browser needs to
  // tell an svg from any other xml
  const source = declared.replace(/<svg\b[^>]*>/, (tag) =>
    /\sxmlns\s*=/.test(tag)
      ? tag
      : tag.replace(/^<svg/, `<svg xmlns="${SVG_NS}"`),
  );

  let doc;
  try {
    doc = new DOMParser().parseFromString(source, "image/svg+xml");
  } catch {
    return null;
  }
  const root = doc.documentElement;
  if (
    !root ||
    root.namespaceURI !== SVG_NS ||
    root.localName !== "svg" ||
    doc.getElementsByTagName("parsererror").length
  ) {
    return null;
  }

  const ids = new Map();
  for (const element of Array.from(root.querySelectorAll("[id]"))) {
    if (!ids.has(element.id)) ids.set(element.id, element);
  }
  const tree = walk(root, { nodes: 0, uses: 0, ids }, 0);
  return tree && tree.children.length ? tree : null;
};
