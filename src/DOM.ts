let rootElement: HTMLElement;
let container: HTMLElement;

export const DefineComponent = (component: Component) => component;

const getRoot = () => (rootElement ??= document.getElementById("app"));

const destroyContainer = () => {
  container?.remove();
  container = null;
};

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

const getHeader = () => document.getElementById("header");
const getContainer = () => container;

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

export default {
  clear,
  getRoot,
  getHeader,
  getContainer,
  createContainer,
  clearContainer,
  destroyContainer
};
