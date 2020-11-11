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
        await db.getAllLaborLogs().then((snaps) =>
          snaps.forEach((snap) => {
            result.push({ ...snap.data(), uid: snap.id });
          })
        );
        return result;
      },
      remove: async (key) => {
        await db.deleteOneLaborLog(key).then(() => store.load());
      },
      insert: async (values) => {
        await db.addNewLaborLog(values, user);
        store.load();
      },
      update: async (key, value) => {
        console.log(value);
        await db.updateLaborLog(key, value);
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
      <h2 className={"content-block"}>Labor Log</h2>
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
              <Item dataField="date" />
              <Item dataField="hours" />
              <Item dataField="wage" />
              <Item dataField="name" />
              <Item dataField="notes" />
            </Item>
          </Form>
        </Editing>
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
          caption={"Date Worked"}
          allowSorting={false}
          dataType="date"
          hidingPriority={7}
          calculateCellValue={(res) => {
            return res.date ? res.date.toDate() : null;
          }}
        />
        <Column dataField={"name"} caption={"Name"} allowSorting={true} />
        <Column dataField={"hours"} caption={"Hours"} allowSorting={false} />
        <Column dataField={"wage"} caption={"Wage"} allowSorting={false} />
        <Column
          dataField={"cost"}
          caption={"Cost"}
          allowSorting={false}
          calculateCellValue={(res) => res.hours * res.wage * 1.25}
        />
        <Column dataField={"notes"} caption={"Notes"} allowSorting={false} />
      </DataGrid>
    </React.Fragment>
  );
};

export default PoListPage;
