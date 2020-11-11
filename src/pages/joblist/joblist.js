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
} from "devextreme-react/data-grid";

import { db } from "../../firebase";

const PropertyListPage = (props) => {
  const [managers, setManagers] = useState([]);
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
        await db.getAllJobs().then((snap) =>
          snap.forEach((doc) => {
            result.push({ ...doc.data(), uid: doc.id });
          })
        );
        return result;
      },
      remove: async (key) => {
        await db.deleteOneJob(key).then(store.load());
      },
      insert: async (values) => {
        await db.addNewJob(values, user);
        store.load();
      },
      update: (key, value) => {
        db.updateOneJob(key, value).then((res) => store.load());
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, []);

  // const onEditing = (values) => {
  //   console.log(values);
  // };

  return (
    <React.Fragment>
      <h2 className={"content-block"}>Job List</h2>
      <DataGrid
        className={"dx-card wide-card"}
        dataSource={store}
        showBorders={false}
        focusedRowEnabled={true}
        defaultFocusedRowIndex={0}
        columnAutoWidth={true}
        columnHidingEnabled={true}
        allowColumnResizing={true}
        // onEditingStart={onEditing}
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
            <Item itemType="group" colCount={1} colSpan={2}>
              <Item dataField="property" />
              <Item dataField="jobtitle" />
              <Item dataField="price" />
            </Item>
          </Form>
        </Editing>
        <Column
          dataField={"jobnr"}
          hidingPriority={2}
          caption="Job Nr."
          dataType="number"
          allowEditing={false}
        />
        <Column dataField={"property"} caption={"Property"} hidingPriority={5}>
          <Lookup
            dataSource={properties}
            valueExpr={"uid"}
            displayExpr={"address"}
          />
        </Column>
        <Column
          dataField={"jobtitle"}
          caption={"Job Description"}
          allowSorting={false}
          hidingPriority={7}
        />
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
          dataField={"price"}
          caption={"Price"}
          hidingPriority={3}
          dataType="number"
          format="currency"
        />
        <Column
          dataField={"materialssum"}
          caption={"Materials"}
          dataType="number"
          format="currency"
          hidingPriority={4}
          allowEditing={false}
        />
        <Column
          dataField={"laborsum"}
          caption={"Labor"}
          hidingPriority={1}
          allowEditing={false}
          dataType="number"
          format="currency"
        />
        <Column
          dataField={"profitsum"}
          caption={"Profit"}
          hidingPriority={0}
          allowEditing={false}
          dataType="number"
          format="currency"
          calculateCellValue={(res) =>
            res.price - (res.laborsum + res.materialssum)
          }
        />
        <Column
          dataField={"margin"}
          caption={"Margin"}
          hidingPriority={0}
          allowEditing={false}
          format="percent"
          calculateCellValue={(res) =>
            1 - (res.laborsum + res.materialssum) / res.price
          }
        />
      </DataGrid>
    </React.Fragment>
  );
};

export default PropertyListPage;
