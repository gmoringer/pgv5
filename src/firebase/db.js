import { db } from "./firebase";
import Firebase from "firebase";
import { AuthProvider, useAuth } from "../contexts/auth";

// Property API

export const getAllProperties = () => db.collection("properties").get();

export const deleteOneProperty = (key) =>
  db.collection("properties").doc(key).delete();

export const addNewProperty = async (property, user) => {
  const lastNr = await getLastProperty();
  // console.log(lastNr.docs[0].data());
  const propNr =
    lastNr.docs.length === 0
      ? parseInt(process.env.REACT_APP_FIRST_PROP_NR)
      : lastNr.docs[0].data().propertynr + 1;
  return db.collection("properties").add({
    ...property,
    date: Firebase.firestore.Timestamp.now(),
    am: user.uid,
    propertynr: propNr,
  });
};

export const getLastProperty = () =>
  db.collection("properties").orderBy("propertynr", "desc").limit(1).get();

// USER API

export const doCreateUser = (id, initials, fullname, email) =>
  db.collection("users").doc(id).set({
    initials,
    fullname,
    email,
  });

export const getOneUser = (id) => db.collection("users").doc(id).get();
export const getAllUsers = () => db.collection("users").get();

// export const doCreateUser = (id, username, email) =>
//   db.ref(`users/${id}`).set({
//     username,
//     email,
//   });

// export const onceGetUsers = () => db.ref("users").once("value");

// // Chat API

// export const doCreateMessage = (userId, text) =>
//   db.ref("messages").push({
//     userId,
//     text,
//   });

// export const onMessageAdded = (callback) =>
//   db.ref("messages").orderByKey().limitToLast(100).on("child_added", callback);
