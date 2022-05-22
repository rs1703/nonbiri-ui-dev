export default (filter: Filter) => {
  const root = document.createElement("div");
  root.classList.add("filter", `filter-${filter.key}`, filter.key);
  root.dataset.key = filter.key;
  root.dataset.type = filter.type;

  const name = document.createElement("h2");
  name.classList.add("name");
  name.textContent = filter.name;

  const container = document.createElement("div");
  container.classList.add("options");

  const searchParams = new URLSearchParams(window.location.search);

  let select: HTMLSelectElement;
  if (filter.type === "select") {
    select = document.createElement("select");
    select.name = filter.key;

    const currentValue = searchParams.get(filter.key);
    if (currentValue && Object.values(filter.options).includes(currentValue)) {
      select.value = currentValue;
    }
  }

  Object.keys(filter.options).forEach(key => {
    if (filter.type === "checkbox" || filter.type === "radio") {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = filter.type;
      input.name = filter.key;
      input.value = filter.options[key];

      if (filter.type === "checkbox") {
        input.defaultChecked = searchParams.getAll(filter.key).includes(filter.options[key]);
      } else {
        input.defaultChecked = searchParams.get(filter.key) === filter.options[key];
      }

      const span = document.createElement("span");
      span.textContent = key;
      container.appendChild(label);
    } else if (filter.type === "select") {
      const option = document.createElement("option");
      option.value = filter.options[key];
      option.defaultSelected = searchParams.get(filter.key) === filter.options[key];
      option.textContent = key;
      select.appendChild(option);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = key;
      btn.dataset.value = filter.options[key];
      container.appendChild(btn);
    }
  });

  if (select) container.appendChild(select);
  root.append(name, container);
  return root;
};
