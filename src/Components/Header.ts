import Headroom from "headroom.js";
import DOM from "../DOM";
import Router from "../Router";
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
    if (!route.name) return;

    const li = document.createElement("li");
    if (Router.getCurrentPath() === route.path) {
      li.classList.add("active");
    }

    const anchor = document.createElement("a");
    anchor.href = route.path;
    anchor.textContent = route.name;

    anchor.addEventListener("click", ev => {
      if (ev.ctrlKey || ev.shiftKey || ev.metaKey) {
        return;
      }
      ev.preventDefault();

      if (window.location.href === anchor.href) return;
      if (!window.location.href.startsWith(anchor.href)) {
        const prevActive = ul.querySelector(".active");
        if (prevActive && prevActive !== li) prevActive.classList.remove("active");
        if (!li.classList.contains("active")) li.classList.add("active");
      }

      console.info("Header.ts Router.navigate");
      Router.navigate(anchor.href);
    });

    li.appendChild(anchor);
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
