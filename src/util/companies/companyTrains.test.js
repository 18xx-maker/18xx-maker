import {
  cardCompanyTrains,
  charterHalfWidth,
  companyTrains,
  referencedTrains,
} from "@/util/companies/companyTrains";

const gameTrains = [
  { name: "2", color: "yellow", price: 80, quantity: 4 },
  { name: "3", color: "green", price: 180, quantity: 3 },
];

describe("companyTrains", () => {
  it("has no trains without a list", () => {
    expect(companyTrains({}, gameTrains)).toEqual([]);
    expect(companyTrains({ trains: false }, gameTrains)).toEqual([]);
    expect(companyTrains({ trains: [] }, gameTrains)).toEqual([]);
  });

  it("copies a game train for a name, with a quantity of one", () => {
    expect(companyTrains({ trains: ["3"] }, gameTrains)).toEqual([
      gameTrains[1],
    ]);
    expect(companyTrains({ trains: [{ name: "2" }] }, gameTrains)).toEqual([
      gameTrains[0],
    ]);
  });

  it("copies a game train for each of the quantity", () => {
    const trains = companyTrains(
      { trains: [{ name: "2", quantity: 2 }, "3"] },
      gameTrains,
    );
    expect(trains).toEqual([gameTrains[0], gameTrains[0], gameTrains[1]]);
  });

  it("skips names the game does not have", () => {
    expect(companyTrains({ trains: ["9"] }, gameTrains)).toEqual([]);
    expect(companyTrains({ trains: ["9"] })).toEqual([]);
  });

  it("uses a full train as it is, once unless told otherwise", () => {
    const own = { name: "S", color: "red", price: 50 };
    expect(companyTrains({ trains: [own] }, gameTrains)).toEqual([own]);
    expect(
      companyTrains({ trains: [{ ...own, quantity: 2 }] }, gameTrains),
    ).toHaveLength(2);
    expect(
      companyTrains(
        { trains: [{ ...own, quantity: "∞", print: 3 }] },
        gameTrains,
      ),
    ).toHaveLength(3);
    expect(
      companyTrains({ trains: [{ ...own, quantity: "∞" }] }, gameTrains),
    ).toHaveLength(1);
  });

  it("takes a full train with a name the game has as a full train", () => {
    const own = { name: "2", color: "red", price: 1 };
    expect(companyTrains({ trains: [own] }, gameTrains)).toEqual([own]);
  });
});

describe("charterHalfWidth", () => {
  it("follows the layout", () => {
    expect(charterHalfWidth({ layout: "free", halfWidth: true })).toBe(true);
    expect(charterHalfWidth({ layout: "free", halfWidth: false })).toBe(false);
    expect(charterHalfWidth({ layout: "3x1", halfWidth: true })).toBe(false);
    expect(charterHalfWidth({ layout: "3x2" }, false)).toBe(true);
    expect(charterHalfWidth({ layout: "3x1minors" }, false)).toBe(false);
    expect(charterHalfWidth({ layout: "3x1minors" }, true)).toBe(true);
  });

  it("makes only minors half width with halfWidthMinors in the free layout", () => {
    const charters = {
      layout: "free",
      halfWidth: false,
      halfWidthMinors: true,
    };
    expect(charterHalfWidth(charters, true)).toBe(true);
    expect(charterHalfWidth(charters, false)).toBe(false);
    expect(charterHalfWidth({ ...charters, halfWidth: true }, false)).toBe(
      true,
    );
    expect(charterHalfWidth({ ...charters, layout: "3x1" }, true)).toBe(false);
    expect(charterHalfWidth({ ...charters, layout: "3x1minors" }, false)).toBe(
      false,
    );
  });
});

describe("cardCompanyTrains", () => {
  const companies = [
    { abbrev: "A", trains: ["2"] },
    { abbrev: "B", minor: true, trains: ["3"] },
    { abbrev: "C" },
  ];

  it("has none when the charters show them", () => {
    const charters = {
      layout: "free",
      halfWidth: false,
      trainCards: "charter",
    };
    expect(cardCompanyTrains(companies, charters, gameTrains)).toEqual([]);
  });

  it("has all of them for cards", () => {
    const charters = { layout: "free", halfWidth: false, trainCards: "cards" };
    expect(cardCompanyTrains(companies, charters, gameTrains)).toEqual([
      gameTrains[0],
      gameTrains[1],
    ]);
  });

  it("has those of charters with no room for them", () => {
    const charters = {
      layout: "3x1minors",
      halfWidth: false,
      trainCards: "charter",
    };
    expect(cardCompanyTrains(companies, charters, gameTrains)).toEqual([
      gameTrains[1],
    ]);
    expect(cardCompanyTrains(undefined, charters)).toEqual([]);
  });
});

describe("referencedTrains", () => {
  it("has the game trains, the card trains and the named backs", () => {
    const own = { name: "own" };
    const flip = { name: "5D", price: 1000 };
    const trains = [
      { name: "4D", back: flip },
      { name: "2", back: { text: "no name" } },
      { name: "3" },
    ];
    expect(referencedTrains(trains, [own]).map((t) => t.name)).toEqual([
      "4D",
      "2",
      "3",
      "own",
      "5D",
    ]);
    expect(referencedTrains()).toEqual([]);
  });
});
