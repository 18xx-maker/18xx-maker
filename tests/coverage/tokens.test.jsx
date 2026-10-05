import { describe, expect, it } from "vitest";

import CompanyToken from "@/components/tokens/CompanyToken";
import GameCompanyToken from "@/components/tokens/GameCompanyToken";
import GameMapCompanyToken from "@/components/tokens/GameMapCompanyToken";
import Token from "@/components/tokens/Token";

import CityRotateContext from "@/context/CityRotateContext";
import { mapThemes } from "@/data";
import games from "@/data/games";

import { all, drawSvg, one } from "@tests/support/render.jsx";

const gmt = mapThemes.gmt.colors;

const fontSize = (svg) => Number(one(svg, "text").getAttribute("font-size"));

describe("Token", () => {
  it("draws square tokens with bleed", async () => {
    const svg = await drawSvg(
      <Token tokenShape="square" bleed color="red" outline="blue" />,
    );
    const [clip, inner, outer] = all(svg, "rect");
    expect(clip.parentElement.tagName).toBe("clipPath");
    [clip, inner, outer].forEach((rect) => {
      expect(rect).toHaveAttribute("x", "-30");
      expect(rect).toHaveAttribute("width", "60");
    });
    expect(inner).toHaveAttribute("fill", gmt.red);
    expect(outer).toHaveAttribute("stroke", "blue");
    expect(outer).toHaveAttribute("fill", "none");
  });

  it("draws square tokens without bleed", async () => {
    const svg = await drawSvg(<Token tokenShape="square" />);
    expect(all(svg, "rect").map((r) => r.getAttribute("width"))).toEqual([
      "50",
      "50",
      "50",
    ]);
  });

  it("fills country logos edge to edge", async () => {
    const svg = await drawSvg(
      <Token logo="countries/ad" color="red" reserved />,
    );
    const logo = one(svg, "g[clip-path] svg");
    expect(logo).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
    expect(logo).toHaveClass("color-main-gray", "color-reserved");
    expect(logo).toHaveAttribute("width", "50");
  });

  it("draws inverse country logos as reserved", async () => {
    const svg = await drawSvg(
      <Token logo="countries/ad" inverse logoWidth={40} label="AD" />,
    );
    const logo = one(svg, "g[clip-path] svg");
    expect(logo).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
    expect(logo).toHaveClass("color-main-gray", "color-reserved");
    expect(logo).toHaveAttribute("width", "40");
    expect(one(svg, "text")).toHaveAttribute("fill", "none");
  });

  it("draws a five pointed star", async () => {
    const svg = await drawSvg(
      <Token star5="blue" label="S" outline="green" outlineWidth={3} />,
    );
    const star = one(svg, "g[transform^='translate(-25']");
    expect(star).toHaveAttribute("transform", "translate(-25, -25) scale(1)");
    const path = one(star, "path");
    expect(path).toHaveAttribute("stroke", "green");
    expect(path).toHaveAttribute("stroke-width", "3");
    // Star labels are sized for the smaller star
    expect(fontSize(svg)).toBeCloseTo(25 * 0.7 * 0.75, 5);
  });

  it("grays star labels on reserved tokens", async () => {
    const svg = await drawSvg(<Token star5 reserved label="S" />);
    expect(one(svg, "text")).toHaveAttribute("fill", "gray");
  });

  it.for([
    ["ABCDEF", 0.7],
    ["ABCDE", 0.8],
    ["ABCD", 0.9],
    ["ABC", 1],
  ])("shrinks the %s label under an icon", async ([label, scale]) => {
    const svg = await drawSvg(<Token icon="meat" label={label} />);
    expect(fontSize(svg)).toBeCloseTo(25 * 0.48 * scale, 5);
    const icon = one(svg, "g[clip-path] svg");
    // The icon sits above the label
    expect(icon).toHaveAttribute("y", `${-0.95 * 50}`);
  });

  it("enlarges numeric labels under an icon", async () => {
    const svg = await drawSvg(<Token icon="meat" label="10" />);
    expect(fontSize(svg)).toBeCloseTo(25 * 0.48 * 1.6, 5);
  });

  it("uses given icon sizes and positions", async () => {
    const svg = await drawSvg(
      <Token
        icon="meat"
        label="A"
        iconWidth={20}
        iconY={-30}
        fontSize={10}
        labelY={12}
        iconColor="red"
        reserved
      />,
    );
    const icon = one(svg, "g[clip-path] svg");
    expect(icon).toHaveAttribute("width", "20");
    expect(icon).toHaveAttribute("y", "-30");
    expect(icon).toHaveClass("icon-color-main-red", "color-reserved");
    expect(one(svg, "text")).toHaveAttribute("font-size", "10");
    expect(one(svg, "text")).toHaveAttribute("y", "12");
  });

  it("moves icon labels down on shields", async () => {
    const svg = await drawSvg(<Token icon="meat" label="A" shield="red" />);
    // Default y for a 12 font is 12 * 11 / 32 + 12, plus 5 for the shield
    expect(Number(one(svg, "text").getAttribute("y"))).toBeCloseTo(
      (12 * 11) / 32 + 12 + 5,
      5,
    );
  });

  it.for([
    ["ABCDEF", 0.6],
    ["ABCDE", 0.7],
    ["ABCD", 0.8],
  ])("shrinks the long %s label", async ([label, scale]) => {
    const svg = await drawSvg(<Token label={label} />);
    expect(fontSize(svg)).toBeCloseTo(25 * 0.7 * scale, 5);
  });

  it("shrinks labels with wide letters", async () => {
    const svg = await drawSvg(<Token label="WMN" />);
    expect(fontSize(svg)).toBeCloseTo(25 * 0.7 * 0.85 * 0.9 * 0.95, 5);
  });

  it("places labels at an explicit y", async () => {
    const svg = await drawSvg(<Token label="A" labelY={7} />);
    expect(one(svg, "text")).toHaveAttribute("y", "7");
  });

  it("colors shield labels like the top on inverse tokens", async () => {
    const svg = await drawSvg(
      <Token shield3 shield3TopCenter="red" inverse label="A" />,
    );
    expect(one(svg, "text")).toHaveAttribute("fill", gmt.red);
    // Inverse shield tops are gray
    const tops = all(svg, "path[fill='gray']");
    expect(tops).toHaveLength(3);
  });

  it("colors kite shield labels on reserved tokens", async () => {
    const svg = await drawSvg(<Token kiteshield="green" reserved label="K" />);
    expect(one(svg, "text")).toHaveAttribute("fill", gmt.green);
  });

  it("counter rotates inside rotated cities", async () => {
    const svg = await drawSvg(
      <CityRotateContext.Provider value={60}>
        <Token label="R" rotation={30} />
      </CityRotateContext.Provider>,
    );
    expect(one(svg, "svg > g")).toHaveAttribute("transform", "rotate(-30)");
  });

  it("ignores rotation on fixed tokens", async () => {
    const svg = await drawSvg(
      <CityRotateContext.Provider value={60}>
        <Token label="R" rotation={30} fixed />
      </CityRotateContext.Provider>,
    );
    expect(one(svg, "svg > g")).toHaveAttribute("transform", "rotate(0)");
  });
});

