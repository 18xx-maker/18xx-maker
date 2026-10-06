import { format } from "@/util/currency";

const game = { info: { currency: "$#" } };
const n = (v) => Number(v).toLocaleString([], { minimumFractionDigits: 0 });

describe("format", () => {
  it("uses the game currency when the config formats the value", () => {
    expect(format(1100, game, true)).toBe(`$${n(1100)}`);
    expect(format(80, { info: { currency: "#kr" } }, true)).toBe("80kr");
  });

  it("prints the plain number when nothing formats it", () => {
    expect(format(1100, game, false)).toBe("1100");
  });

  it("replaces the first # of a format string", () => {
    expect(format(300, game, true, "#G")).toBe("300G");
    expect(format(300, game, true, "# credits")).toBe("300 credits");
    expect(format(1100, game, true, "#G")).toBe(`${n(1100)}G`);
    expect(format(5, game, true, "# of #")).toBe("5 of #");
  });

  it("lets the format beat the config toggle and the game currency", () => {
    expect(format(300, game, false, "#G")).toBe("300G");
    expect(format(300, undefined, false, "-#")).toBe("-300");
  });

  it("ignores an empty format", () => {
    expect(format(300, game, true, "")).toBe("$300");
    expect(format(300, game, false, "")).toBe("300");
  });

  it("prints a string value as is, ignoring the format", () => {
    expect(format("Free", game, true, "#G")).toBe("Free");
  });

  it("keeps null and undefined null", () => {
    expect(format(null, game, true, "#G")).toBeNull();
    expect(format(undefined, game, true, "#G")).toBeNull();
  });
});
