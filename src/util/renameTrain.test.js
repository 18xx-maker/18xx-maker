import renameTrain from "@/util/renameTrain";

const t = (name, extra = {}) => ({ name, color: "gray", price: 1, ...extra });

describe("renameTrain", () => {
  it("rewrites string, array, {on,index} and mixed events", () => {
    const game = {
      trains: [
        t("2"),
        t("3", {
          rust: "2",
          phased: ["2", "5"],
          obsolete: { on: "2", index: 3 },
        }),
        t("4", { rust: ["2", { on: "2", index: 2 }, "x"] }),
      ],
    };
    const next = renameTrain(game, 0, "two");
    expect(next.trains[0].name).toBe("2");
    expect(next.trains[1]).toEqual({
      ...game.trains[1],
      rust: "two",
      phased: ["two", "5"],
      obsolete: { on: "two", index: 3 },
    });
    expect(next.trains[2].rust).toEqual(["two", { on: "two", index: 2 }, "x"]);
    expect(Object.keys(next.trains[1].obsolete)).toEqual(["on", "index"]);
    expect(Object.keys(next.trains[1])).toEqual(Object.keys(game.trains[1]));
  });

  it("rewrites available", () => {
    const game = { trains: [t("2"), t("3", { available: "2" })] };
    expect(renameTrain(game, 0, "x").trains[1].available).toBe("x");
  });

  it("rewrites events inside full back definitions but not their name", () => {
    const game = {
      trains: [t("2"), t("3", { back: t("2", { rust: "2" }) })],
    };
    const back = renameTrain(game, 0, "x").trains[1].back;
    expect(back.name).toBe("2");
    expect(back.rust).toBe("x");
  });

  it("rewrites phases[].train as string and array", () => {
    const game = {
      trains: [t("2")],
      phases: [
        { name: "2", train: "2" },
        { name: "3", train: ["2", "3"] },
        { name: "2" },
      ],
    };
    const next = renameTrain(game, 0, "x");
    expect(next.phases[0]).toEqual({ name: "2", train: "x" });
    expect(next.phases[1].train).toEqual(["x", "3"]);
    expect(next.phases[2]).toEqual({ name: "2" });
  });

  it("rewrites company string entries and references", () => {
    const game = {
      trains: [t("2")],
      companies: [
        {
          name: "A",
          trains: ["2", "3", { name: "2", quantity: 2 }, { name: "3" }],
        },
      ],
    };
    const next = renameTrain(game, 0, "x");
    expect(next.companies[0].trains).toEqual([
      "x",
      "3",
      { name: "x", quantity: 2 },
      { name: "3" },
    ]);
  });

  it("keeps the name of a full company train but rewrites its events", () => {
    const game = {
      trains: [t("2")],
      companies: [{ name: "A", trains: [t("2", { price: 5, rust: "2" })] }],
    };
    const own = renameTrain(game, 0, "x").companies[0].trains[0];
    expect(own.name).toBe("2");
    expect(own.rust).toBe("x");
  });

  it("returns the same object when nothing changes", () => {
    const game = { trains: [t("2"), t("3")] };
    expect(renameTrain(game, 0, "2")).toBe(game);
    expect(renameTrain(game, 5, "x")).toBe(game);
    expect(renameTrain(game, 0, "")).toBe(game);
    expect(renameTrain(game, 0, "   ")).toBe(game);
    expect(renameTrain({ trains: [{ name: 3 }] }, 0, "x")).toEqual({
      trains: [{ name: 3 }],
    });
  });

  it("leaves references when another train has the old name", () => {
    const game = { trains: [t("2"), t("2"), t("3", { rust: "2" })] };
    expect(renameTrain(game, 0, "x")).toBe(game);
    expect(renameTrain(game, 1, "x")).toBe(game);
  });

  it("still rewrites when the new name is another train's", () => {
    const game = { trains: [t("2"), t("3", { rust: "2" }), t("4")] };
    expect(renameTrain(game, 0, "4").trains[1].rust).toBe("4");
  });

  it("copes with missing or odd shapes", () => {
    for (const game of [
      { trains: false },
      { trains: [t("2")] },
      { trains: [t("2", { back: "x" })], phases: false, companies: false },
      { trains: [t("2")], companies: [{ trains: false }, {}] },
    ]) {
      expect(() => renameTrain(game, 0, "x")).not.toThrow();
    }
    expect(
      renameTrain({ trains: [t("2")], companies: [{ trains: false }] }, 0, "x"),
    ).toEqual({ trains: [t("2")], companies: [{ trains: false }] });
  });

  it("does not mutate the input", () => {
    const game = {
      trains: [t("2"), t("3", { rust: ["2"], back: t("b", { rust: "2" }) })],
      phases: [{ name: "a", train: ["2"] }],
      companies: [{ name: "A", trains: ["2", { name: "2" }] }],
    };
    const copy = structuredClone(game);
    renameTrain(game, 0, "x");
    expect(game).toEqual(copy);
  });
});
