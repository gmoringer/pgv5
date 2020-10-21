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
        text: "Tasks",
        path: "/tasks",
      },
    ],
  },
];
