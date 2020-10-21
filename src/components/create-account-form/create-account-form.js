import React, { useState, useRef, useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
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

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);

      const result = await createAccount(formData.current);
      setLoading(false);

      if (result.isOk) {
        history.push("/login");
      } else {
        notify(result.message, "error", 2000);
      }
    },
    [history]
  );

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
          <div className="policy-info">
            By creating an account, you agree to be diligent and respectful of
            the data you enter into the Pacific Gardens and Company App!
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
        <Item>
          <div className={"login-link"}>
            Have an account? <Link to={"/login"}>Sign In</Link>
          </div>
        </Item>
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
