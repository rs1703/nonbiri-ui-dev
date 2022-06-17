import { BuildURL, CreateRef, SendRequest, WithMutex } from "../../App";
import { Paths } from "../../constants";
import dictionary from "../../dictionary";
import DOM from "../../DOM";
import { CreateAnchor } from "../../DOMElements";
import Context, { MountedRef } from "./Context";

let extensions: (update?: boolean) => void;

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
      extensions(true);
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
      extensions(true);
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

const sources = () => {
  const container = DOM.getContainer();
  if (!container || container.lastElementChild?.classList.contains("sources")) {
    return;
  }

  const div = document.createElement("div");
  div.id = "extensions";
  div.classList.add("sources");

  const list = document.createElement("ul");
  Context.installedExtensions.forEach(ext => {
    const item = document.createElement("li");
    const anchor = CreateAnchor(`/browse/${ext.domain}`);

    const figure = document.createElement("figure");
    const img = document.createElement("img");
    // TODO: add icon
    // eg: localhost:1234/icon/domain.com.png
    figure.appendChild(img);

    const metadata = document.createElement("div");
    const name = document.createElement("h3");
    name.classList.add("name");
    name.textContent = ext.name;

    const language = document.createElement("span");
    language.classList.add("language");
    language.textContent = ext.language;
    // TODO: transform language code to language name

    metadata.append(name, language);
    anchor.append(figure, metadata);

    item.appendChild(anchor);
    list.appendChild(item);
  });
  div.appendChild(list);

  if (container.lastElementChild?.classList.contains("index")) {
    container.lastElementChild.replaceWith(div);
  } else {
    if (container.lastElementChild.tagName !== "HEADER") {
      container.lastElementChild.remove();
    }
    container.appendChild(div);
  }
};

extensions = (update?: boolean) => {
  const container = DOM.getContainer();
  if (
    !container ||
    (container.lastElementChild?.classList.contains("index") && !update) ||
    (!container.lastElementChild?.classList.contains("index") && update)
  ) {
    return;
  }

  const div = document.createElement("div");
  div.id = "extensions";
  div.classList.add("index");

  const installed = document.createElement("ul");
  installed.classList.add("installed");

  const all = document.createElement("ul");
  all.classList.add("all");

  Context.extensions.forEach((extension: Extension) => {
    const create = (ext: Extension) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";

      attachOnClick(ext, button);

      const figure = document.createElement("figure");
      const img = document.createElement("img");
      // TODO: add icon
      // eg: localhost:1234/icon/domain.com.png
      figure.appendChild(img);

      const metadata = document.createElement("div");
      const name = document.createElement("h3");
      name.classList.add("name");
      name.textContent = extension.name;

      const language = document.createElement("span");
      language.classList.add("language");
      language.textContent = extension.language;
      // TODO: transform language code to language name

      const version = document.createElement("span");
      version.classList.add("version");
      version.textContent = `v${extension.version}`;

      metadata.append(name, language, version);
      button.append(figure, metadata);

      item.appendChild(button);
      return item;
    };

    if (extension.isInstalled) installed.appendChild(create(extension));
    else all.appendChild(create(extension));
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

  if (container.lastElementChild?.classList.contains("sources")) {
    container.lastElementChild.replaceWith(div);
  } else {
    if (container.lastElementChild.tagName !== "HEADER") {
      container.lastElementChild.remove();
    }
    container.appendChild(div);
  }
};

export default {
  sources,
  extensions
};
