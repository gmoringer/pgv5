import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/auth";
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
  Export
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const PropertyListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    db.getAllUsers().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setManagers(result);
    });
  }, []);

  const store = useMemo(() => {
    const newStore = new DataSource({
      key: "id",
      load: async () => {
        const result = [];
        await db
          .getAllProperties()
          .then((snap) =>
            snap.forEach((doc) => result.push({ ...doc.data(), id: doc.id }))
          );
        return result;
      },
      remove: async (key) => {
        await db.deleteOneProperty(key)
        store.load()
      },
      insert: async (values) => {
        await db.addNewProperty(values, user);
        store.load();
      },
      update: (key, value) => {
        db.updateOneProperty(key, value).then((res) => store.load());
      },
    })
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

  const catchEditing = (e) => {
  };

  const isPropertyManager = (e) => {
    if (e.row.values[2] === user.uid || user.isAdmin) {
      return true;
    }
    return false;
  };

  return (
    <React.Fragment>
      <h2 className={"content-block"}>Property List</h2>
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
        onEditorPreparing={catchEditing}
        onRowPrepared = {(e) => {
          if (e.rowType == 'data' && e.data.active == false) {
            console.log('false')
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
            title="New Property Entry"
            showTitle={true}
            width={700}
            height={350}
          >
            <Position my="top" at="top" of={window} />
          </Popup>
          <Form>
            <Item itemType="group" colCount={2} colSpan={2}>
              <Item dataField="address" />
              <Item dataField="city" />
              <Item dataField="zip" />
              <Item dataField="stateid" />
              <Item dataField="gatecode" />
            </Item>
          </Form>
        </Editing>
          <Column dataField="active" visible={user.isAdmin}  calculateCellValue={(res) => {
            return (res.active || res.active === undefined) ? true : false;
          }}>
        </Column>
        <Column type="buttons" width={110}>
          <Button name="edit" visible={isPropertyManager} />
          <Button name="delete" />
        </Column>
        <Column
          dataField="propertynr"
          caption="Property Nr."
          dataType="number"
          alignment="left"
          width={125}
          allowEditing={false}
          defaultSortOrder="desc" />
        />
        <Column dataField="am" caption="AM" alignment="center" width={100}>
          <Lookup
            dataSource={managers}
            displayExpr="initials"
            valueExpr="uid"
            disabled={true}
          />
          {/* <RequiredRule /> */}
        </Column>
        <Column dataField="address" caption="Address">
          <RequiredRule />
        </Column>
        <Column dataField="city" caption="City">
          <RequiredRule />
        </Column>
        <Column dataField="zip" caption="Zip" alignment="center">
          <RequiredRule />
        </Column>
        <Column
          dataField="stateid"
          caption="State"
          allowFiltering={true}
          allowSorting={false}
        >
          <Lookup
            dataSource={states}
            valueExpr="ID"
            displayExpr="Name"
            disabled={true}
          />
          <RequiredRule />
        </Column>
        <Column
          dataField="gatecode"
          caption="Gate Code"
          alignment="right"
          allowFiltering={false}
          allowSorting={false}
        />
      </DataGrid>
    </React.Fragment>
  );
};

export default PropertyListPage;
