/* eslint-disable testing-library/no-node-access, testing-library/no-container, jest-dom/prefer-to-have-attribute -- the images are bare svg elements with no role */
import { render } from "@testing-library/react";

import CustomSvg from "@/components/atoms/CustomSvg";

const ids = (container) =>
  Array.from(container.querySelectorAll("[id]")).map((el) => el.id);

const GRADIENT = `<svg viewBox="0 0 10 10">
  <defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient>
  <clipPath id="c"><rect width="5" height="5"/></clipPath></defs>
  <path class="color-main" d="M0 0h10v10z" fill="url(#g)" clip-path="url(#c)" style="stroke:url(#g)"/>
  <use href="#c"/>
</svg>`;

describe("CustomSvg", () => {
  it("draws a nested svg sized by its props and keeps the color classes", () => {
    const { container } = render(
      <svg>
        <CustomSvg
          svg={GRADIENT}
          className="icon-color-main-red"
          width="25"
          height="25"
          x="-12.5"
          y="-12.5"
        />
      </svg>,
    );
    const nested = container.querySelector("svg > svg");
    expect(nested.getAttribute("width")).toBe("25");
    expect(nested.getAttribute("x")).toBe("-12.5");
    expect(nested.getAttribute("viewBox")).toBe("0 0 10 10");
    expect(nested.getAttribute("class")).toBe("icon-color-main-red");
    expect(container.querySelector("path").getAttribute("class")).toBe(
      "color-main",
    );
  });

  it("uses the width and height of the file as the view box when it has none", () => {
    const { container } = render(
      <svg>
        <CustomSvg
          svg='<svg width="30" height="20"><path d="M0 0h30v20z"/></svg>'
          width="25"
          height="25"
        />
      </svg>,
    );
    expect(container.querySelector("svg > svg").getAttribute("viewBox")).toBe(
      "0 0 30 20",
    );
  });

  it("gives the same image used twice different ids and follows the references", () => {
    const { container } = render(
      <svg>
        <CustomSvg svg={GRADIENT} />
        <CustomSvg svg={GRADIENT} />
      </svg>,
    );
    const all = ids(container);
    expect(all).toHaveLength(4);
    expect(new Set(all).size).toBe(4);
    for (const id of all) expect(id).not.toBe("g");

    const paths = Array.from(container.querySelectorAll("path"));
    const first = ids(paths[0].closest("svg"));
    const [gradient, clip] = first;
    expect(paths[0].getAttribute("fill")).toBe(`url(#${gradient})`);
    expect(paths[0].getAttribute("clip-path")).toBe(`url(#${clip})`);
    expect(paths[0].style.stroke).toContain(gradient);
    expect(container.querySelector("use").getAttribute("href")).toBe(
      `#${clip}`,
    );
    // The second one refers to its own ids
    expect(paths[1].getAttribute("fill")).not.toBe(
      paths[0].getAttribute("fill"),
    );
  });

  it("draws nothing for a document that is not an svg", () => {
    const { container } = render(
      <svg>
        <CustomSvg svg="<html/>" />
      </svg>,
    );
    expect(container.querySelector("svg > svg")).toBeNull();
  });

  it("puts nothing of the file in the page but the allowed elements", () => {
    const { container } = render(
      <svg>
        <CustomSvg
          svg={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" onload="window.hacked=1">
            <script>window.hacked = 1</script>
            <image href="https://example.com/x.png"/>
            <path d="M0 0" onclick="window.hacked = 1" fill="javascript:window.hacked=1"/>
          </svg>`}
        />
      </svg>,
    );
    expect(window.hacked).toBeUndefined();
    expect(
      container.querySelector("script, image, [onclick], [onload]"),
    ).toBeNull();
    expect(container.querySelector("path").hasAttribute("fill")).toBe(false);
  });
});
