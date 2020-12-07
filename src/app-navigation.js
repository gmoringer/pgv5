import React from "react";

export const navigation = [
  {
    text: "Home",
    path: "/home",
    icon: "home",
  },
  // {
  //   text: "Profile",
  //   path: "/profile",
  //   icon: "card",
  // },
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
       path: "/vendorlist"
       }
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
    // {
    //   text: "Last Worked",
    //   path: "/lastworked",
    // },
    {
      text: "Create New User",
      path: "/createuser",
    },
  ],
};
