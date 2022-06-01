import Router from "./Router";

interface Anchor extends HTMLAnchorElement {
  addClickPreHook: (fn: (preventDefaultRef?: Ref<boolean>) => void) => void;
  addClickPostHook: (fn: () => void) => void;
  removeClickPreHook: (fn: (preventDefaultRef?: Ref<boolean>) => void) => void;
  removeClickPostHook: (fn: () => void) => void;
}

export const CreateAnchor = <T>(href: string, state: State<T> = {}) => {
  const anchor = document.createElement("a") as Anchor;
  anchor.href = href;

  const preHooks = new Set<() => void>();
  anchor.addClickPreHook = fn => preHooks.add(fn);
  anchor.removeClickPreHook = fn => preHooks.delete(fn);

  const postHooks = new Set<() => void>();
  anchor.addClickPostHook = fn => postHooks.add(fn);
  anchor.removeClickPostHook = fn => postHooks.delete(fn);

  anchor.addEventListener("click", ev => {
    if (ev.ctrlKey || ev.shiftKey || ev.metaKey) {
      return;
    }

    ev.preventDefault();
    const preventDefaultRef = { current: false };

    preHooks.forEach(fn => fn());
    if (!preventDefaultRef.current) {
      Router.navigate(anchor.href, state);
      postHooks.forEach(fn => fn());
    }
  });
  return anchor;
};

const pops = new WeakMap<HTMLElement, number>();
export const ShowPopup = (v: HTMLElement, stateRef: Ref<boolean>) => {
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
