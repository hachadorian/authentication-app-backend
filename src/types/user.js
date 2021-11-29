import { gql } from "apollo-server-core";

export const userTypeDefs = gql`
  type Query {
    hello: String!
    me: User!
  }

  type Mutation {
    register(email: String!, password: String!): UserResult
    login(email: String!, password: String!): UserResult
    update(
      email: String
      password: String
      name: String
      bio: String
      phone: String
      image: String
    ): User
  }

  type User {
    id: String
    email: String!
    password: String!
    name: String
    bio: String
    phone: String
    image: String
  }

  type Errors {
    message: String!
  }

  union UserResult = User | Errors
`;
