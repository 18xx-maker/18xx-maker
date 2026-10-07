import { describe, expect, it } from "vitest";

import Phase from "@/components/Phase";
import Cards from "@/components/cards";
import Title from "@/components/map/Title";

import { games } from "@/data";

import {
  all,
  drawSvg,
  mountElement,
  one,
  withInfo,
} from "@tests/support/render.jsx";

// A field that was renamed keeps working under its old name, renders the same
// as the new name, and the new name wins when a game has both.

const sizes = async (info) => {
  const svg = await drawSvg(<Title game={withInfo(info)} hexWidth={150} />);
  return all(svg, "text").map((t) => t.getAttribute("font-size"));
};

describe("renamed info font sizes", () => {
  it.each([
    ["titleSize", "titleFontSize", 0],
    ["subtitleSize", "subtitleFontSize", 1],
    ["designerSize", "designerFontSize", 2],
  ])("%s renders the same as %s", async (old, current, index) => {
    const base = { subtitle: "Sub", designer: "Des" };
    const viaOld = await sizes({ ...base, [old]: 77 });
    const viaNew = await sizes({ ...base, [current]: 77 });
    expect(viaOld).toEqual(viaNew);
    expect(viaNew[index]).toBe("77");
    expect(viaNew[(index + 1) % 3]).not.toBe("77");
  });

  it.each([
    ["titleSize", "titleFontSize", 0],
    ["subtitleSize", "subtitleFontSize", 1],
    ["designerSize", "designerFontSize", 2],
  ])("%s loses to %s when both are set", async (old, current, index) => {
    const base = { subtitle: "Sub", designer: "Des" };
    const both = await sizes({ ...base, [old]: 55, [current]: 66 });
    expect(both[index]).toBe("66");
  });

  it.each([
    ["titleSize", "titleFontSize", 0],
    ["subtitleSize", "subtitleFontSize", 1],
    ["designerSize", "designerFontSize", 2],
  ])("%s and %s accept 0", async (old, current, index) => {
    const base = { subtitle: "Sub", designer: "Des" };
    expect((await sizes({ ...base, [current]: 0 }))[index]).toBe("0");
    expect((await sizes({ ...base, [old]: 0 }))[index]).toBe("0");
    // A 0 of the new name does not fall through to the old name
    expect((await sizes({ ...base, [old]: 9, [current]: 0 }))[index]).toBe("0");
  });
});

const notes = async (phase) => {
  const { root } = await mountElement(
    <Phase
      minor={false}
      trains={[{ name: "2", price: 80, quantity: 6 }]}
      phases={[
        { name: "2", ...phase },
        { name: "3", notes: "Other" },
      ]}
    />,
  );
  return one(root, "tbody tr td.phase__notes").textContent;
};

describe("renamed phase fields", () => {
  it.each([
    ["buy_companies", "buyCompanies", "Private companies may be purchased."],
    ["close_companies", "closeCompanies", "Private companies close."],
    ["remove_tokens", "removeTokens", "Private tokens removed."],
  ])("%s renders the same as %s", async (old, current, note) => {
    const events = old !== "buy_companies";
    const make = (key, value) =>
      events ? { events: { [key]: value } } : { [key]: value };
    const viaOld = await notes(make(old, true));
    expect(viaOld).toBe(note);
    expect(await notes(make(current, true))).toBe(viaOld);
    // The new name wins, a false does not fall through to the old name
    expect(
      await notes(
        events
          ? { events: { [old]: true, [current]: false } }
          : { [old]: true, [current]: false },
      ),
    ).toBe("");
    expect(
      await notes(
        events
          ? { events: { [old]: false, [current]: true } }
          : { [old]: false, [current]: true },
      ),
    ).toBe(note);
  });
});

describe("renamed train field", () => {
  const quantities = async (train) => {
    const { root } = await mountElement(
      <Phase
        minor={false}
        trains={[{ name: "2", price: 80, ...train }]}
        phases={[{ name: "2" }]}
      />,
    );
    return all(one(root, "tbody tr"), "td").map((td) => td.textContent);
  };

  it("quantity_label renders the same as quantityLabel", async () => {
    expect(await quantities({ quantity: 6, quantity_label: "5+" })).toContain(
      "5+",
    );
    expect(await quantities({ quantity: 6, quantityLabel: "5+" })).toContain(
      "5+",
    );
    expect(await quantities({ quantity: 6 })).toContain("6");
  });

  it("quantityLabel wins over quantity_label", async () => {
    const train = { quantity: 6, quantity_label: "old", quantityLabel: "new" };
    const cells = await quantities(train);
    expect(cells).toContain("new");
    expect(cells).not.toContain("old");
  });
});

describe("renamed number cards", () => {
  const numbers = async (fields) => {
    const { root } = await mountElement(
      <Cards hidePrivates hideShares hideTrains />,
      { game: { ...games["18Test"], ...fields } },
    );
    return all(root, ".number").map((card) => card.style.backgroundColor);
  };

  it("number_cards renders the same as numberCards", async () => {
    const viaNew = await numbers({ numberCards: ["red", "blue"] });
    expect(viaNew.length).toBeGreaterThan(0);
    expect(await numbers({ number_cards: ["red", "blue"] })).toEqual(viaNew);
    expect(new Set(viaNew).size).toBe(2);
  });

  it("numberCards wins over number_cards, even when it is empty", async () => {
    const one = await numbers({ numberCards: ["red"] });
    expect(
      await numbers({ numberCards: ["red"], number_cards: ["red", "blue"] }),
    ).toEqual(one);
    expect(
      await numbers({ numberCards: [], number_cards: ["red", "blue"] }),
    ).toEqual([]);
  });
});
