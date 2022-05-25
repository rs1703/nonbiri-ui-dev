import { sendRequest } from "../../../App";
import DOM from "../../../DOM";
import { FilterIcon } from "../../Icons";
import Popup from "../../Popup";
import Context from "../Context";
import Filters from "./Filters";
import SearchForm from "./SearchForm";

const create = async () => {
  if (!Context.filters?.size) {
    await sendRequest<Filter[]>(`/api/extensions/filters?sourceId=${Context.currentExtension.id}`).then(
      filters => (Context.filters = new Set(filters))
    );
  }

  const popup = new Popup();
  popup.root.classList.add("actions");
  popup.root.id = "browse-actions";

  const showBtn = document.createElement("button");
  showBtn.classList.add("show-actions");
  showBtn.type = "button";
  showBtn.appendChild(FilterIcon());

  showBtn.addEventListener("click", () => {
    showBtn.remove();
    popup.show();
  });

  popup.addOnHideHandler(() => DOM.getContainer().appendChild(showBtn));
  popup.append(SearchForm.create(), Filters.create());

  return showBtn;
};

const destroy = () => {
  SearchForm.destroy();
  Filters.destroy();
};

export default { create, destroy };
