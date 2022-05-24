import { formatGroups, formatUnix, sendRequest } from "../../App";
import DOM, { defineComponent } from "../../DOM";
import { createAnchor } from "../../DOMElements";
import Router from "../../Router";
import Browse from "../Browse";
import { WithLoader } from "../Loader";
import Context from "./Context";

const ignoreStates = ["data", ...Browse.ignoreStates];

const buildUrl = (pathname: string) => {
  const url = new URL(window.location.origin);
  url.pathname = pathname;

  url.searchParams.set("id", Router.getCurrentExtensionId());
  url.searchParams.set("path", window.location.pathname.split("/").slice(3).join("/"));

  return url.href;
};

class View {
  banner: HTMLDivElement;

  sidebar: HTMLElement;
  cover: HTMLImageElement;
  metadata: HTMLDivElement;
  artists: HTMLDivElement;
  authors: HTMLDivElement;
  genres: HTMLDivElement;

  body: HTMLDivElement;
  title: HTMLHeadingElement;
  description: HTMLDivElement;

  chapters: HTMLDivElement;

  constructor() {
    this.banner = document.createElement("div");
    this.sidebar = document.createElement("aside");
    this.cover = document.createElement("img");
    this.metadata = document.createElement("div");
    this.artists = document.createElement("div");
    this.authors = document.createElement("div");
    this.genres = document.createElement("div");
    this.body = document.createElement("div");
    this.title = document.createElement("h1");
    this.description = document.createElement("div");
    this.chapters = document.createElement("div");

    this.banner.classList.add("banner");
    this.sidebar.classList.add("sidebar");
    this.metadata.classList.add("metadata");
    this.artists.classList.add("artists");
    this.authors.classList.add("authors");
    this.genres.classList.add("genres");
    this.body.classList.add("body");
    this.title.classList.add("title");
    this.description.classList.add("description");
    this.chapters.classList.add("chapters");

    const bannerWrapper = document.createElement("div");
    const bannerShadow = document.createElement("div");
    bannerWrapper.classList.add("banner-wrapper");
    bannerShadow.classList.add("shadow");
    bannerWrapper.append(this.banner, bannerShadow);

    const figure = document.createElement("figure");
    figure.classList.add("cover", "loading");
    figure.appendChild(this.cover);

    {
      const list = document.createElement("ul");
      const label = document.createElement("b");
      label.textContent = "Artist(s)";
      this.artists.append(label, list);
    }
    {
      const list = document.createElement("ul");
      const label = document.createElement("b");
      label.textContent = "Author(s)";
      this.authors.append(label, list);
    }
    {
      const list = document.createElement("ul");
      const label = document.createElement("b");
      label.textContent = "Genre(s)";
      this.genres.append(label, list);
    }

    this.metadata.classList.add("metadata");
    this.metadata.append(this.artists, this.authors, this.genres);
    this.sidebar.append(figure, this.metadata);

    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");
    {
      const list = document.createElement("ul");
      const label = document.createElement("h2");
      label.textContent = "Chapters";
      this.chapters.append(label, list);
    }

    this.body.append(this.title, this.description, this.chapters);
    wrapper.append(this.sidebar, this.body);

    this.update();
    this.updateChapters();

    DOM.getContainer().append(bannerWrapper, wrapper);
  }

  update() {
    if (Context.data?.coverUrl && this.cover.src !== Context.data?.coverUrl) {
      this.banner.style.backgroundImage = `url(${Context.data.coverUrl})`;
      this.cover.parentElement.classList.add("loading");
      this.cover.src = Context.data?.coverUrl;

      const onCoverLoaded = () => {
        this.cover.parentElement.classList.remove("loading");
        if (this.cover.height < this.cover.width) {
          this.cover.parentElement.classList.add("small");
        } else this.cover.parentElement.classList.remove("small");
      };

      if (this.cover.complete) onCoverLoaded();
      else {
        this.cover.addEventListener("load", onCoverLoaded);
      }
    }

    this.title.textContent = Context.data?.title;
    this.description.textContent = Context.data?.description || "No description.";

    {
      let fragment: DocumentFragment;
      if (Context.data?.artists?.length) {
        fragment = document.createDocumentFragment();
        Context.data.artists.forEach(artist => {
          const item = document.createElement("li");
          item.textContent = artist;
          fragment.appendChild(item);
        });
      }

      const list = this.artists.querySelector("ul");
      while (list.firstChild) {
        list.lastChild.remove();
      }

      if (fragment) {
        list.appendChild(fragment);
        this.metadata.insertBefore(this.artists, this.metadata.firstElementChild);
      } else this.artists.remove();
    }
    {
      let fragment: DocumentFragment;
      if (Context.data?.authors?.length) {
        fragment = document.createDocumentFragment();
        Context.data.authors.forEach(author => {
          const item = document.createElement("li");
          item.textContent = author;
          fragment.appendChild(item);
        });
      }

      const list = this.authors.querySelector("ul");
      while (list.firstChild) {
        list.lastChild.remove();
      }

      if (fragment) {
        list.appendChild(fragment);
        this.metadata.insertBefore(this.authors, this.artists.nextElementSibling);
      } else this.authors.remove();
    }
    {
      let fragment: DocumentFragment;
      if (Context.data?.genres?.length) {
        fragment = document.createDocumentFragment();
        Context.data.genres.forEach(genre => {
          const item = document.createElement("li");
          item.classList.add("genre");
          item.textContent = genre;
          fragment.appendChild(item);
        });
      }

      const list = this.genres.querySelector("ul");
      while (list.firstChild) {
        list.lastChild.remove();
      }

      if (fragment) {
        list.appendChild(fragment);
        this.metadata.insertBefore(this.genres, this.authors.nextElementSibling);
      } else this.genres.remove();
    }

    if (this.metadata.childElementCount) {
      this.sidebar.insertBefore(this.metadata, this.cover.parentElement.nextElementSibling);
    } else this.metadata.remove();
  }

  updateChapters() {
    let fragment: DocumentFragment;
    if (Context.data?.chapters?.length) {
      fragment = document.createDocumentFragment();
      Context.data.chapters.forEach(chapter => {
        const item = document.createElement("li");
        const anchor = createAnchor(chapter.path);
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

    this.body.insertBefore(this.chapters, this.description.nextElementSibling);
  }
}

const render = async () => {
  const state = Router.getState<Manga>();
  if (state.data) {
    Object.assign(Context, { data: state.data });
  }

  DOM.createContainer("view");
  const view = new View();
  await WithLoader(
    async () => {
      Context.data = await sendRequest<Manga>(buildUrl("/api/metadata"));
      view.update();

      Context.data.chapters = (await sendRequest<ApiChapterResponse>(buildUrl("/api/chapters")))?.entries;
      view.updateChapters();
    },
    {
      classList: ["fetching"],
      size: 40,
      strokeWidth: 2
    }
  );
};

const destroy = () => {};

export default defineComponent({
  ignoreStates,
  render,
  destroy
});
