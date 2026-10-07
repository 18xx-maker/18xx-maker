/* eslint-disable testing-library/no-node-access */
import { screen } from "@testing-library/react";

import "@/styles/cutlines.css";
import "@/styles/card.css";

import { renderApp } from "@tests/support/helpers.jsx";

const showCards = async (config = "") => {
  renderApp(`/games/18Test/cards?print=true&config.cards.layout=free${config}`);
  return screen.findByTestId("game-18Test-cards");
};

const pagesOf = (root) => [...root.querySelectorAll(".cards")];

const slotsOf = (page) => [...page.querySelectorAll(".card")];

// What a train card is, from its front or from its back
const kindOf = (card) => {
  const text = card.textContent;
  if (card.classList.contains("card--blank")) return "blank";
  if (card.classList.contains("train-back")) {
    if (text.includes("Two Train")) return "2";
    return text.includes("Obsolete when") ? "3+1" : "back?";
  }
  if (card.classList.contains("train")) {
    if (text.startsWith("280G")) return "2";
    if (text.startsWith("5D")) return "5D";
    if (text.startsWith("4D")) return "4D";
    return text.startsWith("3+1") ? "3+1" : "none";
  }
  return "other";
};

// Where a card is on the paper, from the left edge of the paper as seen from
// the front. The sheet of backs is flipped on its long edge.
const place = (page, card, flipped = false) => {
  const p = page.getBoundingClientRect();
  const c = card.getBoundingClientRect();
  return {
    left: flipped ? p.right - c.right : c.left - p.left,
    top: Math.round(c.top - p.top),
  };
};

const isBack = (page) => page.classList.contains("cards--back");

// The cards are two per row on the paper of the test
const PER_ROW = 2;

