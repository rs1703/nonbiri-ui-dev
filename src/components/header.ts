import router from "../router";
import routes from "../routes";

let cachedNavigation: HTMLElement;
const createNavigation = () => {
  if (cachedNavigation) return cachedNavigation;

  const nav = document.createElement("nav");
  const ul = document.createElement("ul");

  Object.values(routes).forEach(route => {
    const li = document.createElement("li");
    if (router.getCurrentPath() === route.path) {
      li.classList.add("active");
    }

    const a = document.createElement("a");
    a.href = route.path;
    a.textContent = route.name;

    a.addEventListener("click", ev => {
      ev.preventDefault();

      const currentPath = router.getCurrentPath();
      if (currentPath === a.href) return;

      if (!currentPath.startsWith(a.href)) {
        const prevActive = ul.querySelector(".active");
        if (prevActive && prevActive !== li) prevActive.classList.remove("active");
        if (!li.classList.contains("active")) li.classList.add("active");
      }
      router.navigate(a.href);
    });

    li.appendChild(a);
    ul.appendChild(li);
  });
  nav.appendChild(ul);

  cachedNavigation = nav;
  return nav;
};

let cachedSearch: HTMLInputElement;
const createSearch = () => {
  if (cachedSearch) return cachedSearch;

  const input = document.createElement("input");
  input.setAttribute("type", "text");

  cachedSearch = input;
  return input;
};

const render = () => {
  const root = document.getElementById("app");
  if (!root || document.getElementById("header")) return;

  const header = document.createElement("header");
  header.id = "header";

  header.append(createNavigation(), createSearch());
  root.appendChild(header);
};

export default { render };
