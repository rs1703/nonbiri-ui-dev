import { SendRequest } from "../../../App";
import DOM from "../../../DOM";
import Router from "../../../Router";
import Icons from "../../Icons";
import Popup from "../../Popup";
import Context, { MountedRef } from "../Context";
import Filters from "./Filters";
import SearchForm from "./SearchForm";

const create = async () => {
  if (!Context.filters?.length) {
    const { content } = await SendRequest<Filter[]>(
      `/api/extensions/filters?domain=${Context.currentExtension.domain}`
    );
    if (!MountedRef.current) {
      return undefined;
    }

    if (content) {
      Context.filters = content;
      Router.setState({ lastBrowseContext: Context });
    }
  }

  const popup = new Popup();
  popup.root.classList.add("actions");
  popup.root.id = "browse-actions";

  const showBtn = document.createElement("button");
  showBtn.classList.add("show-actions");
  showBtn.type = "button";
  showBtn.appendChild(Icons.filter());

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
