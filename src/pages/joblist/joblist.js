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
  Format,
  Position,
  Form,
  Button,
  Export,
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const JobListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const [properties, setProperties] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user, signOut } = useAuth();
  const [type, setType] = useState(["C", "E"]);

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
    db.getAllProperties().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setProperties(result);
    });
  }, []);

  useEffect(() => {
    db.getAllJobTypes().then((snap) => {
      const result = [];
      snap.forEach((doc) => {
        result.push({ ...doc.data(), uid: doc.id });
      });
      setType(result);
    });
  }, []);

  const store = useMemo(() => {
    const newStore = new DataSource({
      key: "uid",
      load: async () => {
        var props = [];

        await db.getAllProperties().then((res) => {
          res.forEach((doc) => props.push({ ...doc.data(), uid: doc.id }));
        });

        const result = [];

        await db.getAllJobs().then((snap) =>
          snap.forEach(async (snap) => {
            const data = snap.data();

            const currentProperty = props.find((prop) => {
              return prop.uid === data.property;
            });

            if (currentProperty) {
              const currentJob = {
                ...data,
                uid: snap.id,
                isPropManager: data.am === user.uid,
              };
              result.push(currentJob);
            }
          })
        );
        return result;
      },
      remove: async (key) => {
        await db.deleteOneJob(key);
        store.load();
      },
      insert: async (values) => {
        await db.addNewJob(values, user);
        setIsEditing(false);
        setFormOpen(false);
        store.load();
      },
      update: async (key, value) => {
        await db.updateOneJob(key, value);
        setIsEditing(false);
        setFormOpen(false);
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
      <h2 className={"content-block"}>Job List</h2>
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
        onEditingStart={() => {
          setIsEditing(true);
        }}
        onDisposing={() => {
          setIsEditing(false);
        }}
      >
        <Export enabled={user.isExport} />
        <Paging defaultPageSize={50} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />
        <Editing
          mode="popup"
          allowAdding={true}
          // allowDeleting={user.isAdmin}
          allowUpdating={true}
        >
          <Popup
            onShowing={(e) => {
              setFormOpen(true);
            }}
            onHiding={(e) => {
              setIsEditing(false);
              setFormOpen(false);
            }}
            title="New Job Entry"
            showTitle={true}
            width={700}
            height={450}
          >
            <Position my="top" at="top" of={window} />
          </Popup>
          <Form>
            <Item itemType="group" colCount={2} colSpan={2}>
              <Item dataField="property" />
              <Item dataField="jobtitle" />
              <Item dataField="type" />
              <Item dataField="price" />
              <Item dataField="dateapproved" />
              <Item dataField="amdel" />
            </Item>
            <Item dataField="sub" />
            <Item dataField="completed" />
          </Form>
        </Editing>
        <Column type="buttons">
          <Button
            name="edit"
            visible={(e) => {
              const rowData = e.row.data;
              return rowData.isPropManager;
            }}
          />
          <Button
            name="delete"
            visible={(e) => {
              const rowData = e.row.data;
              return rowData.materialssum == 0 && rowData.laborsum == 0;
            }}
          />
        </Column>
        <Column
          dataField={"jobnr"}
          caption="Job Nr."
          dataType="number"
          allowEditing={false}
          defaultSortOrder="desc"
        />
        <Column
          dataField={"property"}
          caption={"Property"}
          allowEditing={!isEditing}
        >
          <Lookup
            dataSource={() => {
              return formOpen
                ? properties.filter((prop) => {
                    return prop.am === user.uid || prop.editForAll;
                  })
                : properties;
            }}
            valueExpr={"uid"}
            displayExpr={"address"}
          />
          <RequiredRule />
        </Column>
        <Column
          dataField={"jobtitle"}
          caption={"Job Description"}
          allowSorting={false}
        >
          <RequiredRule />
        </Column>

        <Column dataField={"type"} caption={"Type"}>
          <RequiredRule />
          <Lookup
            dataSource={type}
            valueExpr={"uid"}
            displayExpr={formOpen ? "name" : "short"}
          />
        </Column>
        <Column
          dataField={"dateapproved"}
          caption={"Date Approved"}
          dataType="date"
          allowSorting={true}
          calculateCellValue={(res) => {
            return res.dateapproved instanceof Firebase.firestore.Timestamp
              ? res.dateapproved.toDate()
              : res.dateapproved;
          }}
        ></Column>
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
          dataField={"amdel"}
          caption={"AM Deligate"}
          allowFiltering={true}
          allowSorting={false}
          alignment="center"
          visible={false}
        >
          <Lookup
            dataSource={() => {
              const addNone = [
                {
                  fullname: "-",
                  initials: "-",
                  uid: false,
                },
                ...managers,
              ];
              return addNone;
            }}
            valueExpr="uid"
            displayExpr={(e) => {
              return e.fullname;
            }}
            disabled={false}
          />
        </Column>
        <Column dataField={"price"} caption={"Price"} dataType="number">
          <RequiredRule />
          <Format type="currency" precision={2}></Format>
        </Column>

        <Column
          dataField={"materialssum"}
          caption={"Materials"}
          dataType="number"
          allowEditing={false}
        >
          <Format type="currency" precision={2}></Format>
        </Column>
        <Column dataField={"laborsum"} caption={"Labor"} allowEditing={false}>
          <Format type="currency" precision={2}></Format>
        </Column>
        <Column
          dataField={"profitsum"}
          caption={"Profit"}
          allowEditing={false}
          calculateCellValue={(res) => {
            const price = res.price - (res.laborsum + res.materialssum);
            return price;
          }}
        >
          <Format type="currency" precision={2}></Format>
        </Column>
        <Column
          dataField={"margin"}
          caption={"Margin"}
          allowEditing={false}
          format="percent"
          alignment="center"
          calculateCellValue={(res) => {
            const margin = 1 - (res.laborsum + res.materialssum) / res.price;
            return isFinite(margin) ? margin : "-";
          }}
        />
        <Column
          dataField="sub"
          caption="Sub?"
          dataType="boolean"
          alignment="center"
          calculateCellValue={(res) => (!res.sub ? false : res.sub)}
        />
        <Column
          dataField="completed"
          caption="Inv?"
          dataType="boolean"
          alignment="center"
          calculateCellValue={(res) => (res.completed ? res.completed : false)}
        />
      </DataGrid>
    </React.Fragment>
  );
};

export default JobListPage;
