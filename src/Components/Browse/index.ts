import { SendRequest } from "../../App";
import DOM, { DefineComponent } from "../../DOM";
import Router from "../../Router";
import Entry from "../Entry";
import { WithLoader } from "../Loader";
import Actions from "./Actions";
import Context, { ID, MountedRef } from "./Context";
import List from "./List";

const ignoreFields = ["q", "domain", "page"];

let searchParamsChangeEventListener: EventListenerOrEventListenerObject;
let pageChangeEventListener: EventListenerOrEventListenerObject;

const loaderOptions = {
  classList: ["pagination"],
  size: 40,
  strokeWidth: 2
};

const create = async () => {
  const url = new URL(window.location.origin);
  url.search = window.location.search;
  url.searchParams.set("domain", Context.currentExtension.domain);

  const container = document.createElement("div");
  container.classList.add("entries");

  let appendEntries: (data: Manga[]) => void;

  const paginate = async (page: number) => {
    url.searchParams.set("page", Math.max(page || 1, 1).toString());
    if (Array.from(url.searchParams.keys()).some(key => !ignoreFields.includes(key))) {
      url.pathname = "/api/search";
    } else url.pathname = "/api/manga";

    const { content } = await SendRequest<ApiBrowse>(url.href);
    if (!MountedRef.current) {
      return;
    }

    Context.page = content.page;
    Context.hasNext = content.hasNext;

    if (content.entries?.length) {
      const entries = [];
      content.entries.forEach(entry => {
        if (Context.index.has(entry.path)) {
          return;
        }

        Context.index.set(entry.path, Context.entries.length);
        Context.entries.push(entry);
        entries.push(entry);
      });
      appendEntries(entries);
    }

    window.dispatchEvent(new Event("pagination"));
    Router.setState({ lastBrowseContext: Context });
  };

  appendEntries = (data: Manga[]) => {
    if (!data?.length) return;

    const fragment = document.createDocumentFragment();
    data?.forEach(e => {
      const entry = Entry(e, MountedRef);
      entry.addReadStateListener(() => {
        Router.setState({ lastBrowseContext: Context });
      });
      fragment.appendChild(entry);
    });

    container.appendChild(fragment);
    if (Context.hasNext) {
      setTimeout(() => {
        const observers: IntersectionObserver[] = [];
        const observerFn = (entries: IntersectionObserverEntry[]) => {
          if (entries[0].isIntersecting) {
            observers.forEach(observer => observer.disconnect());
            WithLoader(() => paginate(Context.page + 1), loaderOptions);
          }
        };

        const lastIdx = container.childElementCount - 1;
        const targetIdx = Math.min(lastIdx, Math.max(0, container.childElementCount - Math.floor(data.length / 2)));

        if (targetIdx !== lastIdx) {
          const observer = new IntersectionObserver(observerFn);
          observer.observe(container.children[targetIdx]);
          observers.push(observer);
        }

        const observer = new IntersectionObserver(observerFn);
        observer.observe(container.children[lastIdx]);
        observers.push(observer);
      }, 0);
    }
  };

  if (Context.entries?.length) {
    appendEntries(Context.entries);
  } else {
    await paginate(Context.page);
    if (!MountedRef.current) {
      return undefined;
    }
  }

  searchParamsChangeEventListener = async () => {
    if (window.location.search !== url.search) {
      while (container.firstChild) {
        container.removeChild(container.lastChild);
      }

      url.search = window.location.search;
      url.searchParams.set("domain", Context.currentExtension.domain);

      Context.entries = [];

      await WithLoader(() => paginate(1), loaderOptions);
    }
  };

  pageChangeEventListener = () => {
    Router.setTitle(`${Context.currentExtension.name} - Browse: Page ${Context.page}`);
  };

  if (Context.page > 1) {
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
      {
        const { content } = await SendRequest<Extension[]>("/api/extensions/index");
        if (!MountedRef.current) {
          return;
        }
        if (content) content.forEach(ext => Context.extensions.set(ext.domain, ext));
      }

      const { content } = await SendRequest<Extension[]>("/api/extensions");
      if (MountedRef.current && content?.length) {
        content.forEach(ext => Context.installedExtensions.set(ext.domain, ext));
      }
    });
    if (!MountedRef.current) return;
  }

  const currExtId = Router.getCurrentExtensionId();
  if (currExtId) {
    Context.currentExtension = Context.installedExtensions.get(currExtId);
    if (Context.currentExtension) {
      Router.setTitle(Context.currentExtension.name);

      // prettier-ignore
      const [main, actions] = await WithLoader<HTMLElement[]>(async () => {
        const m = await create();
        if (!MountedRef.current) return [];
        return [m, await Actions.create()];
      });

      if (MountedRef.current) {
        container.append(main, actions);
      }
      return;
    }

    console.info("Browse.index.ts Router.navigate");
    Router.navigate("/browse");
    return;
  }

  const header = document.createElement("header");
  header.classList.add(ID);

  const leftBtn = document.createElement("button");
  leftBtn.textContent = "Sources";
  leftBtn.addEventListener("click", ev => {
    ev.preventDefault();
    List.sources();
  });

  const rightBtn = document.createElement("button");
  rightBtn.textContent = "Extensions";
  rightBtn.addEventListener("click", ev => {
    ev.preventDefault();
    List.extensions();
  });

  header.append(leftBtn, rightBtn);
  container.appendChild(header);
  List.sources();
};

const destroy = () => {
  Context.currentExtension = undefined;
  Context.filters = undefined;
  Context.entries = [];
  Context.index.clear();

  if (searchParamsChangeEventListener) {
    window.removeEventListener("popstate", searchParamsChangeEventListener);
  }

  if (pageChangeEventListener) {
    window.removeEventListener("pagination", pageChangeEventListener);
  }

  Actions.destroy();
};

export default DefineComponent({
  mountedRef: MountedRef,
  render,
  destroy
});
