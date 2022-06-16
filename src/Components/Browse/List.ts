import DOM from "../../DOM";
import Router from "../../Router";
import Context, { ID } from "./Context";

const createExtItem = (ext: Extension) => {
  const item = document.createElement("li");
  item.dataset.domain = `ext-${ext.domain}`;

  const btn = document.createElement("button");
  btn.type = "button";

  if (ext.hasUpdate) item.dataset.hasUpdate = "true";
  if (ext.isInstalled) item.dataset.installed = "true";

  const name = document.createElement("span");
  name.classList.add("name");
  name.textContent = ext.name;

  const version = document.createElement("span");
  version.classList.add("version");
  version.textContent = ext.version;

  const language = document.createElement("span");
  language.classList.add("language");
  language.textContent = ext.language;

  btn.append(name, version, language);
  item.appendChild(btn);
  return item;
};

const attachSourceOnClick = (ext: Extension, btn: HTMLButtonElement) => {
  btn.addEventListener("click", ev => {
    console.info("List.ts Router.navigate");
    Router.navigate(`/browse/${ext.domain}`);
  });
};

const sources = () => {
  const container = DOM.getContainer();
  if (!container || container.lastElementChild?.classList.contains("sources")) {
    return;
  }

  const div = document.createElement("div");
  div.id = "extensions";
  div.classList.add("sources");

  const list = document.createElement("ul");
  Context.installedExtensions.forEach((ext: Extension) => {
    const item = createExtItem(ext);
    attachSourceOnClick(ext, item.firstElementChild as HTMLButtonElement);

    list.appendChild(item);
  });
  div.appendChild(list);

  if (container.lastElementChild?.classList.contains("index")) {
    container.lastElementChild.replaceWith(div);
  } else {
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      if (!child.classList.contains(ID)) {
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

const extensions = () => {
  const container = DOM.getContainer();
  if (!container || container.lastElementChild?.classList.contains("index")) {
    return;
  }

  const div = document.createElement("div");
  div.id = "extensions";
  div.classList.add("index");

  const installedList = document.createElement("ul");
  installedList.classList.add("installed");

  const allList = document.createElement("ul");
  allList.classList.add("all");

  Context.extensions.forEach((ext: Extension) => {
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

  if (container.lastElementChild?.classList.contains("sources")) {
    container.lastElementChild.replaceWith(div);
  } else {
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      if (!child.classList.contains(ID)) {
        child.remove();
      }
    }
    container.appendChild(div);
  }
};

export default {
  sources,
  extensions
};
