import { dbAccess } from "../utils/dbAccess";
import bcrypt from "bcrypt";
import { validate } from "../utils/validate";
import { v4 as uuid } from "uuid";

export const userResolver = {
  Query: {
    hello: () => "hello",
    me: (root, args, context) => {
      return context.req.session;
    },
  },
  Mutation: {
    register: async (root, args) => {
      const errors = validate({
        email: args.email,
        password: args.password,
      });

      if (errors) {
        return errors;
      }

      const hashedPassword = await bcrypt.hash(args.password, 10);
      const createdUser = {
        id: uuid(),
        email: args.email,
        password: hashedPassword,
      };

      const insert = await dbAccess.insertOne("user", createdUser);
      if (insert) {
        return {
          __typename: "User",
          ...createdUser,
        };
      }

      return insert;
    },
    login: async (root, args, context) => {
      const user = await dbAccess.findOne("user", {
        field: "email",
        value: args.email,
      });

      if (!user) {
        return {
          __typename: "Errors",
          message: "email is incorrect",
        };
      }

      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) {
        return {
          __typename: "Errors",
          message: "password is incorrect",
        };
      }

      context.req.session.qid = user.id;

      return {
        __typename: "User",
        ...user,
      };
    },
  },
};
