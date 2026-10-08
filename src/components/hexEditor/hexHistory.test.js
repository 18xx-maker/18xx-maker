import {
  LIMIT,
  emptyHistory,
  historyKey,
  record,
  redo,
  undo,
} from "@/components/hexEditor/hexHistory";

describe("hex history", () => {
  it("undoes and redoes steps in order", () => {
    let h = record(record(emptyHistory(), "a"), "b");
    const first = undo(h, "c");
    expect(first.value).toBe("b");
    const second = undo(first.history, first.value);
    expect(second.value).toBe("a");
    expect(undo(second.history, second.value)).toBeNull();
    const again = redo(second.history, second.value);
    expect(again.value).toBe("b");
    expect(redo(again.history, again.value).value).toBe("c");
    h = redo(redo(second.history, "a").history, "b").history;
    expect(redo(h, "c")).toBeNull();
  });

  it("drops what was undone when a new change is made", () => {
    const undone = undo(record(emptyHistory(), "a"), "b");
    expect(undone.history.future).toEqual(["b"]);
    expect(record(undone.history, "a").future).toEqual([]);
  });

  it("keeps a limited number of steps and leaves its input alone", () => {
    let h = emptyHistory();
    for (let i = 0; i < LIMIT + 5; i++) h = record(h, i);
    expect(h.past).toHaveLength(LIMIT);
    expect(h.past[0]).toBe(5);
    const before = structuredClone(h);
    undo(h, "x");
    expect(h).toEqual(before);
  });

  it("reads the keys", () => {
    const key = (key, extra = {}) => historyKey({ key, ...extra });
    expect(key("z", { ctrlKey: true })).toBe("undo");
    expect(key("Z", { metaKey: true, shiftKey: true })).toBe("redo");
    expect(key("y", { ctrlKey: true })).toBe("redo");
    expect(key("z")).toBeNull();
    expect(key("z", { ctrlKey: true, altKey: true })).toBeNull();
    expect(key("y", { ctrlKey: true, shiftKey: true })).toBeNull();
  });
});
