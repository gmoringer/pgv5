import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/auth";
import Firebase from "firebase";
import { states } from "../../constants";
import DataSource from "devextreme/data/data_source";
import { Item } from "devextreme-react/form";
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
  RangeRule
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const PropertyListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const [properties, setProperties] = useState([]);
  const { user } = useAuth();

  const isPropertyManager = (e) => {
    // console.log(e)
    // if (e.row.values[5] === user.uid || user.isAdmin) {
    //   return true;
    // }
    return false;
  };

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

  const store = useMemo(() => {
    const newStore = new DataSource({
      key: "uid",
      load: async () => {
        
        var props = [];
        await db.getAllProperties().then((res) => {
          const result = [];
          res.forEach((doc) => props.push({ ...doc.data(), uid: doc.id }));
          });
        
        const result = [];
        await db.getAllJobs().then((snap) =>
          snap.forEach(async (doc) => {
            const st = props.find(prop => {
               return prop.uid === doc.data().property
            })
            const data = {...doc.data(), uid: doc.id, active: st.active}
            result.push(data);
          })
        );
        return result;
      },
      remove: async (key) => {
        await db.deleteOneJob(key)
        store.load();
      },
      insert: async (values) => {
        await db.addNewJob(values, user);
        store.load();
      },
      update: (key, value) => {
        db.updateOneJob(key, value).then((res) => store.load());
      },
    });
      if (!user.isAdmin) {
      newStore.filter('active', "=", true)
    }
    
    return newStore;
  }, []);

  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, []);

  const maxDate = (res) => {
    
  }

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
        onRowPrepared = {(e) => {
          // console.log(e)
          if (e.rowType == 'data' && e.data.active == false) {
            e.rowElement.style.backgroundColor = 'Tomato';
            e.rowElement.style.opacity = .8
            e.rowElement.className = e.rowElement.className.replace("dx-row-alt", "");  
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
              <Item dataField="propertyispm" />
              <Item dataField="jobtitle" />
              <Item dataField="price" />
              <Item dataField="dateapproved" />
              <Item dataField="sub" />
              <Item dataField="completed" />
            </Item>
          </Form>
        </Editing>
          <Column dataField="active" visible={user.isAdmin}  calculateCellValue={(res) => {
            return (res.active || res.active === undefined) ? true : false;
          }}>
        </Column>
        <Column type="buttons" width={110}>
          <Button name="edit" visible={e => {
            return (e.row.data.active && e.row.data.am === user.uid) || user.isAdmin}} />
          <Button name="delete" visible={e => {
            return e.row.data.active && user.isAdmin;
          }}/>
        </Column>
        <Column
          dataField={"jobnr"}
          hidingPriority={2}
          caption="Job Nr."
          dataType="number"
          allowEditing={false}
          defaultSortOrder="desc"
        />
        <Column dataField={"property"} caption={"Property"}>
          <Lookup
            dataSource={properties}
            valueExpr={"uid"}
            displayExpr={"address"}
          />
          <RequiredRule />
        </Column>
          <Column dataField={"propertyispm"} caption={"Property"} visible={false}>
          <Lookup
            dataSource={() => {
              // console.log(properties)
              const find = properties.filter(prop => {
                // console.log(user.uid)
                return (prop.active && prop.am === user.uid) || user.isAdmin 
                })
              // console.log(find)
              return find}}
            valueExpr={"uid"}
            displayExpr={"address"}
          />
          <RequiredRule />
        </Column>
        <Column
          dataField={"jobtitle"}
          caption={"Job Description"}
          allowSorting={false}
          hidingPriority={7}
        >
          <RequiredRule />
        </Column>
        <Column
          dataField={"dateapproved"}
          caption={"Date Approved"}
          dataType="date"
          allowSorting={false}
          calculateCellValue={(res) => {
            
            return res.dateapproved instanceof Firebase.firestore.Timestamp ? res.dateapproved.toDate() : "";
          }}
        >
        </Column>
        <Column
          dataField={"am"}
          caption={"AM"}
          hidingPriority={6}
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
          dataField={"price"}
          caption={"Price"}
          hidingPriority={3}
          dataType="number"
          format="currency"
        ><RequiredRule /></Column>

        <Column
          dataField={"materialssum"}
          caption={"Materials"}
          dataType="number"
          format="currency"
          hidingPriority={4}
          allowEditing={false}
        />
        <Column
          dataField={"laborsum"}
          caption={"Labor"}
          hidingPriority={1}
          allowEditing={false}
          dataType="number"
          format="currency"
        />
        <Column
          dataField={"profitsum"}
          caption={"Profit"}
          hidingPriority={0}
          allowEditing={false}
          dataType="number"
          format="currency"
          calculateCellValue={(res) =>
            res.price - (res.laborsum + res.materialssum)
          }
        />
        <Column
          dataField={"margin"}
          caption={"Margin"}
          hidingPriority={0}
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
          calculateCellValue={(res) => (!res.inv ? false : res.inv)}
        />
      </DataGrid>
    </React.Fragment>
  );
};

export default PropertyListPage;
