import { makeExecutableSchema } from "@graphql-tools/schema";
import { userTypeDefs } from "./types/user";
import { userResolver } from "./resolvers/user";
import { merge } from "lodash";
import { GraphQLUpload } from "graphql-upload";

export const schema = makeExecutableSchema({
  typeDefs: userTypeDefs,
  resolvers: merge(userResolver, { Upload: GraphQLUpload }),
});
