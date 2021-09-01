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
  Editing,
  Popup,
  Position,
  Form,
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const PropertyListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    db.getAllUsers().then((res) => {
      const result = [];
      res.forEach((doc) =>
        result.push({
          ...doc.data(),
          uid: doc.id,
          isAdmin: doc.data().isAdmin ? true : false,
          isActive: doc.data().isActive ? true : false,
          isExport: doc.data().isExport ? true : false,
        })
      );
      setManagers(result);
    });
  }, []);

  const store = useMemo(() => {
    return new DataSource({
      key: "id",
      load: async () => {
        const result = [];
        await db
          .getAllUsers()
          .then((snap) =>
            snap.forEach((doc) => result.push({ ...doc.data(), id: doc.id }))
          );
        return result;
      },
      update: (key, value) => {
        db.updateOneUser(key, value).then((res) => store.load());
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
      <h2 className={"content-block"}>ADMIN - All Users</h2>
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
          allowAdding={false}
          allowDeleting={false}
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
              <Item dataField="fullname" />
              <Item dataField="email" />
              <Item dataField="initials" />
              <Item dataField="isAdmin" />
              <Item dataField="isExport" />
              <Item dataField="isActive" />
            </Item>
          </Form>
        </Editing>
        <Column
          dataField="fullname"
          caption="Full Name"
          alignment="center"
          width={250}
          allowEditing={false}
        />
        <Column dataField="email" caption="E-Mail" alignment="center"></Column>
        <Column dataField="initials" caption="Initials" alignment="center" />
        <Column dataField="isAdmin" caption="Admin?" />
        <Column dataField="isActive" caption="Active?" />
        <Column dataField="isExport" caption="Export?" />
      </DataGrid>
    </React.Fragment>
  );
};

export default PropertyListPage;
