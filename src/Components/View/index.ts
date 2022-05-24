import { formatGroups, formatUnix, loadImage, sendRequest } from "../../App";
import { MangaStatusKeys } from "../../constants";
import DOM, { defineComponent } from "../../DOM";
import { createAnchor } from "../../DOMElements";
import Router from "../../Router";
import Browse from "../Browse";
import { WithLoader } from "../Loader";
import Context from "./Context";

const ignoreStates = ["data", ...Browse.ignoreStates];
const mounted = { current: false };

const loaderOptions = {
  classList: ["fetching"],
  size: 40,
  strokeWidth: 2
};

const buildUrl = (pathname: string) => {
  const url = new URL(window.location.origin);
  url.pathname = pathname;

  url.searchParams.set("id", Router.getCurrentExtensionId());
  url.searchParams.set("path", window.location.pathname.split("/").slice(3).join("/"));

  return url.href;
};

class View {
  extId: string;
  banner: HTMLDivElement;

  header: HTMLElement;
  aside: HTMLElement;
  cover: HTMLImageElement;
  metadata: HTMLDivElement;
  title: HTMLHeadingElement;
  status: HTMLSpanElement;
  artists: HTMLDivElement;
  authors: HTMLDivElement;
  genres: HTMLDivElement;
  description: HTMLDivElement;
  chapters: HTMLDivElement;

  constructor() {
    this.extId = Router.getCurrentExtensionId();
    this.banner = document.createElement("div");
    this.header = document.createElement("header");
    this.aside = document.createElement("aside");
    this.cover = document.createElement("img");
    this.metadata = document.createElement("div");
    this.title = document.createElement("h1");
    this.status = document.createElement("span");
    this.artists = document.createElement("div");
    this.authors = document.createElement("div");
    this.genres = document.createElement("div");
    this.description = document.createElement("div");
    this.chapters = document.createElement("div");

    this.banner.classList.add("banner");
    this.cover.classList.add("cover");
    this.metadata.classList.add("metadata");
    this.title.classList.add("title");
    this.artists.classList.add("artists");
    this.authors.classList.add("authors");
    this.genres.classList.add("genres");
    this.description.classList.add("description");
    this.chapters.classList.add("chapters");

    const bannerWrapper = document.createElement("header");
    {
      const shadow = document.createElement("div");
      shadow.classList.add("shadow");
      bannerWrapper.append(this.banner, shadow);
    }

    const coverWrapper = document.createElement("figure");
    coverWrapper.classList.add("loading");
    coverWrapper.appendChild(this.cover);
    this.aside.appendChild(coverWrapper);

    {
      const wrapper = document.createElement("div");
      const label = document.createElement("b");

      wrapper.classList.add("status");
      label.textContent = "Status";
      [this.status.textContent] = MangaStatusKeys;

      wrapper.append(label, this.status);
    }
    {
      const wrapper = document.createElement("div");
      const label = document.createElement("b");

      wrapper.classList.add("artists");
      label.textContent = "Artist(s)";
      wrapper.append(label, this.artists);
    }
    {
      const wrapper = document.createElement("div");
      const label = document.createElement("b");

      wrapper.classList.add("authors");
      label.textContent = "Author(s)";
      wrapper.append(label, this.authors);
    }
    {
      const wrapper = document.createElement("div");
      const label = document.createElement("b");

      wrapper.classList.add("genres");
      label.textContent = "Genre(s)";
      wrapper.append(label, this.genres);
    }

    this.metadata.classList.add("metadata");
    this.metadata.append(
      this.title,
      this.status.parentElement,
      this.artists.parentElement,
      this.authors.parentElement,
      this.genres.parentElement,
      this.description
    );
    this.header.append(this.aside, this.metadata);

    const content = document.createElement("div");
    content.classList.add("content");
    {
      const list = document.createElement("ul");
      const label = document.createElement("h2");
      label.textContent = "Chapters";
      this.chapters.append(label, list);
    }

    content.append(this.header, this.chapters);

    this.update();
    this.updateChapters();

    DOM.getContainer().append(bannerWrapper, content);
  }

