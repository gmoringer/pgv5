// import React from "react";

export const navigation = [
  {
    text: "Home",
    path: "/home",
    icon: "home",
  },
  {
    text: "PO Management",
    icon: "folder",
    items: [
      {
        text: "Property List",
        path: "/propertylist",
      },
      {
        text: "Job List",
        path: "/joblist",
      },
      {
        text: "PO Log",
        path: "/polog",
      },
      {
        text: "Labor Log",
        path: "/laborlog",
      },
      {
        text: "Vendor List",
        path: "/vendorlist",
      },
      {
        text: "Workers",
        path: "/workers",
      },
    ],
  },
];

export const adminNavigation = {
  text: "Admin",
  icon: "group",
  items: [
    {
      text: "Users",
      path: "/allusers",
    },
    {
      text: "Create New User",
      path: "/createuser",
    },
  ],
};
