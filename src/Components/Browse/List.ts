import { BuildURL, CreateRef, GetLanguageName, SendRequest, WithMutex } from "../../App";
import { Paths } from "../../constants";
import dictionary from "../../dictionary";
import DOM from "../../DOM";
import { CreateAnchor } from "../../DOMElements";
import Context, { MountedRef } from "./Context";

let create: (update?: boolean) => void;

const getIconURL = (ext: Extension) => `${window.location.origin}/icons/${ext.domain}/v${ext.version}`;

const attachOnClick = (ext: Extension, target: HTMLButtonElement) => {
  const container = document.createElement("div");
  const mutexRef = CreateRef(false);
  let state = false;

  const clear = () => {
    while (container.firstChild) {
      container.lastChild.remove();
    }
  };

  const installHandler = () => {
    WithMutex(mutexRef, async () => {
      clear();

      const text = document.createElement("span");
      text.textContent = "Installing...";
      container.appendChild(text);

      const url = BuildURL(Paths.installExtension, { domain: ext.domain });
      const { statusCode, content } = await SendRequest<Extension[]>(url, "POST");
      if (!MountedRef.current) {
        return;
      }

      // TODO: handle statusCode
      content.forEach(extension => {
        if (!Context.installedExtensions.has(extension.domain)) {
          Context.installedExtensions.set(extension.domain, extension);
        }
      });
      ext.isInstalled = true;
      create(true);
    });
  };

  const uninstallHandler = () => {
    WithMutex(mutexRef, async () => {
      clear();

      const text = document.createElement("span");
      text.textContent = "Uninstalling...";
      container.appendChild(text);

      const url = BuildURL(Paths.uninstallExtension, { domain: ext.domain });
      const { statusCode } = await SendRequest<Extension[]>(url, "POST");
      if (!MountedRef.current) {
        return;
      }

      // TODO: handle statusCode
      Context.installedExtensions.delete(ext.domain);
      ext.isInstalled = false;
      create(true);
    });
  };

  const hide = () => {
    container.remove();
    clear();
  };

  const show = () => {
    clear();

    const installStateBtn = document.createElement("button");
    installStateBtn.type = "button";
    installStateBtn.textContent = dictionary.EN[ext.isInstalled ? 8 : 7];

    if (ext.isInstalled) {
      installStateBtn.addEventListener("click", () => {
        clear();

        const title = document.createElement("b");
        title.textContent = "Are you sure?";

        const no = document.createElement("button");
        no.type = "button";
        no.textContent = "No";
        no.addEventListener("click", show);

        const yes = document.createElement("button");
        yes.type = "button";
        yes.textContent = "Yes";
        yes.addEventListener("click", uninstallHandler);

        container.append(title, no, yes);
      });
    } else {
      installStateBtn.addEventListener("click", installHandler);
    }

    container.appendChild(installStateBtn);
    target.after(container);
  };

  target.addEventListener("click", ev => {
    if (mutexRef.current) {
      return;
    }

    if (state) hide();
    else show();
    state = !state;
  });
};

create = (update?: boolean) => {
  const container = DOM.getContainer();
  if (!container || (container.firstElementChild?.id === "extensions" && !update)) {
    return;
  }

  const div = document.createElement("div");
  div.id = "extensions";

  const installed = document.createElement("div");
  installed.classList.add("installed");

  const all = document.createElement("div");
  all.classList.add("all");

  Context.extensions.forEach((ext: Extension) => {
    let item: HTMLAnchorElement | HTMLButtonElement;

    if (ext.isInstalled) {
      item = CreateAnchor(`/browse/${ext.domain}`);
    } else {
      item = document.createElement("button");
      item.type = "button";
    }

    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = getIconURL(ext);
    figure.appendChild(img);

    const metadata = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = ext.name;

    let nsfw: HTMLElement;
    if (ext.isNsfw) {
      nsfw = document.createElement("span");
      nsfw.classList.add("nsfw");
      nsfw.textContent = "18+";
    }

    const language = document.createElement("span");
    if (ext.language.toLowerCase() === "all") {
      language.textContent = "All";
    } else {
      language.textContent = GetLanguageName(ext.language);
    }

    const version = document.createElement("span");
    version.textContent = `${ext.version}`;

    const top = document.createElement("div");
    top.append(name, nsfw);
    metadata.append(top, language, version);

    if (ext.description) {
      const description = document.createElement("p");
      description.textContent = ext.description;
      metadata.appendChild(description);
    }

    const actions = document.createElement("div");
    const mutexRef = CreateRef(false);
    if (ext.isInstalled) {
      const uninstall = document.createElement("button");
      uninstall.type = "button";
      uninstall.textContent = dictionary.EN["8"];
      uninstall.ariaLabel = uninstall.textContent;

      uninstall.addEventListener("click", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();

        WithMutex(mutexRef, async () => {
          uninstall.textContent = "Uninstalling...";

          const url = BuildURL(Paths.uninstallExtension, { domain: ext.domain });
          const { statusCode } = await SendRequest<Extension[]>(url, "POST");
          if (!MountedRef.current) {
            return;
          }

          // TODO: handle statusCode
          Context.installedExtensions.delete(ext.domain);
          ext.isInstalled = false;
          create(true);
        });
      });
      actions.appendChild(uninstall);
    } else {
      const install = document.createElement("button");
      install.type = "button";
      install.textContent = dictionary.EN["7"];
      install.ariaLabel = install.textContent;

      install.addEventListener("click", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();

        WithMutex(mutexRef, async () => {
          install.textContent = "Installing...";

          const url = BuildURL(Paths.installExtension, { domain: ext.domain });
          const { statusCode, content } = await SendRequest<Extension[]>(url, "POST");
          if (!MountedRef.current) {
            return;
          }

          // TODO: handle statusCode
          content.forEach(extension => {
            if (!Context.installedExtensions.has(extension.domain)) {
              Context.installedExtensions.set(extension.domain, extension);
            }
          });
          ext.isInstalled = true;
          create(true);
        });
      });
      actions.appendChild(install);
    }

    item.append(figure, metadata, actions);
    if (ext.isInstalled) installed.appendChild(item);
    else all.appendChild(item);
  });

  if (installed.childElementCount) {
    const title = document.createElement("h2");
    title.textContent = `${dictionary.EN["5"]} (${installed.childElementCount})`;
    div.append(title, installed);
  }

  if (all.childElementCount) {
    const title = document.createElement("h2");
    title.textContent = `${dictionary.EN["6"]} (${all.childElementCount})`;
    div.append(title, all);
  }

  while (container.firstChild) {
    container.lastChild.remove();
  }
  container.appendChild(div);
};

const destroy = () => {};

export default {
  create,
  destroy
};
