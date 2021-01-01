import { db, firebase } from "./firebase";
import Firebase from "firebase";
import { AuthProvider, useAuth } from "../contexts/auth";

// Property API

export const getAllProperties = () => db.collection("properties").get();

export const getAllVendors = () => db.collection("vendors").get();

export const deleteOneVendor = (key) =>
  db.collection("vendors").doc(key).delete();

export const deleteOneProperty = (key) => {
  db.collection('properties').doc(key).update({
    "active": false
  })
}

export const addNewVendor = async (vendor, user) => {
  return db.collection("vendors").add({
    ...vendor,
    date: Firebase.firestore.Timestamp.now(),
    am: user.uid,
  });
};

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
    active: true
  });
};
export const getLastProperty = () =>
  db.collection("properties").orderBy("propertynr", "desc").limit(1).get();

export const getLastVendor = () =>
  db.collection("vendor").orderBy("vendornr", "desc").limit(1).get();

export const updateOneProperty = async (key, value) =>
  await db
    .collection("properties")
    .doc(key)
    .update({ ...value });

export const updateOneVendor = async (key, value) =>
  await db
    .collection("vendors")
    .doc(key)
    .update({ ...value });

// JOB API

export const getAllJobs = () => db.collection("jobs").get();

export const deleteOneJob = (key) => {
    db.collection('jobs').doc(key).update({
    "active": false
  })
  }

export const addNewJob = async (job, user) => {
  const lastNr = await getLastJob();
  const jobNr =
    lastNr.docs.length === 0
      ? parseInt(process.env.REACT_APP_FIRST_JOB_NR)
      : lastNr.docs[0].data().jobnr + 1;
  db.collection("jobs").add({
    ...job,
    date: Firebase.firestore.Timestamp.now(),
    jobnr: jobNr,
    am: user.uid,
    materialssum: 0,
    laborsum: 0,
    active: true
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
      active: true
    })
    .then((res) => updateJobPrice(parseInt(po.amount), po.jobnr));
};

export const getOnePo = async (key) => db.collection("pos").doc(key).get();

export const updatePo = async (key, value) => {
  const poOld = await getOnePo(key);
  const poOldData = poOld.data();

  const oldValue = poOldData.amount;
  const newValue = value.amount ? value.amount : poOldData.amount;
  const oldJob = poOldData.jobnr;
  const newJob = value.jobnr ? value.jobnr : oldJob;

  await db
    .collection("pos")
    .doc(key)
    .update({ ...value, date: Firebase.firestore.Timestamp.now() })
    .then(updateJobPrice(-oldValue, oldJob))
    .then(updateJobPrice(newValue, newJob));
};

export const deleteOnePo = async (key) => {
  const poToDelete = await getOnePo(key);
  const { amount, jobnr } = poToDelete.data();
  db.collection("pos")
    .doc(key)
    .delete()
    .then(() => {
      updateJobPrice(-1 * amount, jobnr);
    });
};

//API LABOR
export const getAllLaborLogs = () => db.collection("labor").get();

export const addNewLaborLog = async (ll, user) => {
  db.collection("labor")
    .add({
      ...ll,
      am: user.uid,
    })
    .then((res) =>
      updateLaborPrice(parseInt(ll.hours * ll.wage * 1.25), ll.jobnr)
    );
};

export const updateLaborPrice = (value, job) => {
  const amount = parseInt(value);
  const increment = firebase.firestore.FieldValue.increment(amount);
  db.collection("jobs").doc(job).update({ laborsum: increment });
};

export const doCreateUser = (id, initials, fullname, email, isAdmin) => {
  return db.collection("users").doc(id).set({
    initials,
    fullname,
    email,
    isAdmin,
    isActive: true,
  });
};

export const getOneUser = (id) => db.collection("users").doc(id).get();
export const updateOneUser = (key, value) => {
  return db
    .collection("users")
    .doc(key)
    .update({ ...value });
};
export const getAllUsers = () => db.collection("users").get();

export const getPoTypes = () => {
  return db.collection("potypes").get();
};
