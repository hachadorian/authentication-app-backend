export const validate = (options) => {
  const numberPattern = /^[0-9]+$/;

  if (options.email && !options.email.includes("@")) {
    return {
      __typename: "Errors",
      message: "must use a valid email",
    };
  }

  if (options.password && options.password.length <= 2) {
    return {
      __typename: "Errors",
      message: "password length must be greater than 2",
    };
  }

  if (options.phone) {
    if (options.phone.length !== 10) {
      return {
        __typename: "Errors",
        message: "phone number must be exactly 10 digits",
      };
    }
    console.log(numberPattern.test(options.phone));
    if (!numberPattern.test(options.phone)) {
      return {
        __typename: "Errors",
        message: "phone number must contain only digits",
      };
    }
  }

  return null;
};
