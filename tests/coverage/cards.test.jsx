import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Private from "@/components/cards/Private";
import Share from "@/components/cards/Share";
import Train from "@/components/cards/Train";

import { companyThemes, games, mapThemes } from "@/data";

import { renderApp } from "@tests/support/helpers.jsx";
import { all, mountElement, one } from "@tests/support/render.jsx";

const gmt = mapThemes.gmt.colors;
const rob = companyThemes.rob.colors;
const game = games["18Test"];
const company = game.companies.find((c) => c.abbrev === "BRR");

// Computed css colors come back as rgb()
const rgb = (hex) => {
  const span = document.createElement("span");
  span.style.color = hex;
  return span.style.color;
};

describe("Share", () => {
  const share = {
    company,
    name: company.name,
    color: "white",
    shares: 2,
    percent: 20,
    cost: 100,
    revenue: 30,
    label: "Pres",
    labelColor: "red",
    subtext: "Sub",
    variant: "Var",
    backgroundColor: "yellow",
  };

  it("draws left style shares with a bordered white band", async () => {
    const { root } = await mountElement(<Share {...share} />, {
      search: "?config.cards.shareStyle=left",
    });
    const card = one(root, ".share");
    expect(card).toHaveClass("share--left");
    const band = one(root, ".share__hr");
    expect(band).toHaveStyle({
      borderLeftWidth: "1px",
      borderLeftStyle: "solid",
      borderLeftColor: "rgb(0, 0, 0)",
    });
    expect(band).toHaveStyle({
      borderRightWidth: "1px",
      borderRightStyle: "solid",
      borderRightColor: "rgb(0, 0, 0)",
    });
    expect(one(root, ".card__bleed").style.backgroundColor).toBe(
      rgb(gmt.yellow),
    );
    expect(one(root, ".share__label__text").style.backgroundColor).toBe(
      rgb(gmt.red),
    );
    const body = within(root);
    expect(body.getByText("2 Shares")).toBeInTheDocument();
    expect(body.getByText("20%")).toBeInTheDocument();
    expect(body.getByText("$100")).toBeInTheDocument();
    expect(one(root, ".share__name").textContent.trim()).toBe(company.name);
    expect(body.getByText("Sub")).toBeInTheDocument();
    expect(body.getByText("Var")).toBeInTheDocument();
    // One token per share
    expect(all(root, ".share__token")).toHaveLength(2);
  });

  it("draws gmt style black bands on the right when configured", async () => {
    const { root } = await mountElement(
      <Share {...share} color="blue" shares={1} />,
      { search: "?config.cards.shareStyle=gmt&config.cards.blackBand=true" },
    );
    const band = one(root, ".share__hr");
    expect(band).toHaveStyle({
      borderRightWidth: "2px",
      borderRightStyle: "solid",
      borderRightColor: "rgb(0, 0, 0)",
    });
    expect(band).toHaveStyle({ borderLeftStyle: "none" });
    expect(band.style.backgroundColor).toBe(rgb(rob.blue));
    expect(within(root).getByText("1 Share")).toBeInTheDocument();
  });

  it("draws gmt style bands without borders by default", async () => {
    const { root } = await mountElement(<Share {...share} color="blue" />);
    expect(one(root, ".share__hr")).toHaveStyle({ borderRightStyle: "none" });
  });

  it("draws centered shares", async () => {
    const { root } = await mountElement(<Share {...share} tokenCount={1.5} />, {
      search: "?config.cards.shareStyle=center",
    });
    expect(one(root, ".share")).toHaveClass("share--center");
    const body = within(root);
    expect(body.getByText("2 Shares")).toBeInTheDocument();
    expect(body.getByText("100")).toBeInTheDocument();
    expect(body.getByText("Revenue: 30")).toBeInTheDocument();
    expect(body.getByText("Pres")).toBeInTheDocument();
    expect(body.getByText("Var")).toBeInTheDocument();
    // A partial token is drawn at half width
    const wrappers = all(root, ".share__token__wrapper");
    expect(wrappers.map((w) => w.style.width)).toEqual(["100%", "50%"]);
  });

  it("draws a single centered share without extras", async () => {
    const { root } = await mountElement(
      <Share company={company} color="blue" shares={1} />,
      { search: "?config.cards.shareStyle=center" },
    );
    expect(within(root).getByText("1 Share")).toBeInTheDocument();
    expect(one(root, ".share__label")).toBeNull();
    expect(one(root, ".share__subtext")).toBeNull();
  });
});

