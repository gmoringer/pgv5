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
  SelectBox,
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const PropertyListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [propertyManaged, setPropertiesManaged] = useState([]);
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

      const propertyManaged = result.filter((property) => {
        return property.am === user.uid && property.active;
      });
      setPropertiesManaged(propertyManaged);
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
          snap.forEach(async (doc) => {
            {
              const st = props.find((prop) => {
                return prop.uid === doc.data().property;
              });

              if (st) {
                const data = { ...doc.data(), uid: doc.id, active: st.active };
                result.push(data);
              }
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

  const changeEditingStatus = () => {
    setIsEditing(!isEditing);
  };

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
        onRowPrepared={(e) => {
          if (e.rowType === "data" && e.data.active === false) {
            e.rowElement.style.backgroundColor = "Tomato";
            e.rowElement.style.opacity = 0.8;
            e.rowElement.className = e.rowElement.className.replace(
              "dx-row-alt",
              ""
            );
          }
        }}
      >
        <Export enabled={true} />
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />
        <Editing
          mode="popup"
          allowAdding={true}
          allowDeleting={user.isAdmin}
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
         
            </Item>
              <Item dataField="sub" />
              <Item dataField="completed" />
          </Form>
        </Editing>
        <Column
          dataField="active"
          visible={user.isAdmin}
          calculateCellValue={(res) => {
            return res.active || res.active === undefined ? true : false;
          }}
        ></Column>
        <Column type="buttons">
          <Button
            name="edit"
            visible={(e) => {
              return (
                e.row.data.active &&
                (e.row.data.am === user.uid || user.isAdmin)
              );
            }}
          />
          <Button
            name="delete"
            visible={(e) => {
              return e.row.data.active && user.isAdmin;
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
              return formOpen ? propertyManaged : properties;
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
          <Lookup dataSource={type} valueExpr={"uid"} displayExpr={formOpen ? "name" : "short"} />
        </Column>
        <Column
          dataField={"dateapproved"}
          caption={"Date Approved"}
          dataType="date"
          allowSorting={false}
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
          calculateCellValue={(res) =>
            1 - (res.laborsum + res.materialssum) / res.price
          }
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

export default PropertyListPage;
