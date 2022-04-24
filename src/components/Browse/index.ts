import { Router, sendRequest } from "../../App";
import DOM from "../../DOM";
import loader from "../Loader";
import Context, { id } from "./Context";
import Header from "./Header";
import { Extensions, Sources } from "./list";

interface BrowseData {
  id: string;
  page: number;
  hasNext: boolean;
  entries: Manga[];
  execDuration: number;
}

let searchParamsChangeEventListener: EventListenerOrEventListenerObject;
let pageChangeEventListener: EventListenerOrEventListenerObject;

const Browse = async () => {
  await Header();

  const { currentExtension: currExt } = Context;
  Router.setTitle(currExt.name);
  let currentPage = 0;

  const url = new URL(window.location.origin);
  url.search = window.location.search;
  url.searchParams.set("id", currExt.id);

  const container = document.createElement("div");
  container.classList.add("entries");
  DOM.getContainer().appendChild(container);

  const fetch = async (page = 1) => {
    currentPage = page;

    url.searchParams.set("page", page.toString());
    if (url.searchParams.has("q")) {
      url.pathname = "/api/search";
    } else url.pathname = "/api/manga";

    const data = await sendRequest<BrowseData>(url.href);
    const fragment = document.createDocumentFragment();

    data.entries?.forEach(entry => {
      if (!entry.path.startsWith("/")) {
        entry.path = `/${entry.path}`;
      }

      const item = document.createElement("div");
      item.classList.add("entry");

      const anchor = DOM.createAnchor(`/view/${currExt.id}${entry.path}`);

      const top = document.createElement("div");
      top.classList.add("figure");

      const thumbnail = document.createElement("img");
      thumbnail.classList.add("thumbnail");
      thumbnail.src = entry.coverUrl;

      top.appendChild(thumbnail);

      const metadata = document.createElement("div");
      metadata.classList.add("metadata");

      const title = document.createElement("h3");
      title.classList.add("title");

      const span = document.createElement("span");
      span.textContent = entry.title;

      title.appendChild(span);
      metadata.appendChild(title);

      anchor.append(top, metadata);
      item.appendChild(anchor);
      fragment.appendChild(item);
    });

    if (data.hasNext) {
      const lastIdx = Math.max(0, data.entries.length - 3);
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          fetch(page + 1);
        }
      });
      observer.observe(fragment.children[lastIdx]);
    }

    container.appendChild(fragment);
    window.dispatchEvent(new Event("pagination"));
  };
  fetch();

  searchParamsChangeEventListener = () => {
    if (window.location.search !== url.search) {
      container.replaceChildren("");
      url.search = window.location.search;
      url.searchParams.set("id", currExt.id);

      fetch();
    }
  };

  pageChangeEventListener = () => {
    Router.setTitle(`${currExt.name} - Browse: Page ${currentPage}`);
  };

  window.addEventListener("popstate", searchParamsChangeEventListener);
  window.addEventListener("pagination", pageChangeEventListener);
};

const render = async () => {
  Context.currentExtension = null;
  DOM.clear();

  const container = DOM.createContainer("browse");
  if (!Context.extensions.size) {
    loader.render(container);
    (await sendRequest<Extension[]>("/api/extensions/index"))?.forEach(ext => Context.extensions.set(ext.id, ext));
    (await sendRequest<Extension[]>("/api/extensions"))?.forEach(ext => Context.installedExtensions.set(ext.id, ext));
    loader.destroy();
  }

  const currExtId = Router.getCurrentExtensionId();
  if (currExtId) {
    Context.currentExtension = Context.installedExtensions.get(currExtId);
    if (Context.currentExtension) Browse();
    else Router.navigate("/browse");
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
  if (searchParamsChangeEventListener) {
    window.removeEventListener("popstate", searchParamsChangeEventListener);
  }

  if (pageChangeEventListener) {
    window.removeEventListener("pagination", pageChangeEventListener);
  }
};

export default { render, destroy };
