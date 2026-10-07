import "@/styles/shell.css";
import "@/styles/page-elements.css";
import "@/styles/charter.css";
import "@/styles/market.css";
import "@/styles/cutlines.css";
import "@/styles/footer.css";
import "@/styles/print-pages.css";
import "@/styles/charter-traincards.css";
import "@/styles/card.css";

import { describe, expect, it } from "vitest";

import Charter from "@/components/Charter";

import { games } from "@/data";

import { all, mountElement, one } from "@tests/support/render.jsx";

// Needs the print stylesheet for the layout assertions
describe("Charter with a group", () => {
  const company = games["18Test"].companies.find((c) => c.abbrev === "BRR");
  const props = {
    name: "Blue Railroad",
    color: "blue",
    tokens: [0, 40],
    trains: [],
    phases: [{ name: "2" }],
    turns: [{ name: "Ordered", steps: ["First"], ordered: true }],
  };
  const loans = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const size = ".charter, .charter__body { height: 4.75in; width: 7.5in; }";
  const mount = (extra) =>
    mountElement(
      <>
        <style>{size}</style>
        <Charter {...props} company={{ ...company, loans, ...extra }} />
      </>,
    );

  it("lays out the loans like a charter without a group", async () => {
    const plain = await mount({ group: undefined });
    const grouped = await mount({ group: "blue" });
    // Relative to the charter, the second one is lower on the page
    const rects = (root) => {
      const origin = one(root, ".charter").getBoundingClientRect();
      return all(root, ".charter__loans svg").map((s) => {
        const r = s.getBoundingClientRect();
        return [r.left - origin.left, r.top - origin.top, r.width, r.height];
      });
    };
    expect(rects(grouped.root)).toEqual(rects(plain.root));
    expect(
      one(grouped.root, ".charter__loans").getBoundingClientRect().height,
    ).toBe(one(plain.root, ".charter__loans").getBoundingClientRect().height);
  });

  it("keeps the mark in the header, clear of the tokens and the name", async () => {
    const { root } = await mount({ group: "blue" });
    const mark = one(root, ".charter__group").getBoundingClientRect();
    const header = one(root, ".charter__name").getBoundingClientRect();
    const tokens = one(root, ".charter__tokens svg").getBoundingClientRect();
    expect(mark.bottom).toBeLessThanOrEqual(header.bottom);
    expect(mark.right).toBeLessThanOrEqual(tokens.left + 0.5);
    const text = one(root, ".charter__name > div").getBoundingClientRect();
    expect(text.right).toBeLessThanOrEqual(mark.left + 0.5);
  });
});
