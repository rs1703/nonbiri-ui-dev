export default (filter: Filter) => {
  const root = document.createElement("div");
  root.classList.add("filter");
  root.dataset.key = filter.key;
  if (filter.excludedKey) {
    root.dataset.excludedKey = filter.excludedKey;
  }
  root.dataset.type = filter.type;

  const title = document.createElement("strong");
  title.classList.add("title");
  title.textContent = filter.title;

  const container = document.createElement("div");
  container.classList.add("options");

  let select: HTMLSelectElement;
  const isSelect = filter.type === "select";
  const isCheckbox = filter.type === "checkbox";

  if (isSelect) {
    select = document.createElement("select");
    select.name = filter.key;
  }

  const searchParams = new URLSearchParams(window.location.search);
  filter.options.forEach(({ key, value, defaultOption }) => {
    if (isSelect) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = key;

      if (defaultOption) {
        option.dataset.default = "true";
      }

      if (searchParams.has(filter.key)) {
        option.defaultSelected = searchParams.get(filter.key) === value;
      } else option.defaultSelected = defaultOption;

      select.appendChild(option);
      return;
    }

    const label = document.createElement("label");
    const input = document.createElement("input");
    const span = document.createElement("span");

    input.type = filter.type;
    input.name = filter.key;
    input.value = value;
    span.textContent = key;

    if (defaultOption) {
      input.dataset.default = "true";
    }

    if (isCheckbox && filter.excludedKey) {
      input.addEventListener("click", ev => {
        console.info(input.name, input.checked);
        if (!input.checked) {
          if (input.name === filter.excludedKey) {
            input.name = filter.key;
            input.removeAttribute("data-excluded");
          } else {
            input.name = filter.excludedKey;
            input.checked = true;
            input.dataset.excluded = "true";
          }
        } else {
          input.checked = true;
        }
      });
    }

    if (searchParams.has(filter.key)) {
      if (isCheckbox) input.defaultChecked = searchParams.getAll(filter.key).includes(value);
      else input.defaultChecked = searchParams.get(filter.key) === value;
    } else input.defaultChecked = defaultOption;

    label.append(input, span);
    container.appendChild(label);
  });

  if (select) container.appendChild(select);
  root.append(title, container);
  return root;
};
