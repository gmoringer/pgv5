import { db, firebase } from "./firebase";
import Firebase from "firebase";

import { useAuth } from "../api/auth.js";

// const { user } = useAuth();

//Misc API
export const getAllVendors = () => db.collection("vendors").get();

export const getAllWorkers = () => db.collection("workers").get();

export const addNewWorker = (worker, user) => {
  return db.collection("workers").add({
    ...worker,
  });
};

export const updateOneWorker = (key, value) =>
  db
    .collection("workers")
    .doc(key)
    .update({ ...value });

export const deleteOneVendor = (key) =>
  db.collection("vendors").doc(key).delete();

// Property API

export const getAllProperties = () => db.collection("properties").get();
export const getAllJobTypes = () => db.collection("jobtypes").get();

export const deleteOneProperty = (key) => {
  db.collection("properties").doc(key).update({
    active: false,
  });
};

export const addNewVendor = (vendor, user) => {
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
    active: true,
  });
};

export const getLastProperty = () =>
  db.collection("properties").orderBy("propertynr", "desc").limit(1).get();

export const getOneProperty = (key) => {
  db.collection("properties").doc(key).get();
};

export const getLastVendor = () =>
  db.collection("vendor").orderBy("vendornr", "desc").limit(1).get();

export const updateOneProperty = (key, value) =>
  db
    .collection("properties")
    .doc(key)
    .update({ ...value });

export const updateOneVendor = (key, value) =>
  db
    .collection("vendors")
    .doc(key)
    .update({ ...value });

// JOB API

export const getAllJobs = () => db.collection("jobs").get();

export const deleteOneJob = (key) => {
  db.collection("jobs").doc(key).update({
    active: false,
  });
};

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
  });
};

export const updateOneJob = (key, value) =>
  db
    .collection("jobs")
    .doc(key)
    .update({ ...value });

export const getLastJob = () =>
  db.collection("jobs").orderBy("jobnr", "desc").limit(1).get();

export const updateJobPrice = (value, job) => {
  const amount = value;
  const increment = firebase.firestore.FieldValue.increment(amount);
  db.collection("jobs").doc(job).update({ materialssum: increment });
};

let eighteenMonthsAgo = new Date();
eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 13);

//PO API
export const getAllPos = () =>
  db.collection("pos").where("date", ">=", eighteenMonthsAgo).get();
export const getLastPo = () =>
  db.collection("pos").orderBy("ponr", "desc").limit(1).get();

export const addNewPo = async (po, user) => {
  const lastNr = await getLastPo();
  const poNr =
    lastNr.docs.length === 0
      ? parseInt(process.env.REACT_APP_FIRST_PO_NR)
      : lastNr.docs[0].data().ponr + 1;
  await db
    .collection("pos")
    .add({
      ...po,
      // date: Firebase.firestore.Timestamp.now(),
      ponr: poNr,
      am: user.uid,
    })
    .then((res) => {
      const increment = firebase.firestore.FieldValue.increment(po.amount);
      db.collection("jobs").doc(po.jobnr).update({ materialssum: increment });
    });
};

export const getOnePo = async (key) => db.collection("pos").doc(key).get();

export const updatePo = (key, value) => {
  async function getData() {
    return await getOnePo(key);
  }

  return getData().then(async (poOld) => {
    const poOldData = poOld.data();
    const oldValue = poOldData.amount;
    const newValue = value.amount;

    const delta = +(newValue - oldValue).toFixed(2);

    return await db
      .collection("pos")
      .doc(key)
      .update({ ...value })
      .then(async () => {
        if (typeof value.amount === "number") {
          const increment = firebase.firestore.FieldValue.increment(delta);
          await db
            .collection("jobs")
            .doc(poOldData.jobnr)
            .update({ materialssum: increment });
        }
      });
  });
};

export const getOneLl = async (key) =>
  await db.collection("labor").doc(key).get();

export const updateLaborLog = async (key, value) => {
  const llOld = await getOneLl(key);
  const llOldData = llOld.data();

  const prevValue = (llOldData.hours * llOldData.wage * 1.25).toFixed(2);
  const updatedData = { ...llOldData, ...value };

  const updatedValue = +(updatedData.hours * updatedData.wage * 1.25).toFixed(
    2
  );

  if (typeof updatedValue === "number") {
    const delta = -prevValue + updatedValue;
    const amount = parseInt(delta);
    const increment = firebase.firestore.FieldValue.increment(delta);
    db.collection("jobs").doc(llOldData.jobnr).update({ laborsum: increment });
    db.collection("labor")
      .doc(key)
      .update({ ...value, date: Firebase.firestore.Timestamp.now() });
  }
};

export const deleteOnePo = async (key) => {
  const poToDelete = await getOnePo(key);
  const { amount, jobnr } = poToDelete.data();
  await db
    .collection("pos")
    .doc(key)
    .delete()
    .then(() => {
      updateJobPrice(-amount.toFixed(2), jobnr);
    });
};

export const deleteOneLaborLog = async (key) => {
  const llToDelete = await getOneLl(key);
  const { wage, hours, jobnr } = llToDelete.data();
  await db
    .collection("labor")
    .doc(key)
    .delete()
    .then(() => {
      const increment = firebase.firestore.FieldValue.increment(
        -(wage * hours * 1.25).toFixed(2)
      );
      db.collection("jobs").doc(jobnr).update({ laborsum: increment });
    });
};

//API LABOR
export const getAllLaborLogs = () => db.collection("labor").get();

export const addNewLaborLog = (ll, user) => {
  db.collection("labor")
    .add({ ...ll, am: user.uid })
    .then((res) => {
      const sum = +(ll.wage * ll.hours * 1.25).toFixed(2);
      const increment = firebase.firestore.FieldValue.increment(
        +(ll.wage * ll.hours * 1.25).toFixed(2)
      );
      db.collection("jobs").doc(ll.jobnr).update({ laborsum: increment });
    });
};

// export const updateLaborPrice = (value, job) => {
//   const amount = parseInt(value);
//   const increment = firebase.firestore.FieldValue.increment(amount);
//   db.collection("jobs").doc(job).update({ laborsum: increment });
// };

export const doCreateUser = (
  id,
  initials,
  fullname,
  email,
  isAdmin,
  isExport
) => {
  return db.collection("users").doc(id).set({
    initials,
    fullname,
    email,
    isAdmin,
    isExport,
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
