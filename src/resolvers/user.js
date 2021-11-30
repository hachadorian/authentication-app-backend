import { dbAccess } from "../utils/dbAccess";
import bcrypt from "bcrypt";
import { validate } from "../utils/validate";
import { v4 as uuid } from "uuid";
import { uploadFile } from "../utils/awsS3Uploader";

export const userResolver = {
  Query: {
    hello: () => "hello",
    me: async (root, args, context) => {
      const user = await dbAccess.findOne("user", {
        field: "id",
        value: context.req.session.qid,
      });
      return user;
    },
  },
  Mutation: {
    register: async (root, args, context) => {
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
        context.req.session.qid = createdUser.id;
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
    update: async (root, args, context) => {
      const user = await dbAccess.findOne("user", {
        field: "id",
        value: context.req.session.qid,
      });

      Object.keys(user).map(async (key) => {
        if (args[key]) {
          if (key === "password") {
            const hashedPassword = await bcrypt.hash(args[key], 10);
            user[key] = hashedPassword;
          } else if (key === "image") {
            const file = await args.image;
            const location = await uploadFile(context.req.session.qid, file);
            user[key] = location;
          } else {
            user[key] = args[key];
          }
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await dbAccess.updateOne("user", { field: "id", value: user.id }, user);
      return user;
    },
    uploadFile: async (root, args, context) => {
      const file = await args.file;
      await uploadFile(context.req.session.qid, file);
      return file.Location;
      //file.location
    },
  },
};
