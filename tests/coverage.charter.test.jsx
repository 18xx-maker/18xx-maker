import { within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Charter from "@/components/Charter";
import Phase from "@/components/Phase";

import { companyThemes, games, mapThemes } from "@/data";

import { all, mountElement, one } from "@tests/coverage.render.jsx";

const gmt = mapThemes.gmt.colors;
const rob = companyThemes.rob.colors;

// Computed css colors come back as rgb()
const rgb = (hex) => {
  const span = document.createElement("span");
  span.style.color = hex;
  return span.style.color;
};

const trains = [
  { name: "2", color: "yellow", price: [80, 100], quantity: 6 },
  {
    name: "3",
    color: "green",
    price: 180,
    quantity_label: "5+",
    rust: [{ on: "4" }],
  },
  { name: "4", color: "brown", price: 300, obsolete: "5", phased: ["5"] },
  { name: "5", price: 450, quantity: 3 },
  { name: "E", phase: false, price: 1 },
];

const rows = (root) =>
  all(root, "tbody tr").map((tr) => all(tr, "td").map((td) => td.textContent));

describe("Phase", () => {
  it("lists trains, prices and events per phase", async () => {
    const { root } = await mountElement(
      <Phase
        minor={false}
        trains={trains}
        phases={[
          { name: "2", tiles: "yellow", notes: "Start", limit: 4 },
          { name: "3", train: ["3", "E"], buy_companies: true },
          { name: "4", events: { close_companies: true, remove_tokens: true } },
          { name: "5", notes: ["One", "Two"] },
          { name: "M", minor: true },
        ]}
      />,
    );
    const headers = all(root, "th").map((th) => th.textContent);
    expect(headers).toEqual([
      "Name",
      "Train",
      "Price",
      "#",
      "Limit",
      "Phased",
      "Obsolete",
      "Rust",
      "Tiles",
      "Notes",
    ]);
    // Minor phases are left off major charters
    expect(rows(root)).toEqual([
      ["2", "2", "$80$100", "6", "4", "", "", "", " ", "Start"],
      [
        "3",
        "3",
        "$180",
        "5+",
        "",
        "",
        "",
        "",
        " ",
        "Private companies may be purchased.",
      ],
      [
        "4",
        "4",
        "$300",
        "",
        "",
        "",
        "",
        "3",
        " ",
        "Private companies close.Private tokens removed.",
      ],
      ["5", "5", "$450", "3", "", "4", "4", "", " ", "OneTwo"],
    ]);
    // Array prices are one per line
    expect(one(root, "tbody td:nth-child(3) br")).not.toBeNull();
    const [first, , third, fourth] = all(root, "tbody tr");
    // Train and rust cells take the train colors, tiles the phase color
    expect(one(first, ".phase__list").style.backgroundColor).toBe(
      rgb(gmt.yellow),
    );
    expect(all(first, "td")[8].style.backgroundColor).toBe(rgb(gmt.yellow));
    expect(all(third, ".phase__list")[1].style.backgroundColor).toBe(
      rgb(gmt.green),
    );
    // Trains without a color are white
    expect(one(fourth, ".phase__list").style.backgroundColor).toBe(
      rgb(gmt.white),
    );
  });

  it("shows only minor and company phases on a minor", async () => {
    const { root } = await mountElement(
      <Phase
        minor
        company="A"
        phases={[
          { name: "1", minor: true, phase: "I" },
          { name: "2", minor: true, company: "B" },
          { name: "3" },
        ]}
      />,
    );
    expect(all(root, "th").map((th) => th.textContent)).toEqual([
      "Name",
      "Phase",
    ]);
    expect(rows(root)).toEqual([["1", "I"]]);
  });

  it("draws nothing without matching phases", async () => {
    const { root } = await mountElement(
      <Phase phases={[{ name: "1", company: "B" }]} company="A" />,
    );
    expect(one(root, "table")).toBeNull();
  });
});

describe("Charter", () => {
  const company = {
    ...games["18Test"].companies.find((c) => c.abbrev === "BRR"),
    capital: 500,
  };
  const props = {
    name: "Blue Railroad",
    subtext: "Subtext",
    color: "blue",
    tokens: [0, 40],
    company,
    trains,
    phases: [{ name: "2" }],
    turns: [
      { name: "Ordered", steps: ["First", "Second"], ordered: true },
      { name: "Loose", steps: ["Any"], optional: ["Maybe"] },
    ],
    variant: "Variant",
  };

  it("draws color charters with a logo and empty token spots", async () => {
    const { root } = await mountElement(<Charter {...props} />);
    const charter = one(root, ".charter");
    expect(charter).toHaveClass("charter--color");
    expect(one(root, ".charter__hr").style.backgroundColor).toBe(rgb(rob.blue));
    expect(one(root, ".charter__logo")).not.toBeNull();
    // Two token spots leave room on the right of the name
    expect(one(root, ".charter__name")).toHaveStyle({
      paddingRight: "136.8px",
    });
    expect(all(root, ".charter__tokens > svg")).toHaveLength(2);
    expect(one(root, ".charter__capital")).toHaveTextContent("$500");
    // Turn order with ordered steps and optional steps
    expect(all(root, "dt").map((dt) => dt.textContent)).toEqual([
      "Ordered",
      "Loose",
    ]);
    expect(all(root, "dd ol li")).toHaveLength(2);
    expect(all(root, "dd")).toHaveLength(3);
    expect(one(root, ".charter__variant")).toHaveTextContent("Variant");
    expect(within(root).getByText("Subtext")).toBeInTheDocument();
  });

  it("outlines white and black banded color charters", async () => {
    let { root } = await mountElement(<Charter {...props} color="white" />);
    expect(one(root, ".charter__hr")).toHaveStyle({
      borderBottomWidth: "2px",
      borderBottomStyle: "solid",
      borderBottomColor: "rgb(0, 0, 0)",
    });
    ({ root } = await mountElement(<Charter {...props} />, {
      search: "?config.charters.blackBand=true",
    }));
    expect(one(root, ".charter__hr")).toHaveStyle({
      borderBottomWidth: "2px",
      borderBottomStyle: "solid",
      borderBottomColor: "rgb(0, 0, 0)",
    });
  });

  it("draws carth charters with company tokens", async () => {
    const { root } = await mountElement(<Charter {...props} color="white" />, {
      search: "?config.charters.style=carth",
    });
    expect(one(root, ".charter")).toHaveClass("charter--carth");
    // White bands are drawn black and there is no logo
    expect(one(root, ".charter__hr").style.backgroundColor).toBe(
      rgb(rob.black),
    );
    expect(one(root, ".charter__logo")).toBeNull();
    // Each token spot is a full company token
    const spots = all(root, ".charter__tokens > svg");
    expect(spots.map((s) => one(s, "text").textContent)).toEqual([
      "BRR",
      "BRR",
    ]);
    // Token costs are black outside the color style
    const costs = all(root, ".charter__tokens text[font-size='11']");
    costs.forEach((c) => expect(c).toHaveAttribute("fill", rob.black));
  });

  it("draws half width charters with assets instead of trains", async () => {
    const { root } = await mountElement(<Charter {...props} halfWidth />);
    expect(one(root, ".cutlines")).toHaveClass("cutlines--half");
    expect(one(root, ".charter__tokens")).toHaveTextContent(/^Tokens/);
    expect(one(root, ".charter__assets")).toHaveTextContent(/^Assets/);
    expect(one(root, ".charter__trains")).toBeNull();
    expect(one(root, ".charter__treasury")).toBeNull();
    expect(one(root, ".charter__name")).toHaveStyle({ paddingRight: "0px" });
    // Token costs are turned sideways
    expect(
      all(
        root,
        ".charter__tokens g[transform='rotate(-90) translate(0 39)'] > text",
      ),
    ).toHaveLength(2);
  });

  it("draws the trains of a company as cards", async () => {
    const own = { name: "S", color: "red", price: 50 };
    const withTrains = {
      ...company,
      trains: [{ name: "2", quantity: 2 }, own],
    };
    const { root } = await mountElement(
      <Charter {...props} company={withTrains} />,
    );
    expect(
      all(root, ".charter__trains .charter__traincard .train"),
    ).toHaveLength(3);
    expect(
      all(root, ".charter__traincard .train__name").map((n) => n.textContent),
    ).toEqual(["2", "2", "S"]);
    // They are inside the charter, not on a cutlines of their own
    expect(all(root, ".cutlines")).toHaveLength(1);
  });

  it("has a black border and rounded corners unless turned off", async () => {
    const withTrains = { ...company, trains: ["2"] };
    const on = await mountElement(<Charter {...props} company={withTrains} />);
    const box = one(on.root, ".charter__traincards");
    expect(box).toHaveClass("charter__traincards--border");
    expect(box).toHaveClass("charter__traincards--round");
    expect(
      getComputedStyle(one(on.root, ".charter__traincard")).outlineColor,
    ).toBe("rgb(0, 0, 0)");
    const off = await mountElement(
      <Charter {...props} company={withTrains} />,
      {
        search:
          "?config.charters.trainCardBorder=&config.charters.trainCardRound=",
      },
    );
    const plain = one(off.root, ".charter__traincards");
    expect(plain).not.toHaveClass("charter__traincards--border");
    expect(plain).not.toHaveClass("charter__traincards--round");
  });

  it("leaves the trains of a company to the cards when set to", async () => {
    const withTrains = { ...company, trains: ["2"] };
    const { root } = await mountElement(
      <Charter {...props} company={withTrains} />,
      { search: "?config.charters.trainCards=cards" },
    );
    expect(one(root, ".charter__traincards")).toBeNull();
    const half = await mountElement(
      <Charter {...props} company={withTrains} halfWidth />,
    );
    expect(one(half.root, ".charter__traincards")).toBeNull();
  });

  it("drops turn order on minors and hidden sections", async () => {
    const { root } = await mountElement(
      <Charter
        {...props}
        minor
        tokens={undefined}
        company={{ ...company, trains: false, treasury: false }}
      />,
      { search: "?config.charters.showPhaseChart=" },
    );
    expect(one(root, ".cutlines")).toHaveClass("cutlines--minor");
    expect(one(root, ".charter")).toHaveClass("charter--minor");
    expect(one(root, ".charter__tokens")).toBeNull();
    expect(one(root, ".charter__name")).toHaveStyle({ paddingRight: "12px" });
    expect(one(root, ".charter__trains")).toHaveTextContent(/^$/);
    expect(one(root, ".charter__phase")).toBeNull();
    expect(one(root, ".charter__treasury")).not.toHaveTextContent("Treasury");
    expect(one(root, "dt")).toBeNull();
  });
});
