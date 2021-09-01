import React, { useState, useRef, useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
import { CheckBox } from "devextreme-react/check-box";
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  CustomRule,
  EmailRule,
} from "devextreme-react/form";
import notify from "devextreme/ui/notify";
import LoadIndicator from "devextreme-react/load-indicator";
import { createAccount } from "../../api/auth";
import "./create-account-form.scss";

export default function (props) {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const formData = useRef({});

  const [isAdmin, setIsAdmin] = useState(false);
  const [isExport, setIsExport] = useState(false);

  const isAdmincheckBoxChanged = (e) => {
    // console.log(e.value);
    setIsAdmin(e.value);
  };

  const isExportCheckBoxChanged = (e) => {
    // console.log(e.value);
    setIsExport(e.value);
  };

  const onSubmit = async (e) => {
    // console.log(isAdmin);
    // console.log(isExport);
    e.preventDefault();
    setLoading(true);

    const result = await createAccount({
      ...formData.current,
      isAdmin: isAdmin,
      isExport: isExport,
      isActive: true,
    });
    setLoading(false);

    if (result.isOk) {
      history.push("/allusers");
    } else {
      notify(result.message, "error", 2000);
    }
  };

  const confirmPassword = useCallback(
    ({ value }) => value === formData.current.password,
    []
  );

  return (
    <form className={"create-account-form"} onSubmit={onSubmit}>
      <Form formData={formData.current} disabled={loading}>
        <Item
          dataField={"email"}
          editorType={"dxTextBox"}
          editorOptions={emailEditorOptions}
        >
          <RequiredRule message="Email is required" />
          <EmailRule message="Email is invalid" />
          <Label visible={false} />
        </Item>
        <Item
          dataField={"fullname"}
          editorType={"dxTextBox"}
          editorOptions={NameEditorOptions}
        >
          <RequiredRule message="Full Name is required" />
          <Label visible={false} />
        </Item>
        <Item
          dataField={"initials"}
          editorType={"dxTextBox"}
          editorOptions={InitialsEditorOptions}
        >
          <RequiredRule message="Last Name is required" />
          <Label visible={false} />
        </Item>
        <Item
          dataField={"password"}
          editorType={"dxTextBox"}
          editorOptions={passwordEditorOptions}
        >
          <RequiredRule message="Password is required" />
          <Label visible={false} />
        </Item>
        <Item
          dataField={"confirmedPassword"}
          editorType={"dxTextBox"}
          editorOptions={confirmedPasswordEditorOptions}
        >
          <RequiredRule message="Password is required" />
          <CustomRule
            message={"Passwords do not match"}
            validationCallback={confirmPassword}
          />
          <Label visible={false} />
        </Item>
        <Item>
          <div className="dx-field">
            <div className="dx-field-label">Admin?</div>
            <CheckBox
              name="isAdmin"
              defaultValue={false}
              onValueChanged={isAdmincheckBoxChanged}
            />
          </div>
          <div className="dx-field">
            <div className="dx-field-label">Export?</div>
            <CheckBox
              name="isExport"
              defaultValue={false}
              id="test"
              onValueChanged={isExportCheckBoxChanged}
            />
          </div>
        </Item>
        <Item>
          <div className="policy-info">
            <br></br>
          </div>
        </Item>
        <ButtonItem>
          <ButtonOptions
            width={"100%"}
            type={"default"}
            useSubmitBehavior={true}
          >
            <span className="dx-button-text">
              {loading ? (
                <LoadIndicator width={"24px"} height={"24px"} visible={true} />
              ) : (
                "Create a new account"
              )}
            </span>
          </ButtonOptions>
        </ButtonItem>
      </Form>
    </form>
  );
}

const emailEditorOptions = {
  stylingMode: "filled",
  placeholder: "Email",
  mode: "email",
};
const passwordEditorOptions = {
  stylingMode: "filled",
  placeholder: "Password",
  mode: "password",
};
const confirmedPasswordEditorOptions = {
  stylingMode: "filled",
  placeholder: "Confirm Password",
  mode: "password",
};
const NameEditorOptions = {
  stylingMode: "filled",
  placeholder: "Full Name",
  mode: "text",
};

const InitialsEditorOptions = {
  stylingMode: "filled",
  placeholder: "Unique Initials",
  mode: "text",
};
