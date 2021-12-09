import { gql } from "apollo-server-core";

export const userTypeDefs = gql`
  scalar Upload

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
      image: Upload
    ): UserResult
    logout: Boolean
    forgotPassword(email: String!): Boolean
    changePassword(token: String!, password: String!): ChangeResult
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

  type Success {
    message: String!
  }

  union UserResult = User | Errors
  union ChangeResult = Success | Errors
`;
