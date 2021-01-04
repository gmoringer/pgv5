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
  Button,
  Export,
  Format,
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const PoListPage = (props) => {
  const [managers, setManagers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [properties, setProperties] = useState([]);
  const [potypes, setPoTypes] = useState();
  const { user } = useAuth();

  const isPropertyManager = (e) => {
    return e ? e.row.data.am === user.uid : false
  };

  useEffect(() => {
    const result = [];
    async function fetchData() {
      return await db.getPoTypes();
    }

    fetchData().then((res) =>
      res.forEach((doc) => {
        result.push({ ...doc.data(), uid: doc.id });
      })
    );
    setPoTypes(result);
  }, []);

  useEffect(() => {
    db.getAllVendors().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setVendors(result);
    });
  }, []);

  useEffect(() => {
    db.getAllUsers().then((res) => {
      const result = [];
      res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
      setManagers(result);
    });
  }, []);

  useEffect(() => {
    const result = [];

    async function fetchdata() {
      return await db.getAllProperties().then((res) => {
        res.forEach((doc) => result.push({ ...doc.data(), uid: doc.id }));
        setProperties(result);
      });
    }
    fetchdata().then(
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
      })
    );
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
        await db.updatePo(key, value);
        store.load()
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
        onRowPrepared={(e) => {
          if (e.rowType === "data" && e.data.active === false) {
            e.rowElement.style.backgroundColor = "Tomato";
            e.rowElement.style.opacity = 0.8;
            e.rowElement.className = e.rowElement.className.replace(
              "dx-row-alt",
              ""
            );
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
        <Column type="buttons" width={110}>
          <Button name="edit" visible={(e) => isPropertyManager(e)} />
          <Button name="delete" visible={(e) => isPropertyManager(e) || user.isAdmin} />
        </Column>
        <Column
          dataField={"ponr"}
          caption="PO NO"
          dataType="number"
          allowEditing={false}
          alignment="left"
          defaultSortOrder="desc"
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
          <RequiredRule />
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
        <Column dataField={"type"} caption={"Type"} allowSorting={false}>
          <Lookup
            dataSource={potypes}
            valueExpr={"uid"}
            displayExpr={"name"}
            disabled={true}
          />
          <RequiredRule />
        </Column>
        <Column dataField={"amount"} caption={"Amount"} dataType="number">
          <RequiredRule />
          <Format type="currency" precision={2}></Format>
        </Column>
        <Column dataField={"paidby"} caption={"Paid By"} allowSorting={false}>
          <RequiredRule />
        </Column>
        <Column dataField={"vendor"} caption={"Vendor"} allowSorting={false}>
          <Lookup
            dataSource={vendors}
            valueExpr={"uid"}
            displayExpr={"name"}
            disabled={true}
            allowEditing={false}
          />
          <RequiredRule />
        </Column>
        <Column dataField={"desc"} caption={"Description"}>
          <RequiredRule />
        </Column>
      </DataGrid>
    </React.Fragment>
  );
};

export default PoListPage;