describe("Train", () => {
  const trains = [
    { name: "2", color: "yellow" },
    { name: "3", color: "green" },
    { name: "4", color: "brown" },
    { name: "6", color: "gray" },
  ];

  const renderTrain = (train, search) =>
    mountElement(<Train train={train} trains={trains} />, { search });

  it("describes phase and rust events with ordinals", async () => {
    const { root } = await renderTrain({
      name: "2",
      color: "yellow",
      phased: [{ index: 1, on: "3" }, "4"],
      rust: [
        { index: 3, on: "6" },
        { index: 4, on: "6" },
      ],
      rustedText: "Gone with",
    });
    const notes = all(root, ".train__info").map((n) => n.textContent);
    expect(notes).toEqual(["Phased out by 1st 3, 4", "Gone with 3rd 6, 4th 6"]);
    // Each note is colored like the train causing it
    expect(all(root, ".train__info")[0].style.backgroundColor).toBe(
      rgb(gmt.green),
    );
    expect(all(root, ".train__info")[1].style.backgroundColor).toBe(
      rgb(gmt.gray),
    );
  });

  it("describes obsolete events", async () => {
    const { root } = await renderTrain({
      name: "2",
      obsolete: [{ index: 2, on: "4" }, "6"],
      obsoletedText: "Old by",
    });
    expect(one(root, ".train__info")).toHaveTextContent("Old by 2nd 4, 6");
    expect(one(root, ".train__info").style.backgroundColor).toBe(
      rgb(gmt.brown),
    );
  });

  it("marks permanent trains with a custom color", async () => {
    const { root } = await renderTrain({
      name: "D",
      color: "purple",
      permanentColor: "green",
      permanentText: "Forever",
      players: "3-4",
      description: "Diesel",
      variant: "Variant",
      tradeIn: 300,
      price: 1100,
    });
    const note = one(root, ".train__info");
    expect(note).toHaveTextContent("Forever");
    expect(note.style.backgroundColor).toBe(rgb(gmt.green));
    const body = within(root);
    expect(body.getByText("3-4")).toHaveClass("train__players");
    expect(body.getByText("Diesel")).toBeInTheDocument();
    expect(body.getByText("Variant")).toBeInTheDocument();
    expect(one(root, ".train__trade_in_price")).toHaveTextContent("($300)");
  });

  it("shows upgrade and zero trade-in values under the price", async () => {
    const { root } = await renderTrain({
      name: "D",
      color: "brown",
      price: 1100,
      upgrade: "$800",
      tradeIn: 0,
    });
    expect(one(root, ".train__upgrade_price")).toHaveTextContent("800");
    expect(one(root, ".train__trade_in_price")).toHaveTextContent("($0)");
  });

  it("leaves non permanent trains without notes", async () => {
    const { root } = await renderTrain({ name: "X", permanent: false });
    expect(one(root, ".train__info")).toBeNull();
  });

  it.for([
    ["green", "3T"],
    ["brown", "4T"],
    ["gray", "6T"],
    ["grey", "6T"],
    ["yellow", "2T"],
  ])("picks the %s train image", async ([color, image]) => {
    const { root } = await renderTrain(
      { name: "T", color },
      "?config.trains.images=true",
    );
    expect(one(root, ".train__image")).toHaveClass(`train__image--${image}`);
    expect(one(root, "img")).toHaveAttribute("alt", `${color} T train`);
  });

  it("colors the name instead of a band in other styles", async () => {
    const { root } = await renderTrain(
      { name: "5", color: "red" },
      "?config.trains.style=plain",
    );
    expect(one(root, ".train__hr")).toBeNull();
    expect(one(root, ".train__name").style.color).toBe(rgb(gmt.red));
    expect(one(root, ".train")).toHaveClass("train--plain");
  });

  it("outlines white train bands", async () => {
    const { root } = await renderTrain({ name: "W", color: "white" });
    expect(one(root, ".train__hr")).toHaveStyle({
      borderBottomWidth: "2px",
      borderBottomStyle: "solid",
      borderBottomColor: "rgb(0, 0, 0)",
    });
  });
});

