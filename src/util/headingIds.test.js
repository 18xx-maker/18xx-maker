import rehypeHeadingIds, { slugify } from "./headingIds";

const heading = (tagName, value) => ({
  type: "element",
  tagName,
  properties: {},
  children: [{ type: "text", value }],
});

describe("slugify", () => {
  it("lowercases, drops punctuation and joins words with dashes", () => {
    expect(slugify("Map Borders & Lines")).toBe("map-borders-lines");
    expect(slugify("  Which value wins? ")).toBe("which-value-wins");
  });
});

describe("rehypeHeadingIds", () => {
  it("sets an id on every heading and numbers repeats", () => {
    const tree = {
      type: "root",
      children: [
        heading("h2", "Options"),
        { type: "element", tagName: "p", properties: {}, children: [] },
        heading("h3", "Options"),
        {
          type: "element",
          tagName: "h2",
          properties: { className: ["x"] },
          children: [
            {
              type: "element",
              tagName: "code",
              properties: {},
              children: [{ type: "text", value: "--format" }],
            },
            { type: "text", value: " flag" },
          ],
        },
        heading("h2", "???"),
      ],
    };

    rehypeHeadingIds()(tree);

    const [a, p, b, c, d] = tree.children;
    expect(a.properties.id).toBe("options");
    expect(p.properties.id).toBeUndefined();
    expect(b.properties.id).toBe("options-1");
    expect(c.properties).toEqual({ className: ["x"], id: "--format-flag" });
    expect(d.properties.id).toBe("section");
  });
});
