import Browse from "./Components/Browse";
import History from "./Components/History";
import Library from "./Components/Library";
import Updates from "./Components/Updates";
import View from "./Components/View";

const Routes: { [key: string]: Route } = {
  library: {
    name: "Library",
    path: "/",
    component: Library
  },
  history: {
    name: "History",
    path: "/history",
    component: History
  },
  updates: {
    name: "Updates",
    path: "/updates",
    component: Updates
  },
  browse: {
    name: "Browse",
    path: "/browse",
    component: Browse
  },

  view: {
    path: "/view",
    component: View
  }
};

export default Routes;
