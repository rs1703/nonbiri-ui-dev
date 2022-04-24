import { Router, sendRequest } from "../../App";
import DOM from "../../DOM";
import Filter from "../Filter";
import { Search } from "../Icons";
import Context from "./Context";

const SearchForm = () => {
  const form = document.createElement("form");
  form.classList.add("search-form");

  const input = document.createElement("input");
  input.classList.add("search-input");
  input.type = "text";
  input.placeholder = "Search";
  input.autocomplete = "off";
  input.required = true;

  const searchParams = new URLSearchParams(window.location.search);
  input.defaultValue = searchParams.get("q") || "";

  const submit = document.createElement("button");
  submit.classList.add("search-btn");
  submit.type = "submit";
  submit.appendChild(Search());

  form.append(input, submit);

  form.addEventListener("submit", ev => {
    ev.preventDefault();

    const url = new URL(window.location.href);
    url.searchParams.set("q", input.value);

    Router.navigate(url.pathname + url.search, { preventDefault: true });
  });
  return form;
};

const Header = async () => {
  const { currentExtension: currExt } = Context;
  const filters = await sendRequest<Filter[]>(`/api/extensions/filters?id=${currExt.id}`);

  const header = document.createElement("header");
  header.classList.add("header");
  header.appendChild(SearchForm());

  if (filters?.length) {
    const filterContainer = document.createElement("div");
    filterContainer.classList.add("filters");

    filters.forEach(filter => {
      filterContainer.appendChild(Filter(filter));
    });

    const applyBtn = document.createElement("button");
    applyBtn.classList.add("apply-btn");
    applyBtn.type = "button";
    applyBtn.textContent = "Apply";

    const resetBtn = document.createElement("button");
    resetBtn.classList.add("reset-btn");
    resetBtn.type = "button";
    resetBtn.textContent = "Reset";

    filterContainer.append(applyBtn, resetBtn);
    header.appendChild(filterContainer);
  }

  DOM.getContainer().appendChild(header);
};

export default Header;
