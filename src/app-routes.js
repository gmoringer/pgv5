import { withNavigationWatcher } from "./contexts/navigation";
import {
  HomePage,
  TasksPage,
  ProfilePage,
  PropertList,
  PropertyListPage,
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
];

export default routes.map((route) => {
  return {
    ...route,
    component: withNavigationWatcher(route.component),
  };
});
