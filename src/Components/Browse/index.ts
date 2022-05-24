import { sendRequest } from "../../App";
import DOM, { defineComponent } from "../../DOM";
import Router from "../../Router";
import Entry from "../Entry";
import { WithLoader } from "../Loader";
import Actions from "./Actions";
import Context, { id } from "./Context";
import { Extensions, Sources } from "./list";

const ignoreFields = ["q", "id"];
const ignoreStates = ["lastBrowseContext"];

let searchParamsChangeEventListener: EventListenerOrEventListenerObject;
let pageChangeEventListener: EventListenerOrEventListenerObject;

const loaderOptions = {
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

  let appendEntries: (data: Manga[], hasNext: boolean) => void;
  let currentPage: number = Context.data?.page || 1;

  const paginate = async (page: number) => {
    try {
      url.searchParams.set("page", page.toString());
      if (Array.from(url.searchParams.keys()).some(key => !ignoreFields.includes(key))) {
        url.pathname = "/api/search";
      } else url.pathname = "/api/manga";

      Context.data = await sendRequest<ApiBrowseResponse>(url.href);
      appendEntries(Context.data.entries, Context.data.hasNext);

      if (Context.data.entries?.length) {
        Context.entries.push(...Context.data.entries);
      }

      window.dispatchEvent(new Event("pagination"));
      Router.setState({ lastBrowseContext: Context });
    } finally {
      currentPage = page;
    }
  };

  appendEntries = (data: Manga[], hasNext: boolean) => {
    if (!data?.length) return;

    const fragment = document.createDocumentFragment();
    data?.forEach(e => fragment.appendChild(Entry(Context.currentExtension.id, e)));

    container.appendChild(fragment);
    if (hasNext) {
      const observers: IntersectionObserver[] = [];
      const observerFn = (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting) {
          observers.forEach(observer => observer.disconnect());
          WithLoader(() => paginate(currentPage + 1), loaderOptions);
        }
      };

      const lastIdx = container.childElementCount - 1;
      const targetIdx = Math.min(
        lastIdx,
        Math.max(0, container.childElementCount - Math.floor(Context.data.entries.length / 2))
      );

      if (targetIdx !== lastIdx) {
        const observer = new IntersectionObserver(observerFn);
        observer.observe(container.children[targetIdx]);
        observers.push(observer);
      }

      const observer = new IntersectionObserver(observerFn);
      observer.observe(container.children[lastIdx]);
      observers.push(observer);
    }
  };

  if (Context.data && Context.entries?.length) {
    appendEntries(Context.entries, Context.data.hasNext);
  } else await paginate(currentPage);

  searchParamsChangeEventListener = async () => {
    if (window.location.search !== url.search) {
      while (container.firstChild) {
        container.removeChild(container.lastChild);
      }

      url.search = window.location.search;
      url.searchParams.set("id", Context.currentExtension.id);

      Context.data = undefined;
      Context.entries = [];

      await WithLoader(() => paginate(1), loaderOptions);
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
  const state = Router.getState();
  if (state.lastBrowseContext) {
    Object.assign(Context, state.lastBrowseContext);
  }

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
    } else {
      console.info("Browse.index.ts Router.navigate");
      Router.navigate("/browse");
    }
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

export default defineComponent({
  ignoreStates,
  render,
  destroy
});
