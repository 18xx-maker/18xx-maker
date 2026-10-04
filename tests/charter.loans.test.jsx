import "@/styles/root.css";

import { describe, expect, it } from "vitest";

import Charter from "@/components/Charter";

import { games } from "@/data";

import { all, mountElement, one } from "@tests/coverage.render.jsx";

// Needs the print stylesheet, which would change the layout assertions of the
// other charter tests, so it lives in its own file.
describe("Charter loans layout", () => {
  const company = games["18Test"].companies.find((c) => c.abbrev === "BRR");
  const props = {
    name: "Blue Railroad",
    color: "blue",
    tokens: [0, 40],
    company,
    trains: [],
    phases: [{ name: "2" }],
    turns: [{ name: "Ordered", steps: ["First"], ordered: true }],
  };

  it.each([false, true])(
    "keeps loan labels inside the loan box (half width %s)",
    async (halfWidth) => {
      const loans = [10, 20, 30, 40, 50, 60, 70, 80];
      const { root } = await mountElement(
        <Charter
          {...props}
          company={{ ...company, loans }}
          halfWidth={halfWidth}
        />,
      );
      const box = one(root, ".charter__loans").getBoundingClientRect();
      const texts = all(root, ".charter__loans text");
      expect(texts).toHaveLength(loans.length);
      // The first two columns are visible, the rest is cut off
      const visible = texts.filter(
        (t) => t.getBoundingClientRect().left < box.right,
      );
      expect(visible.length).toBeGreaterThan(0);
      for (const t of visible) {
        const r = t.getBoundingClientRect();
        expect(r.left).toBeGreaterThanOrEqual(box.left - 0.5);
        expect(r.right).toBeLessThanOrEqual(box.right + 0.5);
      }
    },
  );
  it("fits the ten loans of the gray 18Test charter on a full charter", async () => {
    const gray = games["18Test"].companies.find((c) => c.abbrev === "GRRR");
    const { root } = await mountElement(
      <>
        <style>
          {".charter, .charter__body { height: 4.75in; width: 7.5in; }"}
        </style>
        <Charter {...props} company={gray} />
      </>,
    );
    const box = one(root, ".charter__loans").getBoundingClientRect();
    const spots = all(root, ".charter__loans svg");
    expect(spots).toHaveLength(10);
    for (const s of spots) {
      const r = s.getBoundingClientRect();
      expect(r.bottom).toBeLessThanOrEqual(box.bottom + 0.5);
      expect(r.right).toBeLessThanOrEqual(box.right + 0.5);
    }
  });
});