describe("duplex", () => {
  it("looks up a train that only exists as a back, like 5D, for rust", async () => {
    const root = await showCards("&config.cards.duplex=long");
    const front = [...root.querySelectorAll(".card.train")].find((card) =>
      card.textContent.startsWith("3+1"),
    );
    expect(front).toHaveTextContent("Rusted by 5D");
  });

  it("prints a page of backs after the page of fronts they belong to", async () => {
    const pages = pagesOf(await showCards("&config.cards.duplex=long"));

    // Only the pages with a train that has a back are followed by backs
    expect(pages.map((page) => (isBack(page) ? "back" : "front"))).toEqual([
      "front",
      "front",
      "front",
      "front",
      "front",
      "back",
      "front",
      "back",
      "front",
    ]);
  });

  it("puts every back behind its front when flipped on the long edge", async () => {
    const pages = pagesOf(await showCards("&config.cards.duplex=long"));

    const pairs = pages
      .map((page, i) => [pages[i - 1], page])
      .filter(([, page]) => isBack(page));
    expect(pairs).toHaveLength(2);

    pairs.forEach(([front, back]) => {
      const fronts = slotsOf(front);
      const backs = slotsOf(back);
      expect(backs).toHaveLength(fronts.length);
      fronts.forEach((card) => {
        const behind = backs.find((other) => {
          const [a, b] = [place(front, card), place(back, other, true)];
          return a.top === b.top && a.left === b.left;
        });
        // A train has its back behind it, the others nothing
        const kind = kindOf(card);
        const expected = kind === "4D" ? "5D" : kind;
        expect(kindOf(behind)).toBe(
          kind === "none" || kind === "other" ? "blank" : expected,
        );
      });
    });
  });

  it("puts every back at the physical place of its front, seen through the paper", async () => {
    const pages = pagesOf(await showCards("&config.cards.duplex=long"));
    const front = pages.find((page) => !isBack(page) && slotsOf(page).length);
    const back = pages.find(isBack);

    // The paper has more room left over than a card
    const slot = front.querySelector(".cutlines").getBoundingClientRect();
    const leftover = front.getBoundingClientRect().width - PER_ROW * slot.width;
    expect(leftover).toBeGreaterThan(100);

    slotsOf(front).forEach((card, i) => {
      const behind = slotsOf(back).find(
        (other) =>
          Math.abs(place(back, other, true).left - place(front, card).left) <
            0.5 && place(back, other).top === place(front, card).top,
      );
      expect(behind, `card ${i}`).toBeDefined();
    });
  });

  it("keeps the backs of separate sheets in the order of the fronts", async () => {
    const pages = pagesOf(await showCards("&config.cards.duplex=separate"));
    const back = pages.find(isBack);
    expect(back).not.toHaveClass("cards--flip");
    console.log(
      back.getBoundingClientRect().left,
      pages.indexOf(back),
      [...back.children]
        .map((c) => JSON.stringify(c.getBoundingClientRect()))
        .join(" | "),
    );
    // And not forced to portrait: letter fits 3 per row in landscape
    expect(slotsOf(pages[0]).length).toBeGreaterThan(8);
  });

  it("keeps a back for every copy of a train and a blank for a train without one", async () => {
    const root = await showCards("&config.cards.duplex=long");
    const kinds = pagesOf(root).flatMap((page) =>
      isBack(page) ? slotsOf(page).map(kindOf) : [],
    );
    // 4 copies of the 2, 3 of the 3+1, and the pages are filled with blanks
    expect(kinds.filter((kind) => kind === "2")).toHaveLength(4);
    expect(kinds.filter((kind) => kind === "3+1")).toHaveLength(3);
    expect(kinds.filter((kind) => kind === "back?")).toHaveLength(0);
  });

  it("prints a back that is a full train as a normal train card", async () => {
    const root = await showCards("&config.cards.duplex=long");
    const backs = pagesOf(root)
      .filter(isBack)
      .flatMap((page) => slotsOf(page))
      .filter((card) => kindOf(card) === "5D");
    // The 2 copies of the 4D, a normal card (not a title back) of the 5D
    expect(backs).toHaveLength(2);
    backs.forEach((card) => {
      expect(card).not.toHaveClass("train-back");
      expect(card.querySelector(".train__price")).toHaveTextContent(/1,000/);
      expect(card).toHaveTextContent(/Flip side of the 4D/);
    });
  });

  it("backs the trains of the companies that print on the cards", async () => {
    const root = await showCards(
      "&config.cards.duplex=long&config.charters.trainCards=cards",
    );
    const fronts = pagesOf(root)
      .filter((page) => !isBack(page))
      .flatMap((page) => slotsOf(page).map(kindOf));
    const backs = pagesOf(root)
      .filter(isBack)
      .flatMap((page) => slotsOf(page).map(kindOf));

    // The company trains are copies of the 2, so they have its back too
    const twos = fronts.filter((kind) => kind === "2").length;
    expect(twos).toBeGreaterThan(4);
    expect(backs.filter((kind) => kind === "2")).toHaveLength(twos);
  });

  it("prints all the backs after all the fronts in the same order", async () => {
    const root = await showCards("&config.cards.duplex=separate");
    const pages = pagesOf(root);
    const flags = pages.map((page) => (isBack(page) ? "back" : "front"));
    // Letter fits 9 in landscape, separate does not force portrait
    expect(flags).toEqual([...Array(6).fill("front"), "back", "back"]);

    // Not mirrored: the backs follow the order of the trains
    const backs = pages
      .filter(isBack)
      .flatMap((page) => slotsOf(page).map(kindOf));
    expect(backs).toEqual([
      "blank",
      "blank",
      "2",
      "2",
      "2",
      "2",
      "3+1",
      "3+1",
      "3+1",
      "5D",
      "5D",
      "blank",
      "blank",
      "blank",
    ]);
    expect(backs.filter((kind) => kind === "2")).toHaveLength(4);
  });

  it("prints no backs when off, unset or on a die layout", async () => {
    const unset = await showCards();
    const summary = (root) =>
      pagesOf(root).map((page) => slotsOf(page).map((card) => card.className));
    const before = summary(unset);
    expect(pagesOf(unset).some(isBack)).toBe(false);
    expect(unset.querySelector(".train-back")).toBeNull();
    expect(unset.querySelector(".card--blank")).toBeNull();

    document.body.innerHTML = "";
    const off = await showCards("&config.cards.duplex=off");
    expect(summary(off)).toEqual(before);

    document.body.innerHTML = "";
    renderApp(
      "/games/18Test/cards?print=true&config.cards.layout=miniEuroDie&config.cards.duplex=long",
    );
    const die = await screen.findByTestId("game-18Test-cards");
    expect(pagesOf(die).some(isBack)).toBe(false);
  });

  it("puts the pins of a page of backs on the other side", async () => {
    const root = await showCards(
      "&config.cards.duplex=long&config.cards.showPins=true",
    );
    const pages = pagesOf(root);
    const front = pages.find((page) => !isBack(page));
    const back = pages.find(isBack);

    const pinsOf = (page) => page.querySelector(":scope > svg");
    expect(getComputedStyle(pinsOf(front)).right).toBe("0px");
    expect(getComputedStyle(pinsOf(back)).left).toBe("0px");
    expect(getComputedStyle(pinsOf(back)).right).not.toBe("0px");
  });

  it("draws no pins on the free layout unless asked", async () => {
    const root = await showCards("&config.cards.duplex=long");
    expect(root.querySelector(".cards > svg")).toBeNull();
  });

  it("leaves out the empty slots of a page of backs", async () => {
    const root = await showCards("&config.cards.duplex=long");
    const blank = root.querySelector(".cards--back .card--blank");
    expect(getComputedStyle(blank).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(blank.parentElement, "::before").display).toBe(
      "none",
    );
  });
});
