import { screen } from "@testing-library/react";

import Charter from "@/components/Charter";

import { games } from "@/data";
import charter_traincardsCss from "@/styles/charter-traincards.css?raw";
import charterCss from "@/styles/charter.css?raw";
import cutlinesCss from "@/styles/cutlines.css?raw";
import footerCss from "@/styles/footer.css?raw";
import marketCss from "@/styles/market.css?raw";
import page_elementsCss from "@/styles/page-elements.css?raw";
import print_pagesCss from "@/styles/print-pages.css?raw";
import shellCss from "@/styles/shell.css?raw";

import { renderApp } from "@tests/support/helpers.jsx";
import { all, mountElement, one } from "@tests/support/render.jsx";

describe("game charters", () => {
  it.for(["free", "3x1"])(
    "can load and display %s charters",
    async (layout) => {
      renderApp(`/games/18Test/charters?config.charters.layout=${layout}`);
      expect(
        await screen.findByTestId("game-18Test-charters"),
      ).toBeInTheDocument();
    },
  );

  // Half width charters have no room for trains, the cards print them instead
  it.for([
    ["3x1", false],
    ["3x2", true],
  ])(
    "draws the single charter of %s with halfWidth %s",
    async ([layout, half]) => {
      renderApp(`/games/18Test/charters/0?config.charters.layout=${layout}`);
      const root = await screen.findByTestId("game-18Test-charter");
      expect(one(root, ".charter--half") !== null).toBe(half);
      expect(one(root, ".charter__traincards") !== null).toBe(!half);
    },
  );

  it("draws only minors at half width with halfWidthMinors", async () => {
    renderApp(
      "/games/18Test/charters?config.charters.layout=free&config.charters.halfWidthMinors=true",
    );
    const root = await screen.findByTestId("game-18Test-charters");
    const minors = all(root, ".charter--minor");
    const majors = all(root, ".charter").filter(
      (c) => !c.classList.contains("charter--minor"),
    );
    expect(minors.length).toBeGreaterThan(0);
    expect(majors.length).toBeGreaterThan(0);
    for (const c of minors) expect(c).toHaveClass("charter--half");
    for (const c of majors) expect(c).not.toHaveClass("charter--half");
  });

  it("ignores halfWidthMinors in the 3x1 layout", async () => {
    renderApp(
      "/games/18Test/charters?config.charters.layout=3x1&config.charters.halfWidthMinors=true",
    );
    const root = await screen.findByTestId("game-18Test-charters");
    expect(all(root, ".charter--half")).toHaveLength(0);
  });
});

describe("charter train cards", () => {
  // Component tests run without the app's stylesheets, layout needs the print stylesheets
  beforeEach(() => {
    const style = document.createElement("style");
    style.dataset.test = "root-css";
    style.textContent = [
      shellCss,
      page_elementsCss,
      charterCss,
      marketCss,
      cutlinesCss,
      footerCss,
      print_pagesCss,
      charter_traincardsCss,
    ].join("\n");
    document.head.append(style);
  });
  afterEach(() => {
    // eslint-disable-next-line testing-library/no-node-access
    document.head.querySelector("style[data-test=root-css]")?.remove();
  });

  // The cards stack above the phase chart, they must never print over it
  it.for(["3x1", "3x1minors", "free"])(
    "stay above the phase chart and whole in the %s layout",
    async (layout) => {
      renderApp(
        `/games/18Test/charters?config.charters.layout=${layout}&config.charters.showPhaseChart=true`,
      );
      const root = await screen.findByTestId("game-18Test-charters");
      const charters = all(root, ".charter").filter((c) =>
        one(c, ".charter__traincards"),
      );
      expect(charters.length).toBeGreaterThan(0);
      for (const charter of charters) {
        const cards = one(charter, ".charter__traincards");
        const phase = one(charter, ".charter__phase").getBoundingClientRect();
        expect(cards.getBoundingClientRect().bottom).toBeLessThanOrEqual(
          phase.top + 0.5,
        );
        // Shrunk to fit, not cut off
        expect(cards.scrollHeight).toBeLessThanOrEqual(cards.clientHeight + 1);
      }
    },
  );

  // A tall phase chart overflows upward over the label, never out of the box
  it.for(["3x1", "3x1minors"])(
    "keeps the phase chart inside the trains box of 1867 in the %s layout",
    async (layout) => {
      renderApp(`/games/1867/charters?config.charters.layout=${layout}`);
      const root = await screen.findByTestId("game-1867-charters");
      const boxes = all(root, ".charter__trains").filter((b) =>
        one(b, ".charter__phase"),
      );
      expect(boxes.length).toBeGreaterThan(0);
      for (const box of boxes) {
        expect(
          one(box, ".charter__phase").getBoundingClientRect().bottom,
        ).toBeLessThanOrEqual(box.getBoundingClientRect().bottom + 0.5);
      }
    },
  );

  it("stay above the phase chart on a minor charter", async () => {
    const company = {
      ...games["18Test"].companies.find((c) => c.minor),
      trains: [{ name: "2", quantity: 8 }],
    };
    const { root } = await mountElement(
      <>
        <style>{`.charter, .charter--minor, .charter__bleed, .charter__body { width: 7.8125in; height: 3.47in; }`}</style>
        <Charter
          name={company.name}
          color={company.color}
          minor
          company={company}
          trains={[{ name: "2", color: "yellow", price: 80, quantity: 6 }]}
          phases={[{ name: "2" }, { name: "3" }, { name: "4" }]}
        />
      </>,
      { config: { charters: { showPhaseChart: true } } },
    );
    const cards = one(root, ".charter__traincards");
    const phase = one(root, ".charter__phase");
    expect(cards.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      phase.getBoundingClientRect().top + 0.5,
    );
    expect(cards.scrollHeight).toBeLessThanOrEqual(cards.clientHeight + 1);
  });
});

describe("minor turn order", () => {
  const turns = async (opts) => {
    renderApp(
      `/games/18Test/charters?config.charters.layout=free&config.charters.showTurnOrder=true${opts}`,
    );
    const root = await screen.findByTestId("game-18Test-charters");
    const has = (c) => all(c, "dl > *").length > 0;
    const charters = all(root, ".charter");
    return {
      minors: charters.filter((c) => c.classList.contains("charter--minor")),
      majors: charters.filter((c) => !c.classList.contains("charter--minor")),
      has,
    };
  };

  it("hides the turn order on minors by default", async () => {
    const { minors, majors, has } = await turns("");
    expect(minors.length).toBeGreaterThan(0);
    expect(minors.some(has)).toBe(false);
    expect(majors.some(has)).toBe(true);
  });

  it("shows the turn order on minors with showMinorTurnOrder", async () => {
    const { minors, has } = await turns(
      "&config.charters.showMinorTurnOrder=true",
    );
    expect(minors.every(has)).toBe(true);
  });
});
