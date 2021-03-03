import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/auth";
import DataSource from "devextreme/data/data_source";
import { Item } from "devextreme-react/form";
import Firebase from "firebase";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Lookup,
  Editing,
  RequiredRule,
  Popup,
  Position,
  Form,
  Button,
  Export,
  Format,
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const PoListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [vendors, setVendors] = useState([]);
  const [properties, setProperties] = useState([]);
  const [potypes, setPoTypes] = useState();
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      signOut();
    }
  }, []);

  useEffect(() => {
    const result = [];
    async function fetchData() {
      return await db.getPoTypes();
    }

    fetchData().then((res) =>
      res.forEach((doc) => {
        result.push({ ...doc.data(), uid: doc.id });
      })
    );
    setPoTypes(result);
  }, []);

  useEffect(() => {
    db.getAllVendors().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setVendors(result);
    });
  }, []);

  useEffect(() => {
    db.getAllUsers().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setManagers(result);
    });
  }, []);

  useEffect(() => {
    const result = [];
    async function fetchdata() {
      return await db.getAllProperties().then((res) => {
        res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
        setProperties(result);
      });
    }
    fetchdata().then(
      db.getAllJobs().then((res) => {
        const jobsDownload = [];
        res.forEach((doc) => {
          const currentPropNr = result.find((prop) => {
            return prop.uid === doc.data().property;
          });

          if (currentPropNr) {
            jobsDownload.push({
              ...doc.data(),
              uid: doc.id,
              propertynr: currentPropNr.propertynr,
              editForAll: currentPropNr.editForAll
                ? currentPropNr.editForAll
                : false,
            });
          }
        });
        setJobs(jobsDownload);
      })
    );
  }, []);

  useEffect(() => {
    db.getAllProperties().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setProperties(result);
    });
  }, []);

  const store = useMemo(() => {
    const newStore = new DataSource({
      key: "uid",
      load: async () => {
        const result = [];
        const jobList = [];
        await db
          .getAllJobs()
          .then((snaps) =>
            snaps.forEach((doc) => jobList.push({ ...doc.data(), uid: doc.id }))
          );
        await db.getAllPos().then((snaps) =>
          snaps.forEach((snap) => {
            const data = snap.data();

            result.push({
              ...data,
              uid: snap.id,
              isPropManager: data.am === user.uid,
            });
          })
        );
        return result;
      },
      remove: async (key) => {
        await db.deleteOnePo(key).then(() => store.load());
      },
      insert: async (values) => {
        await db.addNewPo(values, user);
        setIsEditing(false);
        setFormOpen(false);
        store.load();
      },
      update: async (key, value) => {
        await db.updatePo(key, value);
        setFormOpen(false);
        setIsEditing(false);
        store.load();
      },
    });

    if (!user.isAdmin) {
      newStore.filter("active", "=", true);
    }

    return newStore;
  }, []);

  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, []);

  return (
    <React.Fragment>
      <h2 className={"content-block"}>PO Log</h2>
      <DataGrid
        className={"dx-card wide-card"}
        dataSource={store}
        showBorders={false}
        focusedRowEnabled={true}
        defaultFocusedRowIndex={0}
        columnAutoWidth={true}
        columnHidingEnabled={true}
        allowColumnResizing={true}
        rowAlternationEnabled={true}
        onEditingStart={(res) => {
          setIsEditing(true);
        }}
        onDisposing={() => {
          setIsEditing(false);
        }}
      >
        <Export enabled={true} />
        <Paging enabled={false} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />
        <Editing
          mode="popup"
          allowAdding={true}
          allowDeleting={true}
          allowUpdating={true}
        >
          <Popup
            title="New PO Entry"
            showTitle={true}
            width={700}
            height={450}
            onShowing={(e) => {
              setFormOpen(true);
            }}
            onHiding={(e) => {
              setIsEditing(false);
              setFormOpen(false);
            }}
          >
            <Position my="top" at="top" of={window} />
          </Popup>
          <Form>
            <Item itemType="group" colCount={2} colSpan={2}>
              <Item dataField="jobnr" />
              <Item dataField="date" />
              <Item dataField="desc" />
              <Item dataField="amount" />
              <Item dataField="paidby" />
              <Item dataField="vendor" />
              <Item dataField="type" />
            </Item>
          </Form>
        </Editing>
        <Column
          dataField="active"
          visible={user.isAdmin}
          calculateCellValue={(res) => {
            return res.active || res.active === undefined ? true : false;
          }}
        ></Column>
        <Column type="buttons" width={110}>
          <Button
            name="edit"
            visible={(e) => {
              const data = e.row.data;
              return data.isPropManager;
            }}
          />
          <Button
            name="delete"
            visible={(e) => {
              const data = e.row.data;
              return data.isPropManager;
            }}
          />
        </Column>
        <Column
          dataField={"ponr"}
          caption="PO NO"
          dataType="number"
          allowEditing={false}
          alignment="left"
          defaultSortOrder="desc"
        />
        <Column dataField={"jobnr"} caption={"Job"} allowEditing={!isEditing}>
          <Lookup
            dataSource={(e) => {
              const returnData = formOpen
                ? jobs.filter((job) => {
                    return (
                      job.am === user.uid ||
                      job.editForAll
                    );
                  })
                : jobs;
              return returnData;
            }}
            valueExpr={"uid"}
            displayExpr={(res) => {
              const currentProp = properties.find((property) => {
                return property.uid === res.property;
              });
              return `${res.jobtitle} (${res.jobnr}) @ ${currentProp.address}`;
            }}
          />
          <RequiredRule />
        </Column>

        <Column
          dataField={"am"}
          caption={"AM"}
          allowEditing={false}
          disabled={true}
        >
          <Lookup
            dataSource={managers}
            valueExpr={"uid"}
            displayExpr={"initials"}
          />
        </Column>

        <Column
          dataField={"date"}
          caption={"Purchase Date"}
          dataType="date"
          allowSorting={true}
          calculateCellValue={(res) => {
            return res.date instanceof Firebase.firestore.Timestamp
              ? res.date.toDate()
              : res.date;
          }}
        />
        <Column dataField={"type"} caption={"Type"} allowSorting={false}>
          <Lookup
            dataSource={potypes}
            valueExpr={"uid"}
            displayExpr={"name"}
            disabled={true}
          />
          <RequiredRule />
        </Column>
        <Column dataField={"amount"} caption={"Amount"} dataType="number">
          <RequiredRule />
          <Format type="currency" precision={2}></Format>
        </Column>
        <Column dataField={"paidby"} caption={"Paid By"} allowSorting={false}>
          <RequiredRule />
        </Column>
        <Column dataField={"vendor"} caption={"Vendor"} allowSorting={false}>
          <Lookup
            dataSource={vendors}
            valueExpr={"uid"}
            displayExpr={"name"}
            disabled={true}
            allowEditing={false}
          />
          <RequiredRule />
        </Column>
        <Column dataField={"desc"} caption={"Description"}>
          <RequiredRule />
        </Column>
      </DataGrid>
    </React.Fragment>
  );
};

export default PoListPage;
