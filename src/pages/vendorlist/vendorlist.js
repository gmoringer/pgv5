import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/auth";
import DataSource from "devextreme/data/data_source";
import { Item } from "devextreme-react/form";
import { Autocomplete } from "devextreme-react/autocomplete";

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
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const VendorListPage = (props) => {
  const { user, signOut } = useAuth();
  const [vendors, setVendors] = useState();
  const [name, setName] = useState({});

  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
          .getAllVendors()
          .then((snap) =>
            snap.forEach((doc) => result.push({ ...doc.data(), id: doc.id }))
          );
        setVendors(result);
        console.log(user);
        return result;
      },
      remove: async (key) => {
        await db.deleteOneVendor(key).then(datasource.load());
      },
      insert: async (values) => {
        const result = [];
        await db
          .getAllVendors()
          .then((snap) =>
            snap.forEach((doc) => result.push({ ...doc.data(), id: doc.id }))
          );

        const data = { ...values, ...name };
        await db.addNewVendor(data, user);

        setIsEditing(false);
        setFormOpen(false);

        datasource.load();
      },
      update: (key, value) => {
        setFormOpen(false);
        setIsEditing(false);
        db.updateOneVendor(key, value).then((res) => datasource.load());
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

  const onRowInserted = (e) => {
    const result = [];
    const dup = vendors.find((vendor) => vendor.name === name.name);

    if (dup) {
      notify(
        {
          message: "Duplicate Vendor!",
          position: { at: "top", offset: "0 230" },
        },
        "error",
        500
      );
      e.cancel = Promise.resolve(true);
    } else if (name.name === "" || typeof name.name !== "string") {
      notify(
        {
          message: "Please enter vendor!",
          position: { at: "top", offset: "0 230" },
        },
        "error",
        500
      );
      e.cancel = Promise.resolve(true);
    } else {
      e.data = { ...e.data, ...name };
    }
  };

  return (
    <React.Fragment>
      <h2 className={"content-block"}>Vendor List</h2>
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
        onRowInserting={onRowInserted}
        onEditingStart={() => {
          setIsEditing(true);
        }}
        onDisposing={() => {
          setIsEditing(false);
        }}
      >
        <Paging defaultPageSize={100} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />
        <Editing
          mode="popup"
          allowAdding={user.vendorlist || user.isAdmin}
          // allowDeleting={user.isAdmin}
          allowUpdating={user.vendorlist || user.isAdmin}
        >
          <Popup
            title="New Vendor Entry"
            showTitle={true}
            width={700}
            height={300}
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
            <Item itemType="group" colCount={1} colSpan={2}>
              {!isEditing ? (
                <Item dataField="name">
                  <Autocomplete
                    dataSource={datasource.store()}
                    valueExpr={"name"}
                    placeholder="Enter Vendor Name..."
                    onValueChanged={handleChangeName}
                  >
                    <RequiredRule />
                  </Autocomplete>
                </Item>
              ) : (
                <Item dataField="name">
                  <RequiredRule />
                </Item>
              )}
              <Item dataField="notes" />
            </Item>
          </Form>
        </Editing>
        <Column type="buttons" width={110}>
          <Button name="edit" />
          {/* <Button name="delete" visible={user.isAdmin} /> */}
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
