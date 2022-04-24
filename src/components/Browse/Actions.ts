import { Router, sendRequest } from "../../App";
import Filter from "../Filter";
import { Search } from "../Icons";
import ViewMode from "../ViewMode";
import Context from "./Context";

const SearchForm = () => {
  const form = document.createElement("form");
  form.classList.add("search-form");

  const input = document.createElement("input");
  input.classList.add("search-input");
  input.type = "text";
  input.placeholder = "Search";
  input.autocomplete = "off";

  const searchParams = new URLSearchParams(window.location.search);
  input.defaultValue = searchParams.get("q") || "";

  const submit = document.createElement("button");
  submit.classList.add("search-btn");
  submit.type = "submit";
  submit.appendChild(Search());

  form.addEventListener("submit", ev => {
    ev.preventDefault();

    const url = new URL(window.location.href);
    if (input.value) url.searchParams.set("q", input.value);
    else url.searchParams.delete("q");

    Router.navigate(url.pathname + url.search, {
      preventDefault: true
    });
  });

  form.append(input, submit);
  return form;
};

const Filters = () => {
  if (!Context.filters?.size) {
    return undefined;
  }

  const container = document.createElement("div");
  container.classList.add("filters");

  Context.filters.forEach(filter => {
    container.appendChild(Filter(filter));
  });

  const applyBtn = document.createElement("button");
  applyBtn.classList.add("apply-btn");
  applyBtn.type = "button";
  applyBtn.textContent = "Apply";

  const ignore = ["q", "id"];
  applyBtn.addEventListener("click", ev => {
    ev.preventDefault();

    const url = new URL(window.location.href);
    Array.from(url.searchParams.keys()).forEach(key => {
      if (!ignore.includes(key)) {
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

    Router.navigate(url.pathname + url.search, {
      preventDefault: true
    });
  });

  const resetBtn = document.createElement("button");
  resetBtn.classList.add("reset-btn");
  resetBtn.type = "button";
  resetBtn.textContent = "Reset";

  resetBtn.addEventListener("click", ev => {
    ev.preventDefault();

    const url = new URL(window.location.href);
    container.querySelectorAll("input, select").forEach(element => {
      if (element instanceof HTMLInputElement) {
        if (element.type === "checkbox") {
          element.checked = url.searchParams.getAll(element.name).includes(element.value);
        } else {
          element.checked = url.searchParams.get(element.name) === element.value;
        }
      } else if (element instanceof HTMLSelectElement) {
        element.value = url.searchParams.get(element.name) || element.options[0].value;
      }
    });
  });

  container.append(applyBtn, resetBtn);
  return container;
};

const Actions = async () => {
  await sendRequest<Filter[]>(`/api/extensions/filters?id=${Context.currentExtension.id}`).then(
    filters => (Context.filters = new Set(filters))
  );

  const actions = document.createElement("div");
  actions.classList.add("actions");

  actions.append(ViewMode("browse"), SearchForm(), Filters());

  return actions;
};

export default Actions;
