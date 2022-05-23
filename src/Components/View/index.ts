import { formatGroups, formatUnix, sendRequest } from "../../App";
import DOM from "../../DOM";
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

    const { banner, sidebar, cover, metadata, artists, authors, genres, body, title, description, chapters } = this;
    banner.classList.add("banner");
    sidebar.classList.add("sidebar");
    metadata.classList.add("metadata");
    artists.classList.add("artists");
    authors.classList.add("authors");
    genres.classList.add("genres");
    body.classList.add("body");
    title.classList.add("title");
    description.classList.add("description");
    chapters.classList.add("chapters");

    const bannerWrapper = document.createElement("div");
    const bannerShadow = document.createElement("div");
    bannerWrapper.classList.add("banner-wrapper");
    bannerShadow.classList.add("shadow");
    bannerWrapper.append(banner, bannerShadow);

    const figure = document.createElement("figure");
    figure.classList.add("cover");
    figure.appendChild(cover);

    {
      const list = document.createElement("ul");
      const label = document.createElement("b");
      label.textContent = "Artist(s)";
      artists.append(label, list);
    }
    {
      const list = document.createElement("ul");
      const label = document.createElement("b");
      label.textContent = "Author(s)";
      authors.append(label, list);
    }
    {
      const list = document.createElement("ul");
      const label = document.createElement("b");
      label.textContent = "Genre(s)";
      genres.append(label, list);
    }

    metadata.classList.add("metadata");
    metadata.append(artists, authors, genres);
    sidebar.append(figure, metadata);

    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");
    {
      const list = document.createElement("ul");
      const label = document.createElement("h2");
      label.textContent = "Chapters";
      chapters.append(label, list);
    }

    body.append(title, description, chapters);
    wrapper.append(sidebar, body);

    this.update();
    this.updateChapters();

    DOM.getContainer().append(bannerWrapper, wrapper);
  }

  update() {
    const { banner, sidebar, cover, metadata, artists, authors, genres, body, title, description, chapters } = this;

    if (Context.data?.coverUrl) {
      banner.style.backgroundImage = `url(${Context.data.coverUrl})`;
      cover.src = Context.data?.coverUrl;

      const onCoverLoaded = () => {
        cover.parentElement.classList.remove("loading");
        if (cover.height < cover.width) {
          cover.parentElement.classList.add("small");
        } else cover.parentElement.classList.remove("small");
      };

      if (cover.complete) onCoverLoaded();
      else {
        cover.parentElement.classList.add("loading");
        cover.addEventListener("load", onCoverLoaded);
      }
    }

    title.textContent = Context.data?.title;
    description.textContent = Context.data?.description || "No description.";

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

      const list = artists.querySelector("ul");
      while (list.firstChild) {
        list.lastChild.remove();
      }

      if (fragment) {
        list.appendChild(fragment);
        metadata.insertBefore(artists, metadata.firstElementChild);
      } else artists.remove();
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

      const list = authors.querySelector("ul");
      while (list.firstChild) {
        list.lastChild.remove();
      }

      if (fragment) {
        list.appendChild(fragment);
        metadata.insertBefore(authors, artists.nextElementSibling);
      } else authors.remove();
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

      const list = genres.querySelector("ul");
      while (list.firstChild) {
        list.lastChild.remove();
      }

      if (fragment) {
        list.appendChild(fragment);
        metadata.insertBefore(genres, authors.nextElementSibling);
      } else genres.remove();
    }

    if (metadata.childElementCount) {
      sidebar.insertBefore(metadata, cover.parentElement.nextElementSibling);
    } else metadata.remove();
  }

  updateChapters() {
    const { body, description, chapters } = this;

    let fragment: DocumentFragment;
    if (Context.data?.chapters?.length) {
      fragment = document.createDocumentFragment();
      Context.data.chapters.forEach(chapter => {
        const item = document.createElement("li");
        const anchor = DOM.createAnchor(chapter.path);
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

    const list = chapters.querySelector("ul");
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
      chapters.querySelector("h2").appendChild(count);
    } else count.remove();

    body.insertBefore(chapters, description.nextElementSibling);
  }
}

const render = async () => {
  DOM.clear();

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

export default { ignoreStates, render, destroy };
