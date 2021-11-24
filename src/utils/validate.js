export const validate = (options) => {
  if (!options.email.includes("@")) {
    return {
      __typename: "Errors",
      message: "must use a valid email",
    };
  }

  if (options.password.length <= 2) {
    return {
      __typename: "Errors",
      message: "password length must be greater than 2",
    };
  }
  return null;
};
