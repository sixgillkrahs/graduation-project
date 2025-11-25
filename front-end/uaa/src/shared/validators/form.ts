const getPasswordError = (value: string) => {
  if (value.length < 4) {
    return "Password must be 4 characters or more";
  }
  if ((value.match(/[A-Z]/g) || []).length < 1) {
    return "Password needs at least 1 uppercase letter";
  }
  if ((value.match(/[^a-z]/gi) || []).length < 1) {
    return "Password needs at least 1 symbol";
  }

  return null;
};

const getEmailError = (email: string) => {
  console.log(email);
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  if (email.length > 254) {
    return "Email must be less than 255 characters";
  }

  return null;
};

export { getPasswordError, getEmailError };
