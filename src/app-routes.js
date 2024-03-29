import { withNavigationWatcher } from "./contexts/navigation";
import {
  HomePage,
  ProfilePage,
  PropertyListPage,
  JobListPage,
  PoListPage,
  LaborLogListPage,
  CreateNewAccount,
  AllUsers,
  LastWorked,
  VendorListPage,
  Workers,
  PoListPageArchive,
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
    path: "/pologarchive",
    component: PoListPageArchive,
  },
  {
    path: "/laborlog",
    component: LaborLogListPage,
  },
  {
    path: "/vendorlist",
    component: VendorListPage,
  },
  {
    path: "/workers",
    component: Workers,
  },
  { path: "/createuser", component: CreateNewAccount },
  { path: "/allusers", component: AllUsers },
  { path: "/lastworked", component: LastWorked },
];

export default routes.map((route) => {
  return {
    ...route,
    component: withNavigationWatcher(route.component),
  };
});
