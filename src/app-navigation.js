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
        text: "PO Log CURRENT",
        path: "/polog",
      },
      {
        text: "PO Log Archive",
        path: "/pologarchive",
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
