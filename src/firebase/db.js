import { db, firebase } from "./firebase";
import Firebase from "firebase";
import { AuthProvider, useAuth } from "../contexts/auth";

// Property API

export const getAllProperties = () => db.collection("properties").get();

export const deleteOneProperty = (key) =>
  db.collection("properties").doc(key).delete();

export const addNewProperty = async (property, user) => {
  const lastNr = await getLastProperty();
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

export const updateOneProperty = async (key, value) =>
  await db
    .collection("properties")
    .doc(key)
    .update({ ...value });

// JOB API

export const getAllJobs = () => db.collection("jobs").get();
export const deleteOneJob = (key) => db.collection("jobs").doc(key).delete();
export const addNewJob = async (job, user) => {
  const lastNr = await getLastJob();
  console.log(job);
  const jobNr =
    lastNr.docs.length === 0
      ? parseInt(process.env.REACT_APP_FIRST_JOB_NR)
      : lastNr.docs[0].data().jobnr + 1;
  db.collection("jobs").add({
    ...job,
    date: Firebase.firestore.Timestamp.now(),
    jobnr: jobNr,
    am: user.uid,
  });
};

export const updateOneJob = async (key, value) =>
  await db
    .collection("jobs")
    .doc(key)
    .update({ ...value });

export const getLastJob = () =>
  db.collection("jobs").orderBy("jobnr", "desc").limit(1).get();

export const updateJobPrice = (value, job) => {
  const amount = parseInt(value);
  const increment = firebase.firestore.FieldValue.increment(amount);
  db.collection("jobs").doc(job).update({ materialssum: increment });
};

//PO API
export const getAllPos = () => db.collection("pos").get();
export const getLastPo = () =>
  db.collection("pos").orderBy("ponr", "desc").limit(1).get();
export const addNewPo = async (po, user) => {
  const lastNr = await getLastPo();
  const poNr =
    lastNr.docs.length === 0
      ? parseInt(process.env.REACT_APP_FIRST_PO_NR)
      : lastNr.docs[0].data().ponr + 1;
  db.collection("pos")
    .add({
      ...po,
      date: Firebase.firestore.Timestamp.now(),
      ponr: poNr,
      am: user.uid,
    })
    .then((res) => updateJobPrice(parseInt(po.amount), po.jobnr));
};

export const getOnePo = async (key) => db.collection("pos").doc(key).get();

export const updatePo = async (key, value) => {
  const poToUpdate = await getOnePo(key);
  const { amount, jobnr } = poToUpdate.data();
  console.log(amount, value);
  const delta = value.amount - amount;
  console.log(delta);

  return db
    .collection("pos")
    .doc(key)
    .update({ ...value })
    .then(updateJobPrice(delta, jobnr));
};

export const deleteOnePo = async (key) => {
  const poToDelete = await getOnePo(key);
  const { amount, jobnr } = poToDelete.data();
  db.collection("pos")
    .doc(key)
    .delete()
    .then(() => {
      console.log(`amount: ${amount}, jobnr: ${jobnr}`);
      updateJobPrice(-1 * amount, jobnr);
    });
};

// export const updateOnePo = async (key, value) => {
//   const poToUpdate = await getOnePo(key);
//   const { amount, jobnr } = poToUpdate.data();

//   const delta = value - amount;

//   return db
//     .collection("pos")
//     .doc(key)
//     .update()
//     .then(() => {
//       console.log(`amount: ${amount}, jobnr: ${jobnr}`);
//       updateJobPrice(delta, jobnr);
//     });
// };

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
