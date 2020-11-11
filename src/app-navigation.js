import React from "react";
import { useAuth } from "./contexts/auth";

export const navigation = [
  {
    text: "Home",
    path: "/home",
    icon: "home",
  },
  {
    text: "Profile",
    path: "/profile",
    icon: "card",
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
    ],
  },
];

export const adminNavigation = {
  text: "Admin",
  icon: "folder",
  items: [
    {
      text: "Create New User",
      path: "/newuser",
    },
  ],
};
