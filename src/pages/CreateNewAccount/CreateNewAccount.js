import React from "react";
import CreateNewForm from "../../components/create-account-form/create-account-form";
import "../home/home.scss";
import pgLogo from "../../img/PacificGarden_whitelogo_sm.png";
import styled from "styled-components";

const StyledForm = styled(CreateNewForm)`
  padding: 10px;
`;

export default () => (
  <div
    style={{
      width: "400px",
      margin: "50px auto",
      padding: "50px",
      backgroundColor: "#363640",
    }}
  >
    <h2 style={{ fontWeight: "500" }}>Create New Account</h2>
    <StyledForm />
  </div>
);
