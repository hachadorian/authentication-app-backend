import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import express from "express";
import { schema } from "./schema";
import dotenv from "dotenv";
import http from "http";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";
import cors from "cors";

const main = async () => {
  dotenv.config();

  const app = express();
  const httpServer = http.createServer(app);
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    host: "localhost",
    port: 6379,
  });

  redisClient.on("connect", () => {
    console.log("connected to redis...");
  });

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 10,
        sameSite: "lax",
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

main().catch((err) => {
  console.error(err);
});
