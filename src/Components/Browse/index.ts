import { Router, sendRequest } from "../../App";
import DOM from "../../DOM";
import Entry from "../Entry";
import { WithLoader } from "../Loader";
import Actions from "./Actions";
import Context, { id } from "./Context";
import { Extensions, Sources } from "./list";

interface BrowseData {
  id: string;
  page: number;
  hasNext: boolean;
  entries: Manga[];
  execDuration: number;
}

const ignoreFields = ["q", "id"];
const ignoreStates = ["lastBrowseData", "lastBrowseEntries"];

let searchParamsChangeEventListener: EventListenerOrEventListenerObject;
let pageChangeEventListener: EventListenerOrEventListenerObject;

const paginationLoaderOptions = {
  classList: ["pagination"],
  size: 40,
  strokeWidth: 2
};

const create = async () => {
  Router.setTitle(Context.currentExtension.name);

  const url = new URL(window.location.origin);
  url.search = window.location.search;
  url.searchParams.set("id", Context.currentExtension.id);

  const container = document.createElement("div");
  container.classList.add("entries");

  let lastBrowseData: BrowseData = window.history.state?.lastBrowseData || undefined;
  const lastBrowseEntries: Manga[] = window.history.state?.lastBrowseEntries || [];
  let currentPage: number = lastBrowseData?.page || 1;

  let appendEntries: (data: Manga[], hasNext: boolean) => void;
  const fetch = async (page: number) => {
    url.searchParams.set("page", page.toString());
    if (Array.from(url.searchParams.keys()).some(key => !ignoreFields.includes(key))) {
      url.pathname = "/api/search";
    } else url.pathname = "/api/manga";

    const data = await sendRequest<BrowseData>(url.href);
    appendEntries(data.entries, data.hasNext);

    lastBrowseData = data;
    if (data.entries?.length) {
      lastBrowseEntries.push(...data.entries);
    }

    currentPage = page;
    window.dispatchEvent(new Event("pagination"));
    Router.setState({ lastBrowseData, lastBrowseEntries });
  };

  appendEntries = (data: Manga[], hasNext: boolean) => {
    if (!data?.length) return;

    const fragment = document.createDocumentFragment();
    data?.forEach(e => fragment.appendChild(Entry(e)));

    if (hasNext) {
      const lastIdx = Math.max(0, Math.floor(data.length / 2) - 1) || data.length - 1;
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          WithLoader(() => fetch(currentPage + 1), paginationLoaderOptions);
        }
      });
      observer.observe(fragment.children[lastIdx]);
    }
    container.appendChild(fragment);
  };

  if (currentPage === 1) await fetch(currentPage);
  else appendEntries(lastBrowseEntries, lastBrowseData.hasNext);

  searchParamsChangeEventListener = async () => {
    if (window.location.search !== url.search) {
      while (container.firstChild) {
        container.removeChild(container.lastChild);
      }

      url.search = window.location.search;
      url.searchParams.set("id", Context.currentExtension.id);

      lastBrowseData = undefined;
      lastBrowseEntries.length = 0;

      await WithLoader(() => fetch(1), paginationLoaderOptions);
    }
  };

  pageChangeEventListener = () => {
    Router.setTitle(`${Context.currentExtension.name} - Browse: Page ${currentPage}`);
  };

  if (currentPage > 1) {
    pageChangeEventListener(undefined);
  }

  window.addEventListener("popstate", searchParamsChangeEventListener);
  window.addEventListener("pagination", pageChangeEventListener);

  return container;
};

const render = async () => {
  DOM.clear();

  const container = DOM.createContainer("browse");
  if (!Context.extensions.size) {
    await WithLoader(async () => {
      (await sendRequest<Extension[]>("/api/extensions/index"))?.forEach(ext => Context.extensions.set(ext.id, ext));
      (await sendRequest<Extension[]>("/api/extensions"))?.forEach(ext => Context.installedExtensions.set(ext.id, ext));
    });
  }

  const currExtId = Router.getCurrentExtensionId();
  if (currExtId) {
    Context.currentExtension = Context.installedExtensions.get(currExtId);
    if (Context.currentExtension) {
      // prettier-ignore
      const [main, actions] = await WithLoader(async () => [
        await create(), 
        await Actions.create(),
      ]);
      container.append(main, actions);
    } else Router.navigate("/browse");
  } else {
    const header = document.createElement("header");
    header.classList.add(id);

    const leftBtn = document.createElement("button");
    leftBtn.textContent = "Sources";
    leftBtn.addEventListener("click", ev => {
      ev.preventDefault();
      Sources();
    });

    const rightBtn = document.createElement("button");
    rightBtn.textContent = "Extensions";
    rightBtn.addEventListener("click", ev => {
      ev.preventDefault();
      Extensions();
    });

    header.append(leftBtn, rightBtn);
    container.appendChild(header);
    Sources();
  }
};

const destroy = () => {
  Context.currentExtension = undefined;
  Context.filters = undefined;

  if (searchParamsChangeEventListener) {
    window.removeEventListener("popstate", searchParamsChangeEventListener);
  }

  if (pageChangeEventListener) {
    window.removeEventListener("pagination", pageChangeEventListener);
  }

  Actions.destroy();
};

export default { ignoreStates, render, destroy };
