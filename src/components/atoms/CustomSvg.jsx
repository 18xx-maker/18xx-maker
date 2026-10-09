import { createElement, useId, useMemo } from "react";

import { sanitizeSvg } from "@/util/svgSanitize";

const camel = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// Ids of one use get a prefix, so the same image twice on a page (or an image
// and the page) never share an id; references to them follow
const prefixRefs = (value, prefix) =>
  value.replace(/url\((['"]?)#([^)'"]*)\1\)/gi, `url($1#${prefix}$2$1)`);

const toProps = (attrs, prefix) => {
  const props = {};
  for (const [name, value] of Object.entries(attrs)) {
    if (name === "id") {
      props.id = prefix + value;
    } else if (name === "class") {
      props.className = value;
    } else if (name === "href") {
      props.href = `#${prefix}${value.slice(1)}`;
    } else if (name === "style") {
      props.style = Object.fromEntries(
        Object.entries(value).map(([key, v]) => [key, prefixRefs(v, prefix)]),
      );
    } else {
      props[camel(name)] = prefixRefs(value, prefix);
    }
  }
  return props;
};

const build = (node, prefix, key) =>
  typeof node === "string"
    ? node
    : createElement(
        node.tag,
        { ...toProps(node.attrs, prefix), key },
        ...node.children.map((child, i) => build(child, prefix, i)),
      );

// A custom image (an icon or a logo of a game) as a nested svg, used like the
// components of the built-in images: width, height, x, y, className and the
// like are props. The classes `color-*` of the image still follow the theme.
// The text is sanitized (util/svgSanitize) and React elements are built from
// the result, so nothing of the text reaches the page as markup.
const CustomSvg = ({ svg, className, ...props }) => {
  const id = useId();
  const prefix = `c${id.replace(/[^A-Za-z0-9]/g, "")}-`;
  const tree = sanitizeSvg(svg);
  const children = useMemo(
    () => tree?.children.map((child, i) => build(child, prefix, i)),
    [tree, prefix],
  );
  if (!tree) return null;

  const root = toProps(tree.attrs, prefix);
  // Sized by the caller; without a viewBox the image is as large as it says
  if (
    !root.viewBox &&
    /^[\d.]+$/.test(tree.attrs.width ?? "") &&
    /^[\d.]+$/.test(tree.attrs.height ?? "")
  ) {
    root.viewBox = `0 0 ${tree.attrs.width} ${tree.attrs.height}`;
  }
  delete root.width;
  delete root.height;
  delete root.id;
  const classes = [root.className, className].filter(Boolean).join(" ");

  return createElement(
    "svg",
    { ...root, ...props, ...(classes && { className: classes }) },
    children,
  );
};

export default CustomSvg;
