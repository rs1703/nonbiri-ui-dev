import Headroom from "headroom.js";
import { Router } from "../App";
import DOM from "../DOM";
import Routes from "../Routes";

let cachedNavigation: HTMLElement;
const createNavigation = () => {
  if (cachedNavigation) {
    return cachedNavigation;
  }

  const nav = document.createElement("nav");
  nav.classList.add("nav");
  nav.ariaLabel = "Primary";

  const ul = document.createElement("ul");

  Object.values(Routes).forEach(route => {
    const li = document.createElement("li");
    if (Router.getCurrentPath() === route.path) {
      li.classList.add("active");
    }

    const a = document.createElement("a");
    a.href = route.path;
    a.textContent = route.name;

    a.addEventListener("click", ev => {
      ev.preventDefault();

      if (window.location.href === a.href) return;
      if (!window.location.href.startsWith(a.href)) {
        const prevActive = ul.querySelector(".active");
        if (prevActive && prevActive !== li) prevActive.classList.remove("active");
        if (!li.classList.contains("active")) li.classList.add("active");
      }

      Router.navigate(a.href);
    });

    li.appendChild(a);
    ul.appendChild(li);
  });
  nav.appendChild(ul);

  cachedNavigation = nav;
  return nav;
};

const render = () => {
  const root = DOM.getRoot();
  if (!root || document.getElementById("header")) {
    return;
  }

  const header = document.createElement("header");
  header.setAttribute("data-common", "1");
  header.id = "header";

  header.append(createNavigation());
  root.appendChild(header);

  new Headroom(header)?.init();
};

export default { render };
