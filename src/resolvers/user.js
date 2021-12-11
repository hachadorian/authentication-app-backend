import { dbAccess } from "../utils/dbAccess";
import bcrypt from "bcrypt";
import { validate } from "../utils/validate";
import { v4 as uuid } from "uuid";
import { uploadFile } from "../utils/awsS3Uploader";
import { sendEmail } from "../utils/sendEmail";
import dotenv from "dotenv";

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
      if (insert && insert.__typename !== "Errors") {
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

      const errors = validate({
        email: args.email,
        password: args.password,
        phone: args.phone,
      });

      if (errors) {
        return errors;
      }

      Object.keys(user).map(async (key) => {
        if (args[key]) {
          if (key === "password") {
            const hashedPassword = await bcrypt.hash(args[key], 10);
            user[key] = hashedPassword;
          } else if (key === "image") {
            const file = await args.image;
            const fileType = file.mimetype.split("/");
            if (fileType[0] !== "image") {
              return {
                __typename: "Errors",
                message: "file must be image",
              };
            }
            const location = await uploadFile(context.req.session.qid, file);
            user[key] = location;
          } else {
            user[key] = args[key];
          }
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await dbAccess.updateOne("user", { field: "id", value: user.id }, user);
      return {
        __typename: "User",
        ...user,
      };
    },
    logout: async (root, args, context) => {
      return new Promise((resolve) =>
        context.req.session.destroy((err) => {
          context.res.clearCookie("qid");
          if (err) {
            console.log(err);
            resolve(false);
            return;
          }

          resolve(true);
        })
      );
    },
    forgotPassword: async (root, args, context) => {
      dotenv.config();
      const user = await dbAccess.findOne("user", {
        field: "email",
        value: args.email,
      });

      if (!user) {
        return true;
      }

      const token = uuid();
      await context.redisClient.set(token, user.id, "ex", 1000 * 60 * 60 * 3);

      await sendEmail(
        args.email,
        `link to reset your password <a href="${process.env.ORIGIN}/change-password/${token}">reset password</a>`
      );

      return true;
    },
    changePassword: async (root, args, context) => {
      const errors = validate({
        password: args.password,
      });

      if (errors) {
        return errors;
      }

      var userid;
      context.redisClient.get(args.token, (err, val) => {
        if (err || !val) {
          console.error(err);
          return {
            __typename: "Errors",
            message: "token is not valid",
          };
        }
        userid = val;
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = await dbAccess.findOne("user", {
        field: "id",
        value: userid,
      });

      const hashedPassword = await bcrypt.hash(args.password, 10);
      await dbAccess.updateOne(
        "user",
        { field: "id", value: userid },
        { ...user, password: hashedPassword }
      );

      return {
        __typename: "Success",
        message: "password successfully changed",
      };
    },
  },
};