describe("Private", () => {
  const base = {
    name: "Private Co",
    price: 40,
    description: ["Line one", "Line two"],
    note: ["Note one", "Note two"],
    players: game.players,
  };

  it("joins multi line notes and descriptions", async () => {
    const { root } = await mountElement(<Private {...base} />);
    expect(one(root, ".private__note").innerHTML).toContain("<br>");
    expect(one(root, ".private__note")).toHaveTextContent("Note oneNote two");
    expect(one(root, ".private__description")).toHaveTextContent(
      "Line oneLine two",
    );
  });

  it("puts icons above the description in the big style", async () => {
    const { root } = await mountElement(
      <Private
        {...base}
        icon="meat"
        token={{ label: "T" }}
        company="BRR"
        tile="57"
      />,
      { search: "?config.privates.style=big" },
    );
    const body = one(root, ".card__body");
    // The icons are children of the card body, not the description
    expect(
      all(body, ":scope > .private__company, :scope > .private__icon"),
    ).toHaveLength(3);
    expect(one(body, ":scope > .private__tile")).not.toBeNull();
    expect(one(root, ".private__description .private__icon")).toBeNull();
    // Token outlines are thinner in the big style
    const outlines = all(root, ".private__company circle[fill='none']");
    expect(outlines.map((c) => c.getAttribute("stroke-width"))).toEqual([
      "1",
      "1",
    ]);
  });

  it("puts icons inside the description in the small style", async () => {
    const { root } = await mountElement(
      <Private {...base} icon="meat" token={{ label: "T", outlineWidth: 3 }} />,
    );
    expect(one(root, ".private__description .private__icon")).not.toBeNull();
    expect(one(root, ".private__company circle[fill='none']")).toHaveAttribute(
      "stroke-width",
      "3",
    );
  });

  it("shares the description width between several icons", async () => {
    const { root } = await mountElement(
      <Private {...base} icon="meat" token={{ label: "T" }} />,
    );
    expect(
      one(root, ".private__description").style.getPropertyValue(
        "--private-icons",
      ),
    ).toBe("2");
  });

  it("scales icons with iconSize on the card body only when set", async () => {
    const { root } = await mountElement(
      <Private {...base} icon="meat" iconSize={1.5} />,
    );
    expect(
      one(root, ".card__body").style.getPropertyValue("--private-icon-scale"),
    ).toBe("1.5");
    expect(
      one(root, ".private__description").style.getPropertyValue(
        "--private-icon-scale",
      ),
    ).toBe("");
    const { root: plain } = await mountElement(
      <Private {...base} icon="meat" />,
    );
    expect(
      one(plain, ".card__body").style.getPropertyValue("--private-icon-scale"),
    ).toBe("");
    const { root: nul } = await mountElement(
      <Private {...base} icon="meat" iconSize={null} />,
    );
    expect(
      one(nul, ".card__body").style.getPropertyValue("--private-icon-scale"),
    ).toBe("");
  });

  it("leaves a single icon at full size", async () => {
    const { root } = await mountElement(<Private {...base} icon="meat" />);
    expect(
      one(root, ".private__description").style.getPropertyValue(
        "--private-icons",
      ),
    ).toBe("");
  });

  it("marks a revenue box with a background so it can bleed", async () => {
    const { root } = await mountElement(
      <Private {...base} revenue={40} revenueBackgroundColor="green" />,
    );
    expect(one(root, ".private__revenue--background")).not.toBeNull();
  });

  it("shows a single player count", async () => {
    const { root } = await mountElement(
      <Private {...base} minPlayers={4} maxPlayers={4} />,
    );
    expect(one(root, ".private__players")).toHaveTextContent("Players: 4");
  });
});