  update() {
    if (Context.data?.coverUrl && this.cover.src !== Context.data?.coverUrl) {
      this.banner.style.backgroundImage = `url(${Context.data.coverUrl})`;
      this.cover.parentElement.classList.add("loading");
      loadImage(Context.data.coverUrl).then(() => {
        this.cover.parentElement.classList.remove("loading");
        this.cover.src = Context.data.coverUrl;
      });
    }

    this.title.textContent = Context.data?.title;
    this.status.textContent = MangaStatusKeys[Context.data.status || 0];
    this.description.textContent = Context.data?.description || "No description.";

    {
      let fragment: DocumentFragment;
      if (Context.data?.artists?.length) {
        fragment = document.createDocumentFragment();
        Context.data.artists.forEach((artist, i) => {
          if (i) fragment.appendChild(document.createTextNode(", "));
          const anchor = createAnchor("");
          anchor.textContent = artist;
          fragment.appendChild(anchor);
        });
      }

      while (this.artists.firstChild) {
        this.artists.lastChild.remove();
      }

      if (fragment) {
        this.artists.appendChild(fragment);
        this.metadata.insertBefore(this.artists.parentElement, this.status.nextElementSibling || this.description);
      } else this.artists.parentElement.remove();
    }
    {
      let fragment: DocumentFragment;
      if (Context.data?.authors?.length) {
        fragment = document.createDocumentFragment();
        Context.data.authors.forEach((author, i) => {
          if (i) fragment.appendChild(document.createTextNode(", "));
          const anchor = createAnchor("");
          anchor.textContent = author;
          fragment.appendChild(anchor);
        });
      }

      while (this.authors.firstChild) {
        this.authors.lastChild.remove();
      }

      if (fragment) {
        this.authors.appendChild(fragment);
        this.metadata.insertBefore(
          this.authors.parentElement,
          this.artists.parentElement.nextElementSibling || this.description
        );
      } else this.authors.parentElement.remove();
    }
    {
      let fragment: DocumentFragment;
      if (Context.data?.genres?.length) {
        fragment = document.createDocumentFragment();
        Context.data.genres.forEach((genre, i) => {
          if (i) fragment.appendChild(document.createTextNode(", "));
          const anchor = createAnchor("");
          anchor.textContent = genre;
          fragment.appendChild(anchor);
        });
      }

      while (this.genres.firstChild) {
        this.genres.lastChild.remove();
      }

      if (fragment) {
        this.genres.appendChild(fragment);
        this.metadata.insertBefore(
          this.genres.parentElement,
          this.authors.parentElement.nextElementSibling || this.description
        );
      } else this.genres.parentElement.remove();
    }

    if (this.metadata.childElementCount) {
      this.header.insertBefore(this.metadata, this.cover.parentElement.nextElementSibling);
    } else this.metadata.remove();
  }

  updateChapters() {
    let fragment: DocumentFragment;
    if (Context.data?.chapters?.length) {
      fragment = document.createDocumentFragment();
      Context.data.chapters.forEach(chapter => {
        const item = document.createElement("li");
        const anchor = createAnchor(`/read/${this.extId}${chapter.path}`);
        item.classList.add("chapter");

        const name = document.createElement("h3");
        name.classList.add("name");
        name.textContent = chapter.name;

        const info = document.createElement("div");
        info.classList.add("info");

        const date = document.createElement("span");
        date.classList.add("publishedAt");
        date.textContent = formatUnix(chapter.publishedAt);
        info.appendChild(date);

        if (chapter.groups?.length) {
          const groups = document.createElement("span");
          groups.classList.add("groups");
          groups.textContent = formatGroups(chapter.groups);
          info.append(" • ", groups);
        }

        anchor.append(name, info);
        item.appendChild(anchor);
        fragment.appendChild(item);
      });
    }

    const list = this.chapters.querySelector("ul");
    while (list.firstChild) {
      list.lastChild.remove();
    }

    if (fragment) list.appendChild(fragment);
    else {
      const p = document.createElement("p");
      p.textContent = "No chapters.";
      list.appendChild(p);
    }

    const count = document.querySelector(".count") || document.createElement("span");
    count.classList.add("count");
    if (Context.data?.chapters?.length) {
      count.textContent = ` (${Context.data.chapters.length})`;
      this.chapters.querySelector("h2").appendChild(count);
    } else count.remove();
  }
}

const render = async () => {
  DOM.createContainer("view");

  const state = Router.getState<Manga>();
  if (state.data) {
    Object.assign(Context, { data: state.data });
    Router.setTitle(Context.data.title);

    const view = new View();
    await WithLoader(async () => {
      Context.data = await sendRequest<Manga>(buildUrl("/api/metadata"));
      if (!mounted.current) return;

      Router.setTitle(Context.data.title);
      view.update();

      Context.data.chapters = (await sendRequest<ApiChapterResponse>(buildUrl("/api/chapters")))?.entries;
      if (!mounted.current) return;
      view.updateChapters();
    }, loaderOptions);
  } else {
    await WithLoader(async () => {
      Context.data = await sendRequest<Manga>(buildUrl("/api/metadata"));
    });

    Router.setTitle(Context.data.title);
    const view = new View();
    view.update();

    Context.data.chapters = (
      await WithLoader(() => sendRequest<ApiChapterResponse>(buildUrl("/api/chapters")), loaderOptions)
    )?.entries;

    if (!mounted.current) return;
    view.updateChapters();
  }
};

const destroy = () => {};

export default defineComponent({
  ignoreStates,
  mounted,
  render,
  destroy
});
