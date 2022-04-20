import App from "./App";
import Header from "./Components/Header";
import Router from "./Router";
import Routes from "./Routes";
import "./styles/index.less";

const main = () => {
  const router = new Router(Routes);
  App.setRouter(router);

  router.addOnChangeHandler(() => {
    const route = router.getCurrentRoute();
    if ([Routes.library, Routes.history, Routes.updates, Routes.browse].includes(route)) {
      [Header].forEach(c => c.render());
    }
  });
  router.init();
};

if (document.readyState === "complete") main();
else document.addEventListener("DOMContentLoaded", main);
