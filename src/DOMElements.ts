import Router from "./Router";

interface Anchor extends HTMLAnchorElement {
  addPreClickListener: (fn: (preventDefaultRef?: Ref<boolean>) => void) => void;
  removePreClickListener: (fn: (preventDefaultRef?: Ref<boolean>) => void) => void;
  addClickPostClickListener: (fn: () => void) => void;
  removePostClickListener: (fn: () => void) => void;
}

export const CreateAnchor = <T>(href: string, state: State<T> = {}) => {
  const anchor = document.createElement("a") as Anchor;
  anchor.href = href;

  const preHooks = new Set<() => void>();
  anchor.addPreClickListener = fn => preHooks.add(fn);
  anchor.removePreClickListener = fn => preHooks.delete(fn);

  const postHooks = new Set<() => void>();
  anchor.addClickPostClickListener = fn => postHooks.add(fn);
  anchor.removePostClickListener = fn => postHooks.delete(fn);

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
