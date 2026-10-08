import { migrateSummary } from "@/util/storage/idb";
import { isUUID } from "#util/uuid";

describe("idb", () => {
  describe("migrateSummary", () => {
    describe("v1", () => {
      it("should set the version to 1", () => {
        expect(migrateSummary({})).toMatchObject({ version: 1 });
      });

      it("should set the id field", () => {
        const migrated = migrateSummary({});
        expect(migrated).toHaveProperty("id");
        expect(isUUID(migrated.id)).toBe(true);
      });

      it("should set the slug field", () => {
        const migrated = migrateSummary({});
        expect(migrated).toHaveProperty("slug");
        const [type, id] = migrated.slug.split(":");
        expect(isUUID(id)).toBe(true);
        expect(type).toBe("system");
      });

      it("should leave v1 summaries alone", () => {
        const summary = {
          id: crypto.randomUUID(),
          version: 1,
          foo: "foo",
        };

        expect(migrateSummary(summary)).toBe(summary);
      });
    });
  });
});
