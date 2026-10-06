import {
  GENTLE_RADIUS,
  ONE_TWENTY_DEGREES,
  SHARP_RADIUS,
  SIXTY_DEGREES,
  arcPosition,
  namedPosition,
} from "./trackGeometry";

// where a position puts a point (the Position component's transform)
const pointOf = ({ angle, percent }) => {
  const a = (angle * Math.PI) / 180;
  return [-75 * percent * Math.sin(a), 75 * percent * Math.cos(a)];
};

describe("namedPosition", () => {
  it("puts straight at the center", () => {
    expect(namedPosition("straight")).toEqual({ angle: 0, percent: 0 });
  });

  it("puts sharp at 30 degrees and 1/sqrt(3) of the apothem", () => {
    const p = namedPosition("sharp");
    expect(p.angle).toBe(30);
    expect(p.percent).toBeCloseTo(1 / Math.sqrt(3), 3);
  });

  it("puts gentle at 60 degrees and 2 - sqrt(3) of the apothem", () => {
    const p = namedPosition("gentle");
    expect(p.angle).toBe(60);
    expect(p.percent).toBeCloseTo(2 - Math.sqrt(3), 3);
  });

  it("rotates by side like a track", () => {
    expect(namedPosition("gentle", 3).angle).toBe(180);
    expect(namedPosition("sharp", 2).angle).toBe(90);
    expect(namedPosition("sharp", 6).angle).toBe(330);
    expect(namedPosition("straight", 4).angle).toBe(180);
    expect(namedPosition("sharp", 1)).toEqual(namedPosition("sharp"));
  });

  it("aligns perpendicular and parallel to the track", () => {
    expect(namedPosition("straight", 1, "perpendicular").rotation).toBe(0);
    expect(namedPosition("sharp", 1, "perpendicular").rotation).toBe(120);
    expect(namedPosition("gentle", 1, "perpendicular").rotation).toBe(150);
    expect(namedPosition("straight", 1, "parallel").rotation).toBe(90);
    expect(namedPosition("sharp", 1, "parallel").rotation).toBe(210);
    expect(namedPosition("gentle", 1, "parallel").rotation).toBe(240);
    expect(namedPosition("gentle", 3, "perpendicular").rotation).toBe(270);
  });

  it("has no rotation without align", () => {
    expect(namedPosition("sharp")).not.toHaveProperty("rotation");
  });

  it("is null for an unknown name", () => {
    expect(namedPosition("wide")).toBeNull();
  });

  it.each([
    ["sharp", SHARP_RADIUS, ONE_TWENTY_DEGREES],
    ["gentle", GENTLE_RADIUS, SIXTY_DEGREES],
  ])("puts %s on the midpoint of the drawn arc", (mid, radius, arcAngle) => {
    const [x, y] = pointOf(namedPosition(mid));
    const [ax, ay] = arcPosition(0.5, radius, arcAngle, 0);
    expect(x).toBeCloseTo(ax, 1);
    expect(y).toBeCloseTo(ay, 1);
  });
});
