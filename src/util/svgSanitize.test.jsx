import { sanitizeSvg } from "@/util/svgSanitize";

const svg = (body, attrs = 'viewBox="0 0 10 10"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${attrs}>${body}</svg>`;

// Every tag and attribute of a sanitized tree
const flatten = (node) =>
  typeof node === "string"
    ? []
    : [node, ...node.children.flatMap((child) => flatten(child))];
const tags = (tree) => flatten(tree).map((node) => node.tag);
const attrsOf = (tree) =>
  flatten(tree).flatMap((node) => Object.entries(node.attrs));
const find = (tree, tag) => flatten(tree).find((node) => node.tag === tag);

describe("sanitizeSvg", () => {
  it("keeps shapes, groups and the color classes", () => {
    const tree = sanitizeSvg(
      svg(
        '<g class="color-main"><path d="M0 0h5" fill="#f00" stroke-width="2"/><circle cx="1" cy="1" r="1"/></g>',
      ),
    );
    expect(tags(tree)).toEqual(["svg", "g", "path", "circle"]);
    expect(find(tree, "g").attrs.class).toBe("color-main");
    expect(find(tree, "path").attrs).toEqual({
      d: "M0 0h5",
      fill: "#f00",
      "stroke-width": "2",
    });
    expect(tree.attrs.viewBox).toBe("0 0 10 10");
  });

  it("returns the same tree for the same text", () => {
    const text = svg('<path d="M0 0"/>');
    expect(sanitizeSvg(text)).toBe(sanitizeSvg(text));
  });

  it("drops script, foreignObject, animation, links, images and style elements", () => {
    const tree = sanitizeSvg(
      svg(
        [
          "<script>alert(1)</script>",
          "<foreignObject><div xmlns='http://www.w3.org/1999/xhtml'>x</div></foreignObject>",
          '<animate attributeName="href" to="javascript:alert(1)"/>',
          '<set attributeName="href" to="javascript:alert(1)"/>',
          '<animateMotion path="M0 0"/>',
          '<animateTransform attributeName="transform"/>',
          '<a href="https://example.com"><path d="M0 0"/></a>',
          '<image href="https://example.com/x.png"/>',
          "<style>path{fill:url(https://example.com/x)}</style>",
          '<filter id="f"><feGaussianBlur/></filter>',
          '<path d="M1 1"/>',
        ].join(""),
      ),
    );
    expect(tags(tree)).toEqual(["svg", "path"]);
  });

  it("drops elements of other namespaces", () => {
    const tree = sanitizeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:x="http://www.w3.org/1999/xhtml"><x:script>alert(1)</x:script><x:div/><path d="M0 0"/></svg>`,
    );
    expect(tags(tree)).toEqual(["svg", "path"]);
  });

  it("drops event handlers and attributes it does not know", () => {
    const tree = sanitizeSvg(
      svg(
        '<path d="M0 0" onclick="alert(1)" onload="x()" data-x="1" xml:space="preserve" pathLength="3"/>',
        'viewBox="0 0 1 1" onload="alert(1)"',
      ),
    );
    expect(find(tree, "path").attrs).toEqual({ d: "M0 0" });
    expect(tree.attrs).toEqual({ viewBox: "0 0 1 1" });
  });

  it("drops script urls however they are written", () => {
    const evil = [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "java&#x09;script:alert(1)",
      "java&#10;script:alert(1)",
      "&#106;avascript:alert(1)",
      "  javascript:alert(1)",
      "data:text/html,alert(1)",
    ];
    for (const value of evil) {
      const tree = sanitizeSvg(
        svg(`<path d="M0 0" fill="${value}" stroke="${value}"/>`),
      );
      expect(find(tree, "path").attrs).toEqual({ d: "M0 0" });
    }
  });

  it("only allows url() to an id of the file", () => {
    const tree = sanitizeSvg(
      svg(
        `<defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient></defs>
         <path d="M0 0" fill="url(#g)"/>
         <path d="M1 1" fill="url(https://example.com/x.svg#g)"/>
         <path d="M2 2" fill="url('http://example.com')"/>
         <path d="M3 3" style="fill:url(//example.com/x)"/>`,
      ),
    );
    const paths = flatten(tree).filter((node) => node.tag === "path");
    expect(paths.map((node) => node.attrs.fill)).toEqual([
      "url(#g)",
      undefined,
      undefined,
      undefined,
    ]);
    expect(paths[3].attrs.style).toBeUndefined();
  });

  it("keeps only presentation properties of a style attribute", () => {
    const tree = sanitizeSvg(
      svg(
        `<path d="M0 0" style="fill: #f00; stroke-width:2; position:fixed; behavior:url(x.htc); background:url(http://e.com/x); fill-opacity:\\31"/>`,
      ),
    );
    expect(find(tree, "path").attrs.style).toEqual({
      fill: "#f00",
      strokeWidth: "2",
    });
  });

  it("refuses @import and expression() and css escapes in styles", () => {
    const tree = sanitizeSvg(
      svg(
        `<path d="M0 0" style="fill:red;stroke:expression(alert(1))" fill="@import 'x'"/>`,
      ),
    );
    expect(find(tree, "path").attrs.style).toEqual({ fill: "red" });
    expect(find(tree, "path").attrs.fill).toBeUndefined();
  });

  it("keeps only the color classes", () => {
    const tree = sanitizeSvg(
      svg(
        '<g class="color-main fixed inset-0 icon-color-main-red cls-1"><path d="M0 0"/></g>',
      ),
    );
    expect(find(tree, "g").attrs.class).toBe("color-main icon-color-main-red");
    const none = sanitizeSvg(svg('<g class="fixed"><path d="M0 0"/></g>'));
    expect(find(none, "g").attrs.class).toBeUndefined();
  });

  it("keeps a use of an id of the file and drops every other use", () => {
    const tree = sanitizeSvg(
      svg(
        `<defs><path id="p" d="M0 0h1"/></defs>
         <use href="#p"/>
         <use xlink:href="#p" x="2"/>
         <use href="https://example.com/x.svg#p"/>
         <use href="data:image/svg+xml,&lt;svg/&gt;"/>
         <use href="#missing"/>
         <use/>`,
      ),
    );
    const uses = flatten(tree).filter((node) => node.tag === "use");
    expect(uses.map((node) => node.attrs.href)).toEqual(["#p", "#p"]);
  });

  it("does not let a use point at a use or at a group with one", () => {
    const tree = sanitizeSvg(
      svg(
        `<defs><path id="p" d="M0 0"/><g id="g"><use href="#p"/></g></defs>
         <use id="u" href="#p"/><use href="#u"/><use href="#g"/>`,
      ),
    );
    const uses = flatten(tree).filter((node) => node.tag === "use");
    expect(uses.map((node) => node.attrs.href)).toEqual(["#p", "#p"]);
  });

  it("is not fooled by repeated ids into nesting uses", () => {
    const tree = sanitizeSvg(
      `<svg xmlns="http://www.w3.org/2000/svg"><desc id="L1"/><desc id="L2"/><defs><rect id="L0" width="1" height="1"/><g id="L1"><use href="#L0"/><use href="#L0"/><use href="#L0"/></g><g id="L2"><use href="#L1"/><use href="#L1"/><use href="#L1"/></g></defs><use href="#L2"/></svg>`,
    );
    const nodes = flatten(tree);
    const uses = nodes.filter((node) => node.tag === "use");
    for (const use of uses) {
      const target = nodes.find(
        (node) => node.attrs.id === use.attrs.href.slice(1),
      );
      expect(flatten(target).filter((node) => node.tag === "use")).toEqual([]);
    }
    expect(uses.map((node) => node.attrs.href)).not.toContain("#L2");
  });

  it("keeps an id once", () => {
    const tree = sanitizeSvg(
      svg(
        '<rect id="a" width="1" height="1"/><rect id="a" width="2" height="2"/>',
      ),
    );
    expect(flatten(tree).filter((node) => node.attrs.id === "a")).toHaveLength(
      1,
    );
  });

  it("refuses a DOCTYPE with an internal subset and entity declarations", () => {
    expect(
      sanitizeSvg(
        `<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY a "aaaa"><!ENTITY b "&a;&a;">]><svg xmlns="http://www.w3.org/2000/svg"><text>&b;</text></svg>`,
      ),
    ).toBeNull();
    expect(
      sanitizeSvg(
        `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>`,
      ),
    ).not.toBeNull();
  });

  it("keeps text as text and drops CDATA and comment payloads", () => {
    const tree = sanitizeSvg(
      svg(
        `<text x="1">a &lt;b&gt;<![CDATA[</style><script>alert(1)</script>]]></text><!-- <script>alert(2)</script> --><?pi x?>`,
      ),
    );
    const text = find(tree, "text");
    // The payload is only ever a string child, which React escapes
    expect(text.children.join("")).toBe(
      "a <b></style><script>alert(1)</script>",
    );
    expect(tags(tree)).toEqual(["svg", "text"]);
  });

  it("refuses what is not an svg document", () => {
    expect(sanitizeSvg("")).toBeNull();
    expect(sanitizeSvg("not xml")).toBeNull();
    expect(sanitizeSvg("<svg")).toBeNull();
    expect(
      sanitizeSvg('<html xmlns="http://www.w3.org/1999/xhtml"/>'),
    ).toBeNull();
    expect(sanitizeSvg('<svg xmlns="http://example.com/other"/>')).toBeNull();
    expect(sanitizeSvg(undefined)).toBeNull();
    // Nothing left to draw
    expect(sanitizeSvg(svg("<script>alert(1)</script>"))).toBeNull();
  });

  it("limits the depth and the number of elements", () => {
    const deep = svg(`${"<g>".repeat(40)}<path d="M0 0"/>${"</g>".repeat(40)}`);
    expect(
      tags(sanitizeSvg(deep) ?? { tag: "", children: [], attrs: {} }),
    ).not.toContain("path");
    const wide = svg('<path d="M0 0"/>'.repeat(6000));
    expect(flatten(sanitizeSvg(wide)).length).toBeLessThanOrEqual(5001);
  });

  it("keeps an id that is a plain name and drops one that is not", () => {
    const tree = sanitizeSvg(
      svg(
        '<path id="ok-1" d="M0 0"/><path id="1bad" d="M1 1"/><path id="a b" d="M2 2"/>',
      ),
    );
    expect(attrsOf(tree).filter(([name]) => name === "id")).toEqual([
      ["id", "ok-1"],
    ]);
  });
});
