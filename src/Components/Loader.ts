import DOM from "../DOM";

let cachedLoader: HTMLElement;

const render = (parent?: HTMLElement) => {
  if (!parent) {
    parent = DOM.getContainer();
  }

  if (cachedLoader) {
    parent.appendChild(cachedLoader);
    return;
  }

  const loader = document.createElement("div");
  loader.classList.add("loader");

  const spinner = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  spinner.classList.add("spinner");
  spinner.setAttribute("viewBox", "0 0 24 24");
  spinner.setAttribute("width", "24");
  spinner.setAttribute("height", "24");
  spinner.setAttribute("fill", "none");
  spinner.setAttribute("stroke", "currentColor");
  spinner.setAttribute("stroke-width", "2");

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "12");
  circle.setAttribute("cy", "12");
  circle.setAttribute("r", "10");

  spinner.appendChild(circle);
  loader.append(spinner);

  cachedLoader = loader;
  parent.append(loader);
};

const destroy = () => {
  cachedLoader?.remove();
};

export default { render, destroy };
