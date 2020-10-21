import React, { useState, useEffect, useMemo, compose } from "react";
import { AuthProvider, useAuth } from "../../contexts/auth";
import { states } from "../../constants";
// import { getManagers } from "../../api/getData";
import DataSource from "devextreme/data/data_source";
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
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

// import { withFirebase } from "../../Firebase";
// import firebase from "firebase";

const PropertyListPage = (props) => {
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    // getManagers(props.firebase.db).then((result) => setManagers(result));
  }, []);

  const onRowInit = (value) => {
    value.promise = props.firebase.db
      .collection("properties")
      .orderBy("propertynr", "desc")
      .limit(1)
      .get()
      .then((snap) => {
        value.data.propertynr =
          snap.docs.length === 0
            ? parseInt(process.env.REACT_APP_FIRST_PROP_NR)
            : snap.docs[0].data().propertynr + 1;
      });
  };

  const store = useMemo(() => {
    return new DataSource({
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
      remove: (key) => {
        props.firebase.db
          .collection("properties")
          .doc(key)
          .delete()
          .then(() => {
            store.load();
          });
      },
      insert: (values) => {
        // props.firebase.db
        //   .collection("properties")
        //   .add({
        //     ...values,
        //     date: firebase.firestore.Timestamp.now(),
        //   })
        //   .then((data) => {
        //     store.load();
        //   });
      },
      update: (key, value) => {
        props.firebase.db
          .collection("properties")
          .doc(key)
          .update({ ...value })
          .then(() => store.load());
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, []);

  console.log(props);

  // const doubleClick = (e) => {
  //   console.log(e.data.id);
  // };

  return (
    <React.Fragment>
      <h2 className={"content-block"}>Property List</h2>
      <DataGrid
        className={"dx-card wide-card"}
        onInitNewRow={onRowInit}
        dataSource={store}
        showBorders={false}
        focusedRowEnabled={true}
        defaultFocusedRowIndex={0}
        columnAutoWidth={true}
        columnHidingEnabled={true}
        allowColumnResizing={true}
        rowAlternationEnabled={true}
        // onRowDblClick={doubleClick}
      >
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />
        <Editing
          mode="popup"
          allowAdding={true}
          allowDeleting={true}
          allowUpdating={true}
        >
          <Popup title="Add Property" showTitle={true} width={700} height={450}>
            <Position my="top" at="top" of={window} />
          </Popup>
        </Editing>
        <Column
          dataField="propertynr"
          caption="Property Nr."
          dataType="number"
          alignment="left"
          width={125}
          allowEditing={false}
        />
        <Column dataField="am" caption="AM" alignment="center" width={100}>
          <Lookup
            dataSource={managers}
            displayExpr="initials"
            valueExpr="id"
            disabled={true}
          />
          <RequiredRule />
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
