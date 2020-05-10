import { sidesFromTrack, sidesFromTile } from "./Track.jsx";

describe("sidesFromTrack", () => {
  let type = type => ({
    side: 1,
    type
  });

  describe("with an empty argument", () => {
    it("should return []", () => {
      expect(sidesFromTrack()).toEqual([]);
      expect(sidesFromTrack(null)).toEqual([]);
    });
  });

  describe("with custom track", () => {
    it("should return true if we tell it to", () => {
      expect(sidesFromTrack(type("custom"))).toEqual([]);
      expect(sidesFromTrack({
        side: 1,
        sides: [2,3],
        type: "custom"
      })).toEqual([2,3]);
    });
  });

  describe("with a single track", () => {
    it("should return a single answer", () => {
      expect(sidesFromTrack(type("offboard"))).toEqual([1]);
      expect(sidesFromTrack(type("stub"))).toEqual([1]);
      expect(sidesFromTrack(type("stop"))).toEqual([1]);
      expect(sidesFromTrack(type("mid"))).toEqual([]);
      expect(sidesFromTrack(type("straight"))).toEqual([1,4]);
      expect(sidesFromTrack(type("straightStop"))).toEqual([1]);
      expect(sidesFromTrack(type("gentle"))).toEqual([1,3]);
      expect(sidesFromTrack(type("gentleStop"))).toEqual([1]);
      expect(sidesFromTrack(type("gentleStopRev"))).toEqual([1]);
      expect(sidesFromTrack(type("sharp"))).toEqual([1,2]);
      expect(sidesFromTrack(type("sharpStop"))).toEqual([1]);
      expect(sidesFromTrack(type("sharpStopRev"))).toEqual([1]);
      expect(sidesFromTrack(type("bent"))).toEqual([1,4]);
      expect(sidesFromTrack(type("city"))).toEqual([1]);
      expect(sidesFromTrack(type())).toEqual([1]);
    });
  });
});

describe("sidesFromTile", () => {
  let type = type => ({
    track: [{
      side: 1,
      type
    }]
  });

  describe("with an empty argument", () => {
    it("should return []", () => {
      expect(sidesFromTile()).toEqual([]);
      expect(sidesFromTile(null)).toEqual([]);
      expect(sidesFromTile({})).toEqual([]);
    });
  });

  describe("with custom track", () => {
    it("should return true if we tell it to", () => {
      expect(sidesFromTile(type("custom"))).toEqual([]);
      expect(sidesFromTile({
        track: [{
          side: 1,
          sides: [2,3],
          type: "custom"
        }]
      })).toEqual([2,3]);
    });
  });

  describe("with a single track", () => {
    it("should return a single answer", () => {
      expect(sidesFromTile(type("offboard"))).toEqual([1]);
      expect(sidesFromTile(type("stub"))).toEqual([1]);
      expect(sidesFromTile(type("stop"))).toEqual([1]);
      expect(sidesFromTile(type("mid"))).toEqual([]);
      expect(sidesFromTile(type("straight"))).toEqual([1,4]);
      expect(sidesFromTile(type("straightStop"))).toEqual([1]);
      expect(sidesFromTile(type("gentle"))).toEqual([1,3]);
      expect(sidesFromTile(type("gentleStop"))).toEqual([1]);
      expect(sidesFromTile(type("gentleStopRev"))).toEqual([1]);
      expect(sidesFromTile(type("sharp"))).toEqual([1,2]);
      expect(sidesFromTile(type("sharpStop"))).toEqual([1]);
      expect(sidesFromTile(type("sharpStopRev"))).toEqual([1]);
      expect(sidesFromTile(type("bent"))).toEqual([1,4]);
      expect(sidesFromTile(type("city"))).toEqual([1]);
      expect(sidesFromTile(type())).toEqual([1]);
    });
  });
});
