import header from "./components/header";
import router from "./router";
import routes from "./routes";
import "./styles/index.less";

const main = () => {
  router.addOnChangeHandler(() => {
    const route = router.getCurrentRoute();
    if ([routes.library, routes.history, routes.updates, routes.browse].includes(route)) {
      [header].forEach(c => c.render());
    }
  });
  router.init();
};

if (document.readyState === "complete") main();
else document.addEventListener("DOMContentLoaded", main);
