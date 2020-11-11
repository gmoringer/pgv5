import { withNavigationWatcher } from "./contexts/navigation";
import {
  HomePage,
  TasksPage,
  ProfilePage,
  PropertyListPage,
  JobListPage,
  PoListPage,
  LaborLogListPage,
  CreateNewAccount,
} from "./pages";

const routes = [
  {
    path: "/profile",
    component: ProfilePage,
  },
  {
    path: "/home",
    component: HomePage,
  },
  {
    path: "/propertylist",
    component: PropertyListPage,
  },
  {
    path: "/joblist",
    component: JobListPage,
  },
  {
    path: "/polog",
    component: PoListPage,
  },
  {
    path: "/laborlog",
    component: LaborLogListPage,
  },
  { path: "/create-account", component: CreateNewAccount },
];

export default routes.map((route) => {
  return {
    ...route,
    component: withNavigationWatcher(route.component),
  };
});
