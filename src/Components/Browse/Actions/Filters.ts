import Router from "../../../Router";
import Filter from "../../Filter";
import Context from "../Context";

const ignoreFields = ["q", "id"];

const create = () => {
  if (!Context.filters?.length) {
    return undefined;
  }

  const container = document.createElement("div");
  container.classList.add("filters");

  Context.filters.forEach(filter => {
    container.appendChild(Filter(filter));
  });

  const footer = document.createElement("footer");
  footer.classList.add("filters-footer");

  const resetBtn = document.createElement("button");
  resetBtn.classList.add("reset-btn");
  resetBtn.type = "button";
  resetBtn.textContent = "Reset";

  resetBtn.addEventListener("click", () => {
    const url = new URL(window.location.href);
    container.querySelectorAll("input, select").forEach((element: HTMLInputElement | HTMLSelectElement) => {
      const currentValue = url.searchParams.get(element.name);
      if (element instanceof HTMLSelectElement) {
        const defaultOption = element.querySelector("[data-default]") as HTMLOptionElement;
        if (currentValue === element.value) {
          element.value = defaultOption?.value || element.options[0].value;
        } else {
          element.value = currentValue || defaultOption?.value || element.options[0].value;
        }
      } else if (element instanceof HTMLInputElement) {
        const isDefault = element.hasAttribute("data-default");
        if (element.type === "checkbox") {
          element.checked = url.searchParams.getAll(element.name).includes(element.value) || isDefault;
        } else {
          element.checked = url.searchParams.get(element.name) === element.value || isDefault;
        }
      }
    });
  });

  const applyBtn = document.createElement("button");
  applyBtn.classList.add("apply-btn");
  applyBtn.type = "button";
  applyBtn.textContent = "Apply";

  applyBtn.addEventListener("click", ev => {
    const url = new URL(window.location.href);
    Array.from(url.searchParams.keys()).forEach(key => {
      if (!ignoreFields.includes(key)) {
        url.searchParams.delete(key);
      }
    });

    container.querySelectorAll("input, select").forEach(element => {
      if (element instanceof HTMLInputElement && element.checked) {
        if (element.type === "checkbox") {
          url.searchParams.append(element.name, element.value);
        } else if (element.type === "radio") {
          url.searchParams.set(element.name, element.value);
        }
      } else if (element instanceof HTMLSelectElement && element.value) {
        url.searchParams.set(element.name, element.value);
      }
    });
    Router.navigate(url.pathname + url.search, { preventDefault: true });
  });

  footer.append(resetBtn, applyBtn);
  container.appendChild(footer);
  return container;
};

const destroy = () => {};

export default { create, destroy };