describe("Cards page", () => {
  it("lays out dtg die cards with only the requested types", async () => {
    renderApp(
      "/games/18Test/cards?hidePrivates=true&hideShares=true&hideNumbers=true&config.cards.layout=dtgDie&config.cards.dtgPadding=5",
    );
    const page = await screen.findByTestId("game-18Test-cards");
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector(".private")).toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector(".share")).toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector(".train")).not.toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector(".cards--dtgDie")).not.toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    const css = page.querySelector("style").textContent;
    // dtg cards are 2.5in by 1.5in less the padding on each side
    expect(css).toContain("width: 2.4in");
    expect(css).toContain("height: 1.4in");
  });

  it("sets the card padding only when it is changed", async () => {
    renderApp("/games/18Test/cards?config.cards.layout=free");
    let page = await screen.findByTestId("game-18Test-cards");
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector("style")).not.toHaveTextContent("--card-padding");
  });

  it("applies the card padding config", async () => {
    renderApp("/games/18Test/cards?config.cards.padding=0");
    const page = await screen.findByTestId("game-18Test-cards");
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector("style")).toHaveTextContent(
      "--card-padding: 0in",
    );
  });

  it("centers a card that has a page to itself", async () => {
    renderApp(
      "/games/18Test/cards?config.cards.layout=free&config.cards.width=700&config.cards.height=900&config.cards.cutlines=0&config.cards.bleed=0",
    );
    const page = await screen.findByTestId("game-18Test-cards");
    // eslint-disable-next-line testing-library/no-node-access
    const cards = page.querySelector(".cards");
    expect(cards).toHaveStyle({ display: "flex", alignItems: "center" });
  });

  it("draws pins on a free layout when showPins is set", async () => {
    renderApp(
      "/games/18Test/cards?config.cards.layout=free&config.cards.showPins=true",
    );
    const page = await screen.findByTestId("game-18Test-cards");
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector(".pins")).not.toBeNull();
  });

  it("always draws pins on a fixed layout", async () => {
    renderApp(
      "/games/18Test/cards?config.cards.layout=miniEuroDie&config.cards.showPins=false",
    );
    const page = await screen.findByTestId("game-18Test-cards");
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector(".pins")).not.toBeNull();
  });

  it("does not crash when a card is too big for the page", async () => {
    renderApp(
      "/games/18Test/cards?config.cards.layout=free&config.cards.width=5000&config.cards.height=5000",
    );
    const page = await screen.findByTestId("game-18Test-cards");
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector(".card")).not.toBeNull();
  });

  it("adds big private styles when configured", async () => {
    renderApp(
      "/games/18Test/cards?config.privates.style=big&config.cards.layout=free",
    );
    const page = await screen.findByTestId("game-18Test-cards");
    // eslint-disable-next-line testing-library/no-node-access
    const css = page.querySelector("style").textContent;
    expect(css).toContain(
      ".private__description {\n  padding: 0 35% 0 var(--card-padding);",
    );
    expect(css).toContain(
      "width: calc(25% * var(--private-icon-scale, 1));\n  height: calc(45% * var(--private-icon-scale, 1));",
    );
    // Free layout has no pins
    // eslint-disable-next-line testing-library/no-node-access
    expect(page.querySelector(".pins")).toBeNull();
  });

  describe("sizes per type", () => {
    const free =
      "/games/18Test/cards?config.cards.layout=free&config.cards.cutlines=0&config.cards.bleed=0";

    const draw = async (search = "") => {
      renderApp(`${free}${search}`);
      const page = await screen.findByTestId("game-18Test-cards");
      return {
        page,
        // eslint-disable-next-line testing-library/no-node-access
        css: page.querySelector("style").textContent,
        // eslint-disable-next-line testing-library/no-node-access
        pages: [...page.querySelectorAll(".cards")],
      };
    };

    it("keeps one set of pages without sizes", async () => {
      const { css, pages } = await draw();
      expect(css).not.toContain(".cards-group-");
      for (const cards of pages) {
        expect(cards.className).not.toContain("cards-group-");
      }
    });

    it("keeps one set of pages when every size is the same", async () => {
      const base = await draw();
      const equal = await draw("&config.cards.sizes.private.width=265.748");
      expect(equal.css).toBe(base.css);
      expect(equal.pages).toHaveLength(base.pages.length);
    });

    it("lays out each size on its own pages", async () => {
      const { css, pages } = await draw(
        "&config.cards.sizes.private.width=500&config.cards.sizes.private.height=300",
      );
      expect(pages[0]).toHaveClass("cards-group-0");
      expect(pages.at(-1)).toHaveClass("cards-group-1");
      expect(css).toContain(".cards-group-0 .card__body {");
      expect(css).toContain(".cards-group-1 .card__body {");
      // 500 by 300 for the privates, the card size for everything else
      expect(css).toMatch(/\.cards-group-0 \.card__body \{[^}]*width: 5in/);
      expect(css).toMatch(
        /\.cards-group-1 \.card__body \{[^}]*width: 2.65748in/,
      );
      // Only the privates are in the first group
      const first = pages.filter((p) => p.classList.contains("cards-group-0"));
      for (const cards of first) {
        // eslint-disable-next-line testing-library/no-node-access
        expect(cards.querySelector(".share, .train, .number")).toBeNull();
      }
    });

    it("puts types of the same size together even when apart", async () => {
      const { pages } = await draw(
        "&config.cards.sizes.share.width=500&config.cards.sizes.share.height=300",
      );
      expect(pages.at(-1)).toHaveClass("cards-group-1");
      expect(pages.some((p) => p.classList.contains("cards-group-2"))).toBe(
        false,
      );
    });

    it("keeps the first group's page orientation", async () => {
      const { pages } = await draw(
        "&config.cards.sizes.number.width=500&config.cards.sizes.number.height=300",
      );
      const widths = new Set(pages.map((p) => p.style.width));
      expect(widths.size).toBe(1);
      expect(pages.length).toBeGreaterThan(1);
    });

    it("ignores the sizes in the die layouts", async () => {
      const { css, pages } = await draw(
        "&config.cards.layout=dtgDie&config.cards.sizes.private.width=500",
      );
      expect(css).not.toContain(".cards-group-");
      expect(pages.length).toBeGreaterThan(0);
    });

    it("sizes the single card page by its type", async () => {
      renderApp(
        "/games/18Test/cards/private/0?config.cards.layout=free&config.cards.sizes.private.width=500&config.cards.sizes.private.height=300",
      );
      const card = await screen.findByTestId("game-18Test-card");
      // eslint-disable-next-line testing-library/no-node-access
      const css = card.parentElement.querySelector("style").textContent;
      expect(css).toContain("width: 5in");
      expect(css).toContain("height: 3in");
    });
  });

  it("bleeds the revenue box of a private into the bleed of a single card", async () => {
    renderApp("/games/18Test/cards/private/0?cardBleed=12.5");
    const card = await screen.findByTestId("game-18Test-card");
    // eslint-disable-next-line testing-library/no-node-access
    const css = card.parentElement.querySelector("style").textContent;
    expect(css).toMatch(
      /\.private__revenue--background::before \{\s*right: -0\.125in;\s*bottom: -0\.125in;/,
    );
  });

  it.for(["dtgDie", "free"])(
    "renders a single card in the %s layout",
    async (layout) => {
      renderApp(`/games/18Test/cards/share/0?config.cards.layout=${layout}`);
      const card = await screen.findByTestId("game-18Test-card");
      expect(card).toHaveTextContent("Black Railroad");
    },
  );
});

