// Gives every markdown heading a stable id (the slug of its text, numbered
// when a page repeats a heading) so a docs page can link to a section.

const text = (node) =>
  node.type === "text" ? node.value : (node.children || []).map(text).join("");

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");

const headings = /^h[1-6]$/;

// A rehype plugin: ids are set on the tree, so the heading components only
// have to render them.
const rehypeHeadingIds = () => (tree) => {
  const seen = {};
  const walk = (node) => {
    if (node.type === "element" && headings.test(node.tagName)) {
      const base = slugify(text(node)) || "section";
      const count = seen[base] || 0;
      seen[base] = count + 1;
      node.properties = {
        ...node.properties,
        id: count ? `${base}-${count}` : base,
      };
    }
    (node.children || []).forEach(walk);
  };
  walk(tree);
};

export default rehypeHeadingIds;
