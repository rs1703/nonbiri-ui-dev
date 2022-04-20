import { Router } from "../App";
import DOM from "../DOM";
import loader from "./Loader";

interface Extension {
  id: string;
  baseUrl: string;
  name: string;
  language: string;
  version: string;

  hasUpdate?: boolean;
  isInstalled?: boolean;
}

const hm = new Map<string, string>();
const H = (v: string) => {
  if (hm.has(v)) {
    return hm.get(v);
  }

  const result = `b_${v}`;
  hm.set(v, result);
  return result;
};

const XU = "EvRN8V";

const extensions = new Map<string, Extension>();
const installedExtensions = new Map<string, Extension>();

const fetchExtensions = async () => {
  (await fetch("/api/extensions/index").then(res => res.json()))?.forEach((ext: Extension) => {
    extensions.set(ext.id, ext);
  });

  (await fetch("/api/extensions").then(res => res.json()))?.forEach((ext: Extension) => {
    installedExtensions.set(ext.id, ext);
  });
};

const getCurrentExtensionId = () => window.location.pathname.split("/")[2];

const createExtItem = (ext: Extension) => {
  const item = document.createElement("li");
  item.dataset.id = H(ext.id);

  const btn = document.createElement("button");
  btn.type = "button";

  if (ext.hasUpdate) item.dataset.hasUpdate = "true";
  if (ext.isInstalled) item.dataset.installed = "true";

  const name = document.createElement("span");
  name.classList.add(H("name"));
  name.textContent = ext.name;

  const version = document.createElement("span");
  version.classList.add(H("version"));
  version.textContent = ext.version;

  const language = document.createElement("span");
  language.classList.add(H("language"));
  language.textContent = ext.language;

  btn.append(name, version, language);
  item.appendChild(btn);
  return item;
};

const attachSourceOnClick = (ext: Extension, btn: HTMLButtonElement) => {
  btn.addEventListener("click", ev => {
    ev.preventDefault();
    Router.navigate(`/browse/${ext.id}`);
  });
};

const listSources = () => {
  const container = DOM.getContainer();
  if (!container || container.lastElementChild?.classList.contains(H("sources"))) {
    return;
  }

  const div = document.createElement("div");
  div.id = H("extensions");
  div.classList.add(H("sources"));

  const list = document.createElement("ul");
  installedExtensions.forEach((ext: Extension) => {
    const item = createExtItem(ext);
    attachSourceOnClick(ext, item.firstElementChild as HTMLButtonElement);

    list.appendChild(item);
  });
  div.appendChild(list);

  if (container.lastElementChild?.classList.contains(H("index"))) {
    container.lastElementChild.replaceWith(div);
  } else {
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      if (!child.classList.contains(XU)) {
        child.remove();
      }
    }
    container.appendChild(div);
  }
};

const attachExtensionOnClick = (ext: Extension, button: HTMLButtonElement) => {
  const actionsContainer = document.createElement("div");
  let container: HTMLElement;
  let state = false;

  const hide = () => {
    actionsContainer.remove();
    container?.remove();
    container = null;
  };

  const uninstallBtn = document.createElement("button");
  uninstallBtn.type = "button";
  uninstallBtn.textContent = "Uninstall";
  uninstallBtn.addEventListener("click", ev => {
    ev.preventDefault();

    container = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = "Are you sure?";

    const nBtn = document.createElement("button");
    nBtn.type = "button";
    nBtn.textContent = "Cancel";

    // eslint-disable-next-line @typescript-eslint/no-shadow
    nBtn.addEventListener("click", ev => {
      ev.preventDefault();

      hide();
      button.after(actionsContainer);
    });

    const yBtn = document.createElement("button");
    yBtn.type = "button";
    yBtn.textContent = "Confirm";

    // eslint-disable-next-line @typescript-eslint/no-shadow
    yBtn.addEventListener("click", ev => {
      ev.preventDefault();

      hide();
      state = false;
    });

    container.append(title, nBtn, yBtn);
    actionsContainer.remove();
    button.after(container);
  });
  actionsContainer.appendChild(uninstallBtn);

  button.addEventListener("click", ev => {
    ev.preventDefault();

    if (state) hide();
    else button.after(actionsContainer);
    state = !state;
  });
};

const listExtensions = () => {
  const container = DOM.getContainer();
  if (!container || container.lastElementChild?.classList.contains(H("index"))) {
    return;
  }

  const div = document.createElement("div");
  div.id = H("extensions");
  div.classList.add(H("index"));

  const installedList = document.createElement("ul");
  installedList.classList.add(H("installed"));

  const allList = document.createElement("ul");
  allList.classList.add(H("all"));

  extensions.forEach((ext: Extension) => {
    const item = createExtItem(ext);
    attachExtensionOnClick(ext, item.firstElementChild as HTMLButtonElement);

    if (ext.isInstalled) installedList.appendChild(item);
    else allList.appendChild(item);
  });

  if (installedList.children.length) {
    const title = document.createElement("h2");
    title.textContent = `Installed (${installedList.children.length})`;
    div.append(title, installedList);
  }

  if (allList.children.length) {
    const title = document.createElement("h2");
    title.textContent = `All (${allList.children.length})`;
    div.append(title, allList);
  }

  if (container.lastElementChild?.classList.contains(H("sources"))) {
    container.lastElementChild.replaceWith(div);
  } else {
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      if (!child.classList.contains(XU)) {
        child.remove();
      }
    }
    container.appendChild(div);
  }
};

interface BrowseData {
  id: string;
  page: number;
  hasNext: boolean;
  entries: Manga[];
  execDuration: number;
}

const browse = async (ext: Extension) => {
  const container = DOM.getContainer();
  Router.setTitle(ext.name);

  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get("q") || "";

  let data: BrowseData;
  if (query) data = await fetch(`/api/search?id=${ext.id}&q=${query}`).then(res => res.json());
  else data = await fetch(`/api/manga?id=${ext.id}`).then(res => res.json());

  const fragment = document.createDocumentFragment();
  data.entries?.forEach(entry => {
    if (!entry.path.startsWith("/")) {
      entry.path = `/${entry.path}`;
    }

    const item = document.createElement("div");
    const anchor = DOM.createAnchor(`/view/${ext.id}${entry.path}`);

    const cover = document.createElement("div");
    const img = document.createElement("img");
    img.src = entry.coverUrl;
    cover.appendChild(img);

    const metadata = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = entry.title;
    metadata.appendChild(title);

    anchor.append(cover, metadata);
    item.appendChild(anchor);
    fragment.appendChild(item);
  });

  container.appendChild(fragment);
};

const render = async () => {
  DOM.clear();

  const container = DOM.createContainer("browse");
  if (!installedExtensions.size) {
    loader.render(container);
    await fetchExtensions().then(loader.destroy);
  }

  const currentExtensionId = getCurrentExtensionId();
  if (currentExtensionId) {
    if (installedExtensions.has(currentExtensionId)) {
      browse(installedExtensions.get(currentExtensionId));
    } else Router.navigate("/browse");
  } else {
    const header = document.createElement("header");
    header.classList.add(XU);

    const leftBtn = document.createElement("button");
    leftBtn.textContent = "Sources";
    leftBtn.addEventListener("click", ev => {
      ev.preventDefault();
      listSources();
    });

    const rightBtn = document.createElement("button");
    rightBtn.textContent = "Extensions";
    rightBtn.addEventListener("click", ev => {
      ev.preventDefault();
      listExtensions();
    });

    header.append(leftBtn, rightBtn);
    container.appendChild(header);
    listSources();
  }
};

export default { render };
