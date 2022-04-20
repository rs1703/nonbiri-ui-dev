import browse from "./components/browse";
import history from "./components/history";
import library from "./components/library";
import updates from "./components/updates";

const routes = {
  library: {
    name: "Library",
    path: "/",
    component: library
  },
  history: {
    name: "History",
    path: "/history",
    component: history
  },
  updates: {
    name: "Updates",
    path: "/updates",
    component: updates
  },
  browse: {
    name: "Browse",
    path: "/browse",
    component: browse
  }
};

export default routes;
