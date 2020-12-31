import React, { useState, useEffect } from "react";
import "./profile.scss";
import Form from "devextreme-react/form";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/auth";

export default () => {
  const [notes, setNotes] = useState(
    "Sandra is a CPA and has been our controller since 2008. She loves to interact with staff so if you`ve not met her, be certain to say hi.\r\n\r\nSandra has 2 daughters both of whom are accomplished gymnasts."
  );

  //  const [currentUser, setCurrentUser] = useAuth()

  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const [currentUsr, setCurrentUsr] = useState();

  useEffect(() => {
    const result = [];
    db.getAllUsers().then((res) => {
      res.docs.forEach((doc) => {
        result.push({ ...doc.data() });
      });
      setUsers(result);
      const currentUsr = result.find((usr) => usr.email === user.email);
      setCurrentUsr(currentUsr);
    });
  }, []);


  const employee = {
    ID: 7,
    FirstName: "Sandra",
    LastName: "Johnson",
    Prefix: "Mrs.",
    Position: "Controller",
    Picture: "images/employees/06.png",
    BirthDate: new Date("1974/11/15"),
    HireDate: new Date("2005/05/11"),
    Notes: notes,
    Address: "4600 N Virginia Rd.",
  };
  return (
    <React.Fragment>
      <h2 className={"content-block"}>Profile</h2>

      <div className={"content-block dx-card responsive-paddings"}>
        <div className={"form-avatar"}>
          <img
            alt={""}
            src={`https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/${employee.Picture}`}
          />
        </div>
        <span>{notes}</span>
      </div>

      <div className={"content-block dx-card responsive-paddings"}>
        <Form
          id={"form"}
          defaultFormData={employee}
          onFieldDataChanged={(e) =>
            e.dataField === "Notes" && setNotes(e.value)
          }
          labelLocation={"top"}
          colCountByScreen={colCountByScreen}
        />
      </div>
    </React.Fragment>
  );
};

const colCountByScreen = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
};
