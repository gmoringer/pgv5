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
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const VendorListPage = (props) => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      signOut();
    }
  }, []);

  const store = useMemo(() => {
    return new DataSource({
      key: "id",
      load: async () => {
        const result = [];
        await db
          .getAllVendors()
          .then((snap) =>
            snap.forEach((doc) => result.push({ ...doc.data(), id: doc.id }))
          );
        return result;
      },
      remove: async (key) => {
        await db.deleteOneVendor(key).then(store.load());
      },
      insert: async (values) => {
        await db.addNewVendor(values, user);
        store.load();
      },
      update: (key, value) => {
        db.updateOneVendor(key, value).then((res) => store.load());
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, []);

  return (
    <React.Fragment>
      <h2 className={"content-block"}>Vendor List</h2>
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
      >
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
            title="New Vendor Entry"
            showTitle={true}
            width={700}
            height={300}
          >
            <Position my="top" at="top" of={window} />
          </Popup>
          <Form>
            <Item itemType="group" colCount={1} colSpan={2}>
              <Item dataField="name" />
              <Item dataField="notes" />
            </Item>
          </Form>
        </Editing>
        <Column type="buttons" width={110}>
          <Button name="edit" />
          <Button name="delete" visible={user.isAdmin} />
        </Column>
        <Column
          dataField="name"
          caption="Vendor Name"
          alignment="center"
          defaultSortOrder="asc"
        >
          <RequiredRule />
        </Column>

        <Column
          dataField="notes"
          caption="Notes"
          alignment="center"
          allowFiltering={false}
          allowSorting={false}
        />
      </DataGrid>
    </React.Fragment>
  );
};

export default VendorListPage;