describe("Company tokens", () => {
  it("draws plain map company tokens when configured", async () => {
    const svg = await drawSvg(<GameMapCompanyToken abbrev="BRR" />, {
      search: "?config.plainMapCompanies=true",
    });
    expect(one(svg, "text")).toHaveTextContent("BRR");
    // Plain tokens are white with black labels
    expect(all(svg, "circle")[1]).toHaveAttribute("fill", gmt.white);
    expect(one(svg, "text")).toHaveAttribute("fill", gmt.black);
  });

  it("draws raw tokens for unknown map companies", async () => {
    const svg = await drawSvg(
      <GameMapCompanyToken abbrev="NOPE" label="NOPE" />,
    );
    expect(one(svg, "text")).toHaveTextContent("NOPE");
  });

  it("draws raw tokens for unknown companies", async () => {
    const svg = await drawSvg(<GameCompanyToken abbrev="NOPE" label="X" />);
    expect(one(svg, "text")).toHaveTextContent("X");
  });

  it("draws raw tokens when the game has no companies", async () => {
    const game = { ...games["18Test"], companies: undefined };
    const svg = await drawSvg(<GameCompanyToken abbrev="NOPE" label="X" />, {
      game,
    });
    expect(one(svg, "text")).toHaveTextContent("X");
  });

  it("draws a plain token without a company", async () => {
    const svg = await drawSvg(<CompanyToken label="Y" color="red" />);
    expect(one(svg, "text")).toHaveTextContent("Y");
    expect(all(svg, "circle")[1]).toHaveAttribute("fill", gmt.red);
  });

  it("skips company logos when configured", async () => {
    const company = { abbrev: "L", logo: "1830/BO", color: "blue" };
    let svg = await drawSvg(<CompanyToken company={company} />);
    expect(one(svg, "g[clip-path] svg")).not.toBeNull();
    svg = await drawSvg(<CompanyToken company={company} />, {
      search: "?config.companySvgLogos=none",
    });
    expect(one(svg, "g[clip-path] svg")).toBeNull();
    expect(one(svg, "text")).toHaveTextContent("L");
  });

  describe("second line", () => {
    const ys = (svg) =>
      all(svg, "text").map((t) => Number(t.getAttribute("y")));

    it("draws a second line below the label", async () => {
      const svg = await drawSvg(<Token label="AA" label2="Berlin" />);
      const [main, second] = all(svg, "text");
      expect(second).toHaveTextContent("Berlin");
      const [y1, y2] = ys(svg);
      expect(y2).toBeGreaterThan(y1);
      expect(Number(second.getAttribute("font-size"))).toBeLessThan(
        Number(main.getAttribute("font-size")),
      );
    });

    it("draws a second line above the label", async () => {
      const svg = await drawSvg(
        <Token label="AA" label2="Hi" label2Position="above" />,
      );
      const [y1, y2] = ys(svg);
      expect(y2).toBeLessThan(y1);
    });

    it("moves the main label away from the second line", async () => {
      const plain = ys(await drawSvg(<Token label="AA" />))[0];
      const below = ys(await drawSvg(<Token label="AA" label2="x" />))[0];
      const above = ys(
        await drawSvg(<Token label="AA" label2="x" label2Position="above" />),
      )[0];
      expect(below).toBeLessThan(plain);
      expect(above).toBeGreaterThan(plain);
    });

    it("leaves tokens without a second line alone", async () => {
      const svg = await drawSvg(<Token label="AA" />);
      expect(all(svg, "text")).toHaveLength(1);
    });

    it("uses the label color unless label2Color is set", async () => {
      let svg = await drawSvg(<Token label="AA" color="blue" label2="x" />);
      const [main, second] = all(svg, "text");
      expect(second).toHaveAttribute("fill", main.getAttribute("fill"));
      svg = await drawSvg(
        <Token label="AA" color="blue" label2="x" label2Color="red" />,
      );
      expect(all(svg, "text")[1]).toHaveAttribute("fill", gmt.red);
    });

    it("keeps the label stroke on the second line", async () => {
      const svg = await drawSvg(
        <Token
          label="AA"
          label2="x"
          label2Color="white"
          labelStrokeColor="black"
        />,
      );
      const [main, second] = all(svg, "text");
      expect(second).toHaveAttribute("stroke", main.getAttribute("stroke"));
    });

    it("keeps an explicit labelY and places the second line from it", async () => {
      const svg = await drawSvg(<Token label="AA" label2="x" labelY={5} />);
      const [y1, y2] = ys(svg);
      expect(y1).toBe(5);
      expect(y2).toBeGreaterThan(5);
    });

    it("works with an icon and label", async () => {
      const svg = await drawSvg(<Token icon="token" label="AA" label2="x" />);
      expect(all(svg, "text")).toHaveLength(2);
    });

    it("works on shield and destination tokens", async () => {
      let svg = await drawSvg(<Token shield label="AA" label2="x" />);
      expect(all(svg, "text")).toHaveLength(2);
      svg = await drawSvg(<Token destination label="AA" label2="x" />);
      expect(all(svg, "text")).toHaveLength(2);
    });

    it("draws no second line on logo tokens", async () => {
      const svg = await drawSvg(
        <Token logo="countries/ad" label="AD" label2="x" />,
      );
      expect(all(svg, "text")).toHaveLength(1);
    });
  });
});
