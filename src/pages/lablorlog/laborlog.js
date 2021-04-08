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
  Format,
  Export,
} from "devextreme-react/data-grid";
import SelectBox from "devextreme-react/select-box";

import { SimpleItem, GroupItem } from "devextreme-react/form";

import { db } from "../../firebase";

const LaborLogPage = (props) => {
  const [managers, setManagers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState();

  const [properties, setProperties] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      signOut();
    }
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
    async function getData() {
      return await db.getAllProperties().then((res) => {
        res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
        setProperties(result);
      });
    }

    getData().then(() => {
      db.getAllJobs().then((res) => {
        const jobsDownload = [];
        res.forEach((doc) => {
          const docData = doc.data();
          const currentProp = result.find((prop) => {
            return prop.uid === docData.property;
          });
          if (currentProp) {
            jobsDownload.push({
              ...docData,
              uid: doc.id,
              propertynr: currentProp.propertynr,
              edit:
                currentProp.editForAll ||
                docData.am === user.uid ||
                docData.amdel === user.uid,
            });
          }
        });
        setJobs(jobsDownload);
      });
    });
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
        const workers = [];
        await db
          .getAllJobs()
          .then((snaps) =>
            snaps.forEach((doc) => jobList.push({ ...doc.data(), uid: doc.id }))
          );

        await db.getAllWorkers().then((snaps) => {
          snaps.forEach((doc) => workers.push({ ...doc.data(), uid: doc.id }));
        });
        setWorkers(workers);

        await db.getAllLaborLogs().then((snaps) => {
          snaps.forEach((snap) => {
            const data = snap.data();
            const currentJob = jobList.find((job) => {
              return job.uid === data.jobnr;
            });

            if (data.hasOwnProperty("workerid")) {
            } else {
            }

            var amDel;

            try {
              amDel = currentJob.amdel;
            } catch {
              amDel = false;
            }
            result.push({
              ...data,
              uid: snap.id,
              isPropManager: data.am === user.uid || amDel === user.uid,
            });
          });
        });
        await db.getAllWorkers().then((snaps) => {
          const result = [];
          snaps.forEach((snap) => {
            const data = snap.data();
            result.push({ ...data, uid: snap.id });
          });
          setWorkers(result);
        });
        return result;
      },
      remove: async (key) => {
        await db.deleteOneLaborLog(key).then(() => store.load());
      },
      insert: async (values) => {
        await db.addNewLaborLog(values, user);
        setIsEditing(false);
        setFormOpen(false);
        store.load();
      },
      update: async (key, value) => {
        await db.updateLaborLog(key, value);
        setFormOpen(false);
        setIsEditing(false);
        store.load();
      },
    });

    return newStore;
  }, []);

  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, []);
  return (
    <React.Fragment>
      <h2 className={"content-block"}>Labor Log</h2>
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
        onEditingStart={(e) => {
          console.log(e.data.name);
          console.log(workers);
          setIsEditing(true);
        }}
        onDisposing={() => {
          setIsEditing(false);
        }}
        onInitNewRow={(e) => {
          e.data.overtime = 0;
          e.data.hours = 0;
        }}
      >
        <Export enabled={true} />
        <Paging defaultPageSize={50} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />
        <Editing
          mode="popup"
          allowAdding={true}
          allowDeleting={true}
          allowUpdating={true}
        >
          <Popup
            title="New Labor Log Entry"
            showTitle={true}
            width={700}
            height={450}
            onShowing={(e) => {
              return setFormOpen(true);
            }}
            onHiding={(e) => {
              setIsEditing(false);
              setFormOpen(false);
            }}
          >
            <Position my="top" at="top" of={window} />
          </Popup>
          <Form>
            <GroupItem caption="Worker Information">
              <Item dataField="dateworked" />
              <Item dataField="jobnr" />
              <Item dataField="name" />
              <Item dataField="notes" />
            </GroupItem>
            <SimpleItem itemType="group">
              <GroupItem caption="Time Logging">
                <Item dataField="hours" />
              </GroupItem>
              <GroupItem caption="Over Time">
                <Item dataField="overtime" />
              </GroupItem>
            </SimpleItem>
          </Form>
        </Editing>
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
        <Column dataField={"jobnr"} caption={"Job"} allowEditing={!isEditing}>
          <Lookup
            dataSource={() => {
              return formOpen
                ? jobs.filter((job) => {
                    return job.edit;
                  })
                : jobs;
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
          dataField={"dateworked"}
          caption={"Date Worked"}
          dataType="date"
          allowSorting={true}
          defaultSortOrder="desc"
          calculateCellValue={(res) => {
            return res.dateworked instanceof Firebase.firestore.Timestamp
              ? res.dateworked.toDate()
              : res.dateworked;
          }}
        >
          <RequiredRule />
        </Column>
        <Column dataField={"name"} caption={"Name"} allowSorting={true}>
          <RequiredRule />
          <Lookup dataSource={workers} valueExpr={"uid"} displayExpr="name" />
        </Column>
        <Column
          dataField={"hours"}
          caption={"Hours"}
          allowSorting={false}
          dataType="number"
        >
          <RequiredRule />
          <Format precision={2}></Format>
        </Column>
        <Column
          dataField={"overtime"}
          caption={"Overtime"}
          allowSorting={false}
          dataType="number"
        >
          <RequiredRule />
          <Format precision={2}></Format>
        </Column>
        <Column
          dataField={"wage"}
          caption={"Wage"}
          allowSorting={false}
          dataType="number"
        >
          <RequiredRule />
          <Format type="currency" precision={2}></Format>
        </Column>
        <Column
          dataField={"cost"}
          caption={"Cost"}
          allowSorting={false}
          calculateCellValue={(res) => res.hours * res.wage * 1.25}
        >
          <Format type="currency" precision={2}></Format>
        </Column>
        <Column dataField={"notes"} caption={"Notes"} allowSorting={false} />
      </DataGrid>
    </React.Fragment>
  );
};

export default LaborLogPage;
