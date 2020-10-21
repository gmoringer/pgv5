import { withNavigationWatcher } from "./contexts/navigation";
import {
  HomePage,
  TasksPage,
  ProfilePage,
  PropertyListPage,
  JobListPage,
} from "./pages";

const routes = [
  {
    path: "/tasks",
    component: TasksPage,
  },
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
];

export default routes.map((route) => {
  return {
    ...route,
    component: withNavigationWatcher(route.component),
  };
});
