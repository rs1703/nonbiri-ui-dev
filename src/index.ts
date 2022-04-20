import router from "./router";
import "./styles/index.less";

const main = () => {
  router.init();
};

if (document.readyState === "complete") main();
else document.addEventListener("DOMContentLoaded", main);
