import Header from "./Components/Header";
import Router from "./Router";
import Routes from "./Routes";
import "./styles/index.less";

const main = () => {
  Router.addOnChangeHandler(() => {
    const route = Router.getCurrentRoute();
    if ([Routes.library, Routes.history, Routes.updates, Routes.browse, Routes.view].includes(route)) {
      [Header].forEach(c => c.render());
    }
  });
  Router.init(Routes);
};

if (document.readyState === "complete") main();
else document.addEventListener("DOMContentLoaded", main);
