import Router from "./Router";

interface Anchor extends HTMLAnchorElement {
  addClickPreHook: (fn: () => void) => void;
  removeClickPreHook: (fn: () => void) => void;
}

export const createAnchor = <T>(href: string, state: State<T> = {}) => {
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

const pops = new WeakMap<HTMLElement, number>();
export const showPopup = (v: HTMLElement, stateRef: { current: boolean }) => {
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
