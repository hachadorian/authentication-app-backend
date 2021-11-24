import { makeExecutableSchema } from "@graphql-tools/schema";
import { userTypeDefs } from "./types/user";
import { userResolver } from "./resolvers/user";
import { merge } from "lodash";

export const schema = makeExecutableSchema({
  typeDefs: userTypeDefs,
  resolvers: userResolver,
});
