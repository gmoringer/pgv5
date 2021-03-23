import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/auth";
import DataSource from "devextreme/data/data_source";
import { Item, GroupItem } from "devextreme-react/form";

import notify from "devextreme/ui/notify";

import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Editing,
  RequiredRule,
  Popup,
  Position,
  Form,
  Button,
  Format,
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const Workers = (props) => {
  const { user, signOut } = useAuth();
  const [workers, setWorkers] = useState();
  const [name, setName] = useState({});

  useEffect(() => {
    if (!user) {
      signOut();
    }
  }, []);

  const datasource = useMemo(() => {
    const datasource = new DataSource({
      key: "id",
      loadMode: "raw",
      load: async () => {
        const result = [];
        await db
          .getAllWorkers()
          .then((snap) =>
            snap.forEach((doc) => result.push({ ...doc.data(), id: doc.id }))
          );
        setWorkers(result);
        return result;
      },
      remove: async (key) => {
        await db.deleteOneVendor(key).then(datasource.load());
      },
      insert: async (values) => {
        const result = [];
        await db.addNewWorker(values, user);
        datasource.load();
      },
      update: async (key, value) => {
        await db.updateOneWorker(key, value).then((res) => datasource.load());
      },
    });
    return datasource;
  }, []);

  useEffect(() => {
    return () => {
      datasource.dispose();
    };
  }, []);

  const handleChangeName = (e) => {
    setName({ name: e.value });
  };

  console.log(user)
  return (
    <React.Fragment>
      <h2 className={"content-block"}>Workers</h2>
      <DataGrid
        className={"dx-card wide-card"}
        dataSource={datasource}
        showBorders={false}
        focusedRowEnabled={true}
        defaultFocusedRowIndex={0}
        columnAutoWidth={true}
        columnHidingEnabled={true}
        allowColumnResizing={true}
        rowAlternationEnabled={true}
      >
        <Paging defaultPageSize={100} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />
        <Editing
          mode="popup"
          allowAdding={user.isWorkers || user.isAdmin}
          allowUpdating={user.isWorkers || user.isAdmin}
        >
          <Popup
            title="Workers Entry"
            showTitle={true}
            width={350}
            height={400}
          >
            <Position my="top" at="top" of={window} />
          </Popup>
          <Form colCount={1} caption="Worker Entry">
            <GroupItem>
              <Item dataField="name" />
              <Item dataField="rate" />
              <Item dataField="notes" />
            </GroupItem>
            <Item dataField="active" />
          </Form>
        </Editing>
        <Column type="buttons" width={110}>
          <Button name="edit" />
        </Column>
        <Column
          dataField="name"
          caption="Name"
          alignment="center"
          defaultSortOrder="asc"
        >
          <RequiredRule />
        </Column>

        <Column
          dataField="rate"
          caption="Hourly Rate"
          alignment="center"
          allowFiltering={false}
          allowSorting={false}
          dataType="number"
        >
          <Format type="currency" precision={2} />
          <RequiredRule />
        </Column>
        <Column
          dataField="active"
          caption="Active"
          alignment="center"
          allowFiltering={false}
          allowSorting={false}
          dataType="boolean"
          calculateCellValue={(res) => {
            return res.active ? res.active : false;
          }}
        />
        <Column
          dataField="notes"
          caption="Notes"
          alignment="center"
          allowFiltering={false}
          allowSorting={false}
        ></Column>
      </DataGrid>
    </React.Fragment>
  );
};

export default Workers;
