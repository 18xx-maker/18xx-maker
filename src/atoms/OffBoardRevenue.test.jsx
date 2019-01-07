import { splitRevenues } from "./OffBoardRevenue";

describe("splitRevenues", () => {
  it("Should not split if rows < 2", () => {
    expect(splitRevenues(undefined, [1,2,3])).toEqual([[1,2,3]]);
    expect(splitRevenues(null, [1,2,3])).toEqual([[1,2,3]]);
    expect(splitRevenues(-1, [1,2,3])).toEqual([[1,2,3]]);
    expect(splitRevenues(0, [1,2,3])).toEqual([[1,2,3]]);
    expect(splitRevenues(1, [1,2,3])).toEqual([[1,2,3]]);
  });

  it("Should not split a tiny array", () => {
    expect(splitRevenues(2, [1])).toEqual([[1]]);
    expect(splitRevenues(3, [1])).toEqual([[1]]);
    expect(splitRevenues(99, [1])).toEqual([[1]]);
  });

  it("Should split a small array", () => {
    expect(splitRevenues(2, [1,2])).toEqual([[1],[2]]);
  });

  it("Should split a small array into 3 rows", () => {
    expect(splitRevenues(3, [1,2])).toEqual([[1],[2]]);
    expect(splitRevenues(3, [1,2,3])).toEqual([[1],[2],[3]]);
  });

  it("Should split a bigger array into 3 rows", () => {
    expect(splitRevenues(3, [1,2,3,4,5,6])).toEqual([[1,2],[3,4],[5,6]]);
    expect(splitRevenues(3, [1,2,3,4,5,6,7,8])).toEqual([[1,2,3],[4,5,6],[7,8]]);
  });
});
