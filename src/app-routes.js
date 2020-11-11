import { withNavigationWatcher } from "./contexts/navigation";
import {
  HomePage,
  TasksPage,
  ProfilePage,
  PropertyListPage,
  JobListPage,
  PoListPage,
  LaborLogListPage,
} from "./pages";

const routes = [
  // {
  //   path: "/tasks",
  //   component: TasksPage,
  // },
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
];

export default routes.map((route) => {
  return {
    ...route,
    component: withNavigationWatcher(route.component),
  };
});
