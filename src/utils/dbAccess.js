import { db } from "../db/connection";

export const dbAccess = {
  findOne: async (table, fieldPair) => {
    return await db
      .select("*")
      .from(table)
      .where(fieldPair.field, fieldPair.value)
      .first();
  },
  findAll: async (table) => {
    return await db.select("*").from(table);
  },
  insertOne: async (table, object) => {
    try {
      await db(table).insert(object);
    } catch (err) {
      if (err.code === "23505") {
        return {
          __typename: "Errors",
          message: "duplicate record",
        };
      } else {
        return {
          __typename: "Errors",
          message: err.message,
        };
      }
    }
    return true;
  },
  deleteOne: async (table, fieldPair) => {
    await db(table).where(fieldPair.field, fieldPair.value).del();
    return true;
  },
  updateOne: async (table, fieldPair, object) => {
    await db(table).where(fieldPair.field, fieldPair.value).update(object);
    return true;
  },
};
