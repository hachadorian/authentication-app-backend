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
    ): User
    uploadFile(file: Upload!): File
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

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Errors {
    message: String!
  }

  union UserResult = User | Errors
`;
