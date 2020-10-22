import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/auth";
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
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

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

  useEffect(() => {
    db.getAllJobs().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setJobs(result);
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
        await db.getAllPos().then((snap) =>
          snap.forEach((doc) => {
            result.push({ ...doc.data(), uid: doc.id });
          })
        );
        return result;
      },
      remove: async (key) => {
        await db.deleteOnePo(key);
        store.load();
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

  // ACCT #	JOB	AM	PROPERTY	DATE	TYPE	PO NO	 AMT 	PAID BY	VENDOR	REC	DESCRIPTION	EOM

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
          <Popup
            title="New Job Entry"
            showTitle={true}
            width={700}
            height={350}
          >
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
        />
        <Column dataField={"jobnr"} caption={"Job"} hidingPriority={5}>
          <Lookup
            dataSource={jobs}
            valueExpr={"uid"}
            displayExpr={(res) => {
              const currentProp = properties.find(
                (job) => job.property === properties.uid
              );
              return `${res.jobnr} - ${res.jobtitle} - ${currentProp.address}`;
            }}
          />
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
        <Column dataField={"property"} caption={"Property"} hidingPriority={5}>
          <Lookup
            dataSource={properties}
            valueExpr={"uid"}
            displayExpr={"address"}
          />
        </Column>

        <Column
          dataField={"date"}
          caption={"Date"}
          allowSorting={false}
          hidingPriority={7}
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
