import Router from "../../../Router";
import Icons from "../../Icons";

const sync = () => {
  const q = new URLSearchParams(window.location.search).get("q") || "";
  document.querySelectorAll(".search-input").forEach((input: HTMLInputElement) => {
    input.value = q;
  });
};

const create = () => {
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
  submit.appendChild(Icons.search({ size: 20, strokeWidth: 3 }));

  form.addEventListener("submit", ev => {
    ev.preventDefault();

    const url = new URL(window.location.href);
    if (input.value) url.searchParams.set("q", input.value);
    else url.searchParams.delete("q");

    Router.navigate(url.pathname + url.search, { preventDefault: true });
    sync();
  });

  form.append(input, submit);
  return form;
};

const destroy = () => {};

export default { create, destroy, sync };
