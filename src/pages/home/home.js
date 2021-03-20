import React from "react";
import "./home.scss";
import pgLogo from "../../img/PacificGarden_whitelogo_sm.png";

export default () => (
  <React.Fragment>
    <h2 className={"content-block"}>Home</h2>
    <div className={"content-block"}>
      <div
        className={"dx-card responsive-paddings"}
        style={{
          backgroundColor: "rgba(103, 119, 81, 1)",
          margin: "auto",
        }}
      >
        <div className={"logos-container"}>
          <img className={"pg-logo"} src={pgLogo} alt="NO" />
        </div>
        <p style={{ textAlign: "center", alignSelf: "stretch" }}>
          Thanks for using the Pacific Gardens & Company Business Portal.
          Current Version is v1.01
        </p>
      </div>
    </div>
  </React.Fragment>
);
