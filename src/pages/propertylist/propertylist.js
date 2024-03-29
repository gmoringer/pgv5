import DataGrid, {
  Button,
  Column,
  Editing,
  Export,
  FilterRow,
  Form,
  Lookup,
  Pager,
  Paging,
  Popup,
  Position,
  RequiredRule,
} from "devextreme-react/data-grid";
import { Item } from "devextreme-react/form";
import DataSource from "devextreme/data/data_source";
import React, { useEffect, useMemo, useState } from "react";
import { states } from "../../constants";
import { useAuth } from "../../contexts/auth";
import { db } from "../../firebase";

const PropertyListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      signOut();
    }
  }, []);

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
        await db.getAllProperties().then((snap) => {
          snap.forEach((doc) => result.push({ ...doc.data(), id: doc.id }));
        });
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

  const isPropertyManager = (e) => {
    return e ? e.row.data.am === user.uid : false;
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
        allowColumnResizing={true}
        rowAlternationEnabled={true}
      >
        <Export enabled={user.isExport} />
        <Paging defaultPageSize={50} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />
        <Editing mode="popup" allowAdding={true} allowUpdating={true}>
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
        <Column type="buttons">
          <Button
            name="edit"
            visible={(res) => {
              return isPropertyManager(res);
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
        <Column
          dataField="zip"
          caption="Zip"
          alignment="center"
          alignment="center"
        >
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
