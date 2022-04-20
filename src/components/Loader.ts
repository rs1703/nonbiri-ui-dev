let cachedLoader: HTMLElement;

const render = (parent: HTMLElement) => {
  if (cachedLoader) {
    parent.appendChild(cachedLoader);
    return;
  }

  const loader = document.createElement("div");
  loader.classList.add("loader");

  const spinner = document.createElement("div");
  spinner.classList.add("spinner");

  const spinnerBars = document.createElement("div");
  spinnerBars.classList.add("spinner-bars");

  const spinnerBar1 = document.createElement("div");
  spinnerBar1.classList.add("spinner-bar");

  const spinnerBar2 = document.createElement("div");
  spinnerBar2.classList.add("spinner-bar");

  const spinnerBar3 = document.createElement("div");
  spinnerBar3.classList.add("spinner-bar");

  spinnerBars.append(spinnerBar1, spinnerBar2, spinnerBar3);
  spinner.append(spinnerBars);
  loader.append(spinner);

  cachedLoader = loader;
  parent.append(loader);
};

const destroy = () => {
  cachedLoader?.remove();
};

export default { render, destroy };
