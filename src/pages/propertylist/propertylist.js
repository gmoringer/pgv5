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
  Export,
  Selection,
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const PropertyListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    async function getData() {
    await db.getAllUsers().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setManagers(result);
    });
    }
    getData();
  }, []);

  const store = useMemo(() => {
    const newStore = new DataSource({
      key: "id",
      load: async () => {
        const result = [];
        await db
          .getAllProperties()
          .then((snap) => {
            snap.forEach((doc) => result.push({ ...doc.data(), id: doc.id }))
          }
          );
        return result;
      },
      remove: async (key) => {
        await db.deleteOneProperty(key);
        store.load();
      },
      insert: async (values) => {
        await db.addNewProperty(values, user);
        store.load();
      },
      update: async (key, value) => {
        await db.updateOneProperty(key, value);
        store.load()
      },
    });
    if (!user.isAdmin) {
      console.log(newStore)
      newStore.filter("active", "=", true);
    }
    return newStore;
  }, []);

  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, []);

  const isPropertyManager = (e) => {
    return e ? e.row.data.am === user.uid : false
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
        // columnHidingEnabled={true}
        allowColumnResizing={true}
        rowAlternationEnabled={true}
        onRowPrepared={(e) => {
          if (e.rowType == "data" && e.data.active == false) {
            e.rowElement.style.backgroundColor = "Tomato";
            e.rowElement.style.opacity = 0.75;
            e.rowElement.className = e.rowElement.className.replace(
              "dx-row-alt",
              ""
            );
          }
        }}
      >
        {/* <Selection deferred={true} /> */}
        <Export enabled={true} />
        <Paging defaultPageSize={25} />
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
            visible={(res) => {
              return isPropertyManager(res) && res.row.data.active}}
          />
          <Button
            name="delete"
            visible={(res) => {
              return res.row.data.active && user.isAdmin;
            }}
          />
        </Column>
        <Column
          dataField="propertynr"
          caption="Property Nr."
          dataType="number"
          alignment="center"
          allowEditing={false}
          defaultSortOrder="desc"
        />
        />
        <Column dataField="am" caption="AM" alignment="center" width={100}>
          <Lookup
            dataSource={managers}
            displayExpr="initials"
            valueExpr="uid"
            disabled={true}
          />
        </Column>
        <Column dataField="address" caption="Address" alignment="left">
          <RequiredRule />
        </Column>
        <Column dataField="city" caption="City" alignment="center">
          <RequiredRule />
        </Column>
        <Column dataField="zip" caption="Zip" alignment="center" alignment="center">
          <RequiredRule />
        </Column>
        <Column
          dataField="stateid"
          caption="State"
          allowFiltering={true}
          allowSorting={false}
          alignment="center"
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
          caption="Gate Code / Notes"
          alignment="center"
          allowFiltering={false}
          allowSorting={false}
        />
      </DataGrid>
    </React.Fragment>
  );
};

export default PropertyListPage;
