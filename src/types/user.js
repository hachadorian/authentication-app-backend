import { gql } from "apollo-server-core";

export const userTypeDefs = gql`
  type Query {
    hello: String!
    me: User!
  }

  type Mutation {
    register(email: String!, password: String!): UserResult
    login(email: String!, password: String!): UserResult
    update(input: UserInput): User
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

  input UserInput {
    id: String
    email: String
    password: String
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
