import { v4 as uuidv4, validate } from "uuid";

import { migrateSummary } from "@/util/idb";

describe("idb", () => {
  describe("migrateSummary", () => {
    describe("v1", () => {
      it("should set the version to 1", () => {
        expect(migrateSummary({})).toMatchObject({ version: 1 });
      });

      it("should set the id field", () => {
        const migrated = migrateSummary({});
        expect(migrated).toHaveProperty("id");
        expect(validate(migrated.id)).toBe(true);
      });

      it("should set the slug field", () => {
        const migrated = migrateSummary({});
        expect(migrated).toHaveProperty("slug");
        const [type, id] = migrated.slug.split(":");
        expect(validate(id)).toBe(true);
        expect(type).toBe("system");
      });

      it("should leave v1 summaries alone", () => {
        const summary = {
          id: uuidv4(),
          version: 1,
          foo: "foo",
        };

        expect(migrateSummary(summary)).toBe(summary);
      });
    });
  });
});
