// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter, useLocation } from "react-router";

import {
  useBooleanParam,
  useIntParam,
  useRangeParam,
  useStringParam,
} from "@/util/query";

// Renders a query hook at a url and also returns the current search string
const atUrl = (useHook, search = "") => {
  const { result } = renderHook(
    () => ({ hook: useHook(), search: useLocation().search }),
    {
      wrapper: ({ children }) =>
        createElement(
          MemoryRouter,
          { initialEntries: [`/${search}`] },
          children,
        ),
    },
  );
  return {
    value: () => result.current.hook[0],
    set: (value) => act(() => result.current.hook[1](value)),
    search: () => result.current.search,
  };
};

describe("useRangeParam", () => {
  const initial = [0, 10];

  it("defaults to a copy of the initial range", () => {
    const param = atUrl(() => useRangeParam("range", initial));
    expect(param.value()).toEqual([0, 10]);
    expect(param.value()).not.toBe(initial);
  });

  it("reads the range from the url", () => {
    const param = atUrl(() => useRangeParam("range", initial), "?range=2_5");
    expect(param.value()).toEqual([2, 5]);
  });

  it("writes ranges to the url and removes the initial range", () => {
    const param = atUrl(() => useRangeParam("range", initial), "?a=1");
    param.set([3, 4]);
    expect(param.search()).toBe("?a=1&range=3_4");
    expect(param.value()).toEqual([3, 4]);

    param.set([0, 10]);
    expect(param.search()).toBe("?a=1");
  });
});

describe("useIntParam", () => {
  it("reads numbers from the url with a default", () => {
    expect(atUrl(() => useIntParam("page", 1)).value()).toBe(1);
    expect(atUrl(() => useIntParam("page", 1), "?page=3").value()).toBe(3);
  });

  it("writes numbers and removes the initial value or zero", () => {
    const param = atUrl(() => useIntParam("page", 1));
    param.set(4);
    expect(param.search()).toBe("?page=4");
    expect(param.value()).toBe(4);

    param.set(1);
    expect(param.search()).toBe("");

    param.set(4);
    param.set();
    expect(param.search()).toBe("");
  });
});

describe("useBooleanParam", () => {
  it("is true when the key is in the url", () => {
    expect(atUrl(() => useBooleanParam("print")).value()).toBe(false);
    expect(atUrl(() => useBooleanParam("print"), "?print").value()).toBe(true);
  });

  it("toggles the key in the url", () => {
    const param = atUrl(() => useBooleanParam("print"));
    param.set();
    expect(param.search()).toBe("?print=true");
    expect(param.value()).toBe(true);

    param.set();
    expect(param.search()).toBe("");
    expect(param.value()).toBe(false);
  });
});

describe("useStringParam", () => {
  it("reads and decodes strings from the url with a default", () => {
    expect(atUrl(() => useStringParam("q", "all")).value()).toBe("all");
    expect(atUrl(() => useStringParam("q", "all"), "?q=a%2520b").value()).toBe(
      "a b",
    );
  });

  it("writes encoded strings and removes the initial or empty value", () => {
    const param = atUrl(() => useStringParam("q", "all"));
    param.set("a b");
    expect(param.value()).toBe("a b");
    expect(param.search()).toBe("?q=a%2520b");

    param.set("all");
    expect(param.search()).toBe("");

    param.set("x");
    param.set("");
    expect(param.search()).toBe("");
  });
});
