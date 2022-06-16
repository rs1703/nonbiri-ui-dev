import DOM from "../DOM";

interface Options {
  parent?: HTMLElement;
  classList?: string[];
  id?: string;

  size?: number;
  strokeWidth?: number;
}

const Loader = ({ parent, classList, id, size, strokeWidth }: Options = {}) => {
  if (!parent) parent = DOM.getContainer();

  if (!Array.isArray(classList)) classList = ["global"];
  if (!size) size = 120;
  if (!strokeWidth) strokeWidth = 1;

  const loader = document.createElement("div");
  loader.classList.add("loader");

  if (classList) loader.classList.add(...classList);
  if (id) loader.id = id;

  const spinner = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  spinner.classList.add("spinner");
  spinner.setAttribute("viewBox", "0 0 24 24");
  spinner.setAttribute("fill", "none");
  spinner.setAttribute("stroke", "currentColor");

  const sizeStr = size.toString();
  spinner.setAttribute("width", sizeStr);
  spinner.setAttribute("height", sizeStr);
  spinner.setAttribute("stroke-width", strokeWidth.toString());

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "12");
  circle.setAttribute("cy", "12");
  circle.setAttribute("r", "10");

  spinner.appendChild(circle);
  loader.append(spinner);
  parent.append(loader);

  return loader;
};

export const WithLoader = async <T>(callback: () => Promise<T>, options?: Options) => {
  const loader = Loader(options);
  let result: T;
  try {
    result = await callback();
  } finally {
    loader.remove();
  }
  return result;
};

export default Loader;
