import { auth } from "../firebase";

export async function signIn(email, password) {
  let result = {};
  await auth
    .doSignInWithEmailAndPassword(email, password)
    .then((res) => {
      console.log(res);
      result = { isOk: true, data: res.user };
    })
    .catch((err) => {
      result = {
        isOk: false,
        message: err.message,
      };
    });
  return result;
}

export async function createAccount(email, password) {
  let result = {};

  await auth
    .doCreateUserWithEmailAndPassword(email, password)
    .then((res) => {
      result = { isOk: true };
      console.log(res);
    })
    .catch((err) => {
      result = { isOk: false, message: err.message };
    });
  return result;
}

export async function changePassword(email, recoveryCode) {
  try {
    // Send request
    console.log(email, recoveryCode);

    return {
      isOk: true,
    };
  } catch {
    return {
      isOk: false,
      message: "Failed to change password",
    };
  }
}

export async function resetPassword(email) {
  try {
    // Send request
    console.log(email);

    return {
      isOk: true,
    };
  } catch {
    return {
      isOk: false,
      message: "Failed to reset password",
    };
  }
}
