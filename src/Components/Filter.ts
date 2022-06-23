import { State } from "../constants";

const createText = (filter: TextObject, root: HTMLDivElement) => {
  const p = document.createElement("p");
  p.textContent = filter.value;
  root.appendChild(p);
};

const createInput = (filter: Input, root: HTMLDivElement) => {
  const input = document.createElement("input");
  input.name = filter.key;
  input.type = "text";
  input.value = filter.value || filter.defaultValue || "";

  const container = document.createElement("div");
  container.classList.add("options");
  container.appendChild(input);
  root.appendChild(container);
};

const createState = (filter: StateObject, root: HTMLDivElement) => {
  if (!filter.options?.length) return;
  const f = filter as Filter;

  const container = document.createElement("div");
  container.classList.add("options");

  filter.options.forEach(option => {
    const label = document.createElement("label");
    label.classList.add("option");

    const input = document.createElement("input");
    input.name = option.key || filter.key;
    input.value = option.value;
    input.defaultChecked = option.defaultState === State.ON;

    if (f.type === "tristate") {
      input.type = "checkbox";
      if (option.defaultState === State.EX) {
        input.name = f.excludedKey;
        input.defaultChecked = true;
      }

      input.addEventListener("click", () => {
        if (input.name === f.excludedKey) {
          input.name = f.key;
          input.removeAttribute("data-ex");
        } else if (!input.checked) {
          input.name = f.excludedKey;
          input.checked = true;
          input.dataset.ex = "1";
        }
      });
    } else {
      input.type = f.type;
    }

    const span = document.createElement("span");
    span.textContent = option.title || option.key;

    label.append(input, span);
    container.appendChild(label);
  });

  root.appendChild(container);
};

const createSelect = (filter: Select, root: HTMLDivElement) => {
  if (!filter.options?.length) return;
  const container = document.createElement("div");
  container.classList.add("options");

  const select = document.createElement("select");
  select.name = filter.key;

  filter.options.forEach(option => {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.title || option.key;
    item.defaultSelected = option.defaultState === State.ON;
    select.appendChild(item);
  });

  container.appendChild(select);
  root.appendChild(container);
};

export default (filter: Filter) => {
  const root = document.createElement("div");
  root.classList.add("filter", filter.type);

  if (filter.key) {
    root.dataset.key = filter.key;
  }
  if (filter.type === "tristate") {
    root.dataset.excludedKey = filter.excludedKey;
  }
  root.dataset.type = filter.type;

  if (filter.title) {
    const title = document.createElement("strong");
    title.classList.add("title");
    title.textContent = filter.title;
    root.appendChild(title);
  }

  if (filter.description) {
    const description = document.createElement("p");
    description.classList.add("description");
    description.textContent = filter.description;
    root.appendChild(description);
  }

  switch (filter.type) {
    case "text" as any:
      createText(filter as any, root);
      break;
    case "input":
      createInput(filter, root);
      break;
    case "checkbox":
    case "radio":
    case "tristate":
      createState(filter, root);
      break;
    case "select":
      createSelect(filter, root);
      break;
    default:
      break;
  }
  return root;
};