describe("company trains on cards", () => {
  const trainCards = (route) => `${route}?config.charters.trainCards=cards`;
  const names = (root) =>
    all(root, ".card.train .train__name").map((n) => n.textContent);

  it("adds them to the cards sheet after the game trains", async () => {
    const view = renderApp("/games/18Test/cards");
    const count = names(await screen.findByTestId("game-18Test-cards")).length;
    view.unmount();

    renderApp(trainCards("/games/18Test/cards"));
    const all18 = names(await screen.findByTestId("game-18Test-cards"));
    expect(all18).toHaveLength(count + 3);
    // The fixture's black railroad owns two 2 trains and an S train
    expect(all18.slice(-3)).toEqual(["2", "2", "S"]);
  });

  it("has a card route for each of them", async () => {
    renderApp(trainCards("/games/18Test/cards/train/6"));
    expect(await screen.findByText("S")).toBeInTheDocument();
  });
});

describe("Card page", () => {
  it("names a back-only train in the rust note of a single card", async () => {
    // 18Test's 3+1 rusts on the 5D, a train that only exists as a full back
    renderApp("/games/18Test/cards/train/1");
    const page = await screen.findByTestId("game-18Test-card");
    expect(within(page).getByText(/5D/)).toBeInTheDocument();
  });
});
