import { auth } from "../firebase";
import { doCreateUser, getOneUser } from "../firebase/db";

export async function signIn(email, password) {
  let result = {};
  await auth
    .doSignInWithEmailAndPassword(email, password)
    .then(async (res) => {
      const snap = await getOneUser(res.user.uid);
      const data = {
        ...snap.data(),
        uid: res.user.uid,
      };
      result = { isOk: true, data: data };
    })
    .catch((err) => {
      result = {
        isOk: false,
        message: err.message,
      };
    });
  return result;
}

export async function createAccount(value) {
  const { email, password, initials, fullname, isAdmin } = value;
  console.log(isAdmin)
  let result = {};

  await auth
    .doCreateUserWithEmailAndPassword(email, password)
    .then(async (res) => {
      const { uid } = res.user;
      await doCreateUser(uid, initials, fullname, email, isAdmin);
      result = { isOk: true };
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
  let result = {};
  await auth
    .doPasswordReset(email)
    .then((res) => {
      console.log(res);
      result = { isOk: true };
    })
    .catch((err) => {
      result = { isOk: false, message: err.message };
    });
  return result;
}
