import Router from "./Router";

let rootElement: HTMLElement;
let container: HTMLElement;

let getRoot: () => HTMLElement;
let destroyContainer: () => void;

const clear = (keepCommons = true) => {
  const root = getRoot();
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i] as HTMLElement;
    if (!(child.dataset.common && keepCommons)) {
      child.remove();
    }
  }
  destroyContainer();
};

getRoot = () => (rootElement ??= document.getElementById("app"));
const getHeader = () => document.getElementById("header");
const getContainer = () => container;

interface Anchor extends HTMLAnchorElement {
  addClickPreHook: (fn: () => void) => void;
  removeClickPreHook: (fn: () => void) => void;
}

const createAnchor = <T>(href: string, state: State<T> = {}) => {
  const anchor = document.createElement("a") as Anchor;
  anchor.href = href;

  const preHooks = new Set<() => void>();
  anchor.addClickPreHook = fn => preHooks.add(fn);
  anchor.removeClickPreHook = fn => preHooks.delete(fn);

  anchor.addEventListener("click", ev => {
    ev.preventDefault();
    preHooks.forEach(fn => fn());
    Router.navigate(anchor.href, state);
  });

  return anchor;
};

const createContainer = (id: string, ...classes: string[]) => {
  if (container) return container;

  container = document.createElement("main");
  container.id = id;

  if (classes.length) {
    container.classList.add(...classes);
  }

  const header = getHeader();
  if (header) header.after(container);
  else getRoot().appendChild(container);

  return container;
};

const clearContainer = () => {
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.lastChild);
  }
};

destroyContainer = () => {
  container?.remove();
  container = null;
};

const pops = new WeakMap<HTMLElement, number>();
const showPopup = (v: HTMLElement, stateRef: { current: boolean }) => {
  if (pops.has(v)) return;
  pops.set(v, 0);

  const root = document.createElement("div");
  root.classList.add("pop");

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("close");
  closeBtn.type = "button";

  const closePop = () => {
    root.remove();
    pops.delete(v);
    stateRef.current = false;
  };

  closeBtn.addEventListener("click", ev => {
    ev.preventDefault();
    closePop();
  });

  root.append(closeBtn, v);
  document.body.appendChild(root);

  const onLocationChange = () => {
    closePop();
    window.removeEventListener("popstate", onLocationChange);
  };
  window.addEventListener("popstate", onLocationChange);
};

export default {
  clear,

  getRoot,
  getHeader,
  getContainer,

  createAnchor,
  createContainer,
  clearContainer,
  destroyContainer,

  showPopup
};
