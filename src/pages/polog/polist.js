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
  Position,
  Form,
} from "devextreme-react/data-grid";

import { db } from "../../firebase";
import { getAllProperties } from "../../firebase/db";

const PoListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [properties, setProperties] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    db.getAllUsers().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setManagers(result);
    });
  }, []);

  useEffect(async () => {
    const result = [];
    await db.getAllProperties().then((res) => {
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setProperties(result);
    });

    db.getAllJobs().then((res) => {
      const jobsDownload = [];
      res.forEach((doc) => {
        const currentPropNr = result.find((prop) => {
          return prop.uid === doc.data().property;
        });

        jobsDownload.push({
          ...doc.data(),
          uid: doc.id,
          propertynr: currentPropNr.propertynr,
        });
      });
      setJobs(jobsDownload);
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
    return new DataSource({
      key: "uid",
      load: async () => {
        const result = [];
        await db.getAllPos().then((snaps) =>
          snaps.forEach((snap) => {
            result.push({ ...snap.data(), uid: snap.id });
          })
        );
        return result;
      },
      remove: async (key) => {
        await db.deleteOnePo(key).then(() => store.load());
      },
      insert: async (values) => {
        await db.addNewPo(values, user);
        store.load();
      },
      update: async (key, value) => {
        console.log(value);
        await db.updatePo(key, value);
        store.load();
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
      <h2 className={"content-block"}>PO Log</h2>
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
          allowDeleting={true}
          allowUpdating={true}
        >
          <Popup title="New PO Entry" showTitle={true} width={700} height={350}>
            <Position my="top" at="top" of={window} />
          </Popup>
          <Form>
            <Item itemType="group" colCount={2} colSpan={2}>
              <Item dataField="jobnr" />
              <Item dataField="desc" />
              <Item dataField="amount" />
              <Item dataField="paidby" />
              <Item dataField="vendor" />
              <Item dataField="type" />
            </Item>
          </Form>
        </Editing>
        <Column
          dataField={"ponr"}
          caption="PO NO"
          dataType="number"
          allowEditing={false}
          alignment="left"
        />
        <Column dataField={"jobnr"} caption={"Job"} hidingPriority={5}>
          <Lookup
            dataSource={jobs}
            valueExpr={"uid"}
            displayExpr={(res) => {
              const currentProp = properties.find((property) => {
                return property.uid === res.property;
              });
              return `${res.jobtitle} (${res.jobnr}) @ ${currentProp.address}`;
            }}
          />
        </Column>
        {/* <Column dataField={"jobnr"} caption={"Property"} hidingPriority={5}>
          <Lookup
            dataSource={jobs}
            valueExpr={"uid"}
            displayExpr={(res) => {
              console.log(store._items);
              const currentProp = properties.find((property) => {
                return property.uid === res.property;
              });
              return `${currentProp.address} (${res.propertynr})`;
            }}
          />
        </Column> */}

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
          dataField={"date"}
          caption={"Last Updated"}
          allowSorting={false}
          dataType="date"
          hidingPriority={7}
          calculateCellValue={(res) => {
            return res.date ? res.date.toDate() : null;
          }}
        />
        <Column
          dataField={"type"}
          caption={"Type"}
          allowSorting={false}
          hidingPriority={7}
        />
        <Column
          dataField={"amount"}
          caption={"Amount"}
          allowSorting={false}
          hidingPriority={7}
          dataType="number"
          format="currency"
        />
        <Column
          dataField={"paidby"}
          caption={"Paid By"}
          allowSorting={false}
          hidingPriority={7}
        />
        <Column
          dataField={"vendor"}
          caption={"Vendor"}
          allowSorting={false}
          hidingPriority={7}
        />
        <Column
          dataField={"desc"}
          caption={"Descritpion"}
          hidingPriority={6}
          // allowEditing={false}
          // disabled={true}
        />
      </DataGrid>
    </React.Fragment>
  );
};

export default PoListPage;
