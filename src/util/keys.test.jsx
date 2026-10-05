import { isControlTarget } from "@/util/keys";

const target = (html, selector) => {
  document.body.innerHTML = html;
  return { target: document.querySelector(selector) };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("isControlTarget", () => {
  it.each([
    ["<input id='t'>", "#t"],
    ["<textarea id='t'></textarea>", "#t"],
    ["<select id='t'></select>", "#t"],
    ["<button role='switch'><span id='t'></span></button>", "#t"],
    ["<div role='combobox'><span id='t'></span></div>", "#t"],
    ["<button role='checkbox' id='t'></button>", "#t"],
    ["<span role='slider' id='t'></span>", "#t"],
  ])("is true for keys typed into %s", (html, selector) => {
    expect(isControlTarget(target(html, selector))).toBe(true);
  });

  it("is false for other elements", () => {
    expect(
      isControlTarget(target("<button><span id='t'></span></button>", "#t")),
    ).toBe(false);
  });

  it("is false for targets that aren't elements", () => {
    expect(isControlTarget({ target: window })).toBe(false);
    expect(isControlTarget({ target: document })).toBe(false);
  });
});
