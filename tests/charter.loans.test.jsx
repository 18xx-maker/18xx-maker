import "@/styles/root.css";

import { describe, expect, it } from "vitest";

import Charter from "@/components/Charter";

import { games } from "@/data";

import { all, mountElement, one } from "@tests/support/render.jsx";

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
      // (the first loan is on the right, so the cut off ones are on the left)
      const visible = texts.filter(
        (t) => t.getBoundingClientRect().left >= box.left - 0.5,
      );
      expect(visible.length).toBeGreaterThan(0);
      for (const t of visible) {
        const r = t.getBoundingClientRect();
        expect(r.left).toBeGreaterThanOrEqual(box.left - 0.5);
        expect(r.right).toBeLessThanOrEqual(box.right + 0.5);
      }
    },
  );
  it("fills the loans top to bottom, starting in the right column", async () => {
    const { root } = await mountElement(
      <>
        <style>
          {".charter, .charter__body { height: 4.75in; width: 7.5in; }"}
        </style>
        <Charter
          {...props}
          company={{ ...company, loans: [10, 20, 30, 40, 50, 60, 70, 80] }}
        />
      </>,
    );
    const spots = all(root, ".charter__loans svg").map((s) =>
      s.getBoundingClientRect(),
    );
    expect(spots[1].top).toBeGreaterThan(spots[0].top);
    expect(spots[1].left).toBe(spots[0].left);
    const next = spots.find(
      (r) => r.left !== spots[0].left && r.top <= spots[0].top + 0.5,
    );
    expect(next.right).toBeLessThanOrEqual(spots[0].left + 0.5);
  });
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

describe("Charter tokens below the name", () => {
  const company = games["18Test"].companies.find((c) => c.abbrev === "LRR");
  const props = {
    name: "Lime Railroad",
    color: "lime",
    tokens: company.tokens,
    company,
    trains: [],
    phases: [{ name: "2" }],
    turns: [],
  };

  it("puts the tokens under the name, inside the charter", async () => {
    const { root } = await mountElement(
      <>
        <style>
          {".charter, .charter__body { height: 4.75in; width: 3.75in; }"}
        </style>
        <Charter {...props} />
      </>,
    );
    const name = one(root, ".charter__name").getBoundingClientRect();
    const tokens = one(root, ".charter__tokens").getBoundingClientRect();
    const charter = one(root, ".charter").getBoundingClientRect();
    const spots = all(root, ".charter__tokens svg").map((s) =>
      s.getBoundingClientRect(),
    );
    expect(spots).toHaveLength(11);
    expect(name.width).toBeCloseTo(charter.width, 0);
    for (const s of spots) {
      expect(s.right).toBeLessThanOrEqual(charter.right + 0.5);
      expect(s.bottom).toBeLessThanOrEqual(name.bottom + 0.5);
      expect(s.top).toBeGreaterThanOrEqual(tokens.top - 0.5);
    }
    expect(one(root, ".charter__tokens").className).toContain(
      "charter__tokens--below",
    );
  });

  it("ignores the setting on half width charters", async () => {
    const { root } = await mountElement(<Charter {...props} halfWidth />);
    expect(one(root, ".charter__tokens").className).not.toContain("--below");
  });

  it("leaves other companies alone", async () => {
    const { root } = await mountElement(
      <Charter {...props} company={{ ...company, tokensBelow: false }} />,
    );
    expect(one(root, ".charter__tokens").className).not.toContain("--below");
    expect(one(root, ".charter__name").className).not.toContain("tokens-below");
  });
});

describe("Charter tokens below the name layout", () => {
  const company = games["18Test"].companies.find((c) => c.abbrev === "LRR");
  it.each([false, true])(
    "keeps the name above the token row (minor %s)",
    async (minor) => {
      const { root } = await mountElement(
        <>
          <style>
            {".charter, .charter__body { height: 4.75in; width: 3.75in; }"}
          </style>
          <Charter
            name="Lime Railroad"
            color="lime"
            tokens={company.tokens}
            company={{ ...company, minor }}
            minor={minor}
            trains={[]}
            phases={[{ name: "2" }]}
            turns={[]}
          />
        </>,
      );
      const text = one(root, ".charter__name > div").getBoundingClientRect();
      const row = one(root, ".charter__tokens").getBoundingClientRect();
      expect(text.bottom).toBeLessThanOrEqual(row.top + 0.5);
    },
  );
});
