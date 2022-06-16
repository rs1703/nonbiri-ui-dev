import { FormatGroups, FormatUnix, LoadImage, SendRequest } from "../../App";
import { MangaStatusKeys } from "../../constants";
import DOM, { DefineComponent } from "../../DOM";
import { CreateAnchor } from "../../DOMElements";
import Router from "../../Router";
import { WithLoader } from "../Loader";
import Context, { MountedRef } from "./Context";

const loaderOptions = {
  classList: ["fetching"],
  size: 40,
  strokeWidth: 2
};

const buildUrl = (pathname: string) => {
  const url = new URL(window.location.origin);
  url.pathname = pathname;

  url.searchParams.set("domain", Router.getCurrentExtensionId());
  url.searchParams.set("path", `/${window.location.pathname.split("/").slice(3).join("/")}`);

  return url.href;
};

let banner: HTMLDivElement;
let header: HTMLElement;
let aside: HTMLElement;
let cover: HTMLImageElement;
let metadata: HTMLDivElement;
let title: HTMLHeadingElement;
let status: HTMLSpanElement;
let artists: HTMLDivElement;
let authors: HTMLDivElement;
let genres: HTMLDivElement;
let description: HTMLDivElement;
let chapters: HTMLDivElement;

const update = () => {
  if (Context.data?.coverUrl && cover.src !== Context.data?.coverUrl) {
    banner.style.backgroundImage = `url(${Context.data.coverUrl})`;
    cover.parentElement.classList.add("loading");
    LoadImage(Context.data.coverUrl).then(() => {
      cover.parentElement.classList.remove("loading");
      cover.src = Context.data.coverUrl;
    });
  }

  title.textContent = Context.data?.title;
  status.textContent = MangaStatusKeys[Context.data.status || 0];
  description.textContent = Context.data?.description || "No description.";

  {
    let fragment: DocumentFragment;
    if (Context.data?.artists?.length) {
      fragment = document.createDocumentFragment();
      Context.data.artists.forEach((artist, i) => {
        if (i) fragment.appendChild(document.createTextNode(", "));
        const anchor = CreateAnchor("");
        anchor.textContent = artist;
        fragment.appendChild(anchor);
      });
    }

    while (artists.firstChild) {
      artists.lastChild.remove();
    }

    if (fragment) {
      artists.appendChild(fragment);
      metadata.insertBefore(artists.parentElement, status.nextElementSibling || description);
    } else artists.parentElement.remove();
  }
  {
    let fragment: DocumentFragment;
    if (Context.data?.authors?.length) {
      fragment = document.createDocumentFragment();
      Context.data.authors.forEach((author, i) => {
        if (i) fragment.appendChild(document.createTextNode(", "));
        const anchor = CreateAnchor("");
        anchor.textContent = author;
        fragment.appendChild(anchor);
      });
    }

    while (authors.firstChild) {
      authors.lastChild.remove();
    }

    if (fragment) {
      authors.appendChild(fragment);
      metadata.insertBefore(authors.parentElement, artists.parentElement.nextElementSibling || description);
    } else authors.parentElement.remove();
  }
  {
    let fragment: DocumentFragment;
    if (Context.data?.genres?.length) {
      fragment = document.createDocumentFragment();
      Context.data.genres.forEach((genre, i) => {
        if (i) fragment.appendChild(document.createTextNode(", "));
        const anchor = CreateAnchor("");
        anchor.textContent = genre;
        fragment.appendChild(anchor);
      });
    }

    while (genres.firstChild) {
      genres.lastChild.remove();
    }

    if (fragment) {
      genres.appendChild(fragment);
      metadata.insertBefore(genres.parentElement, authors.parentElement.nextElementSibling || description);
    } else genres.parentElement.remove();
  }

  if (metadata.childElementCount) {
    header.insertBefore(metadata, cover.parentElement.nextElementSibling);
  } else metadata.remove();
};

const updateChapters = () => {
  let fragment: DocumentFragment;
  if (Context.data?.chapters?.length) {
    fragment = document.createDocumentFragment();
    Context.data.chapters.forEach(chapter => {
      const item = document.createElement("li");
      const anchor = CreateAnchor(`/read/${chapter.domain}${chapter.path}`);
      item.classList.add("chapter");

      const name = document.createElement("h3");
      name.classList.add("name");
      name.textContent = chapter.name;

      const info = document.createElement("div");
      info.classList.add("info");

      const date = document.createElement("span");
      date.classList.add("publishedAt");
      date.textContent = FormatUnix(chapter.publishedAt);
      info.appendChild(date);

      if (chapter.groups?.length) {
        const groups = document.createElement("span");
        groups.classList.add("groups");
        groups.textContent = FormatGroups(chapter.groups);
        info.append(document.createTextNode(" • "), groups);
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
};

const create = () => {
  banner = document.createElement("div");
  header = document.createElement("header");
  aside = document.createElement("aside");
  cover = document.createElement("img");
  metadata = document.createElement("div");
  title = document.createElement("h1");
  status = document.createElement("span");
  artists = document.createElement("div");
  authors = document.createElement("div");
  genres = document.createElement("div");
  description = document.createElement("div");
  chapters = document.createElement("div");

  banner.classList.add("banner");
  cover.classList.add("cover");
  metadata.classList.add("metadata");
  title.classList.add("title");
  artists.classList.add("artists");
  authors.classList.add("authors");
  genres.classList.add("genres");
  description.classList.add("description");
  chapters.classList.add("chapters");

  const bannerWrapper = document.createElement("header");
  {
    const shadow = document.createElement("div");
    shadow.classList.add("shadow");
    bannerWrapper.append(banner, shadow);
  }

  const coverWrapper = document.createElement("figure");
  coverWrapper.classList.add("loading");
  coverWrapper.appendChild(cover);
  aside.appendChild(coverWrapper);

  {
    const wrapper = document.createElement("div");
    const label = document.createElement("b");

    wrapper.classList.add("status");
    label.textContent = "Status";
    [status.textContent] = MangaStatusKeys;

    wrapper.append(label, status);
  }
  {
    const wrapper = document.createElement("div");
    const label = document.createElement("b");

    wrapper.classList.add("artists");
    label.textContent = "Artist(s)";
    wrapper.append(label, artists);
  }
  {
    const wrapper = document.createElement("div");
    const label = document.createElement("b");

    wrapper.classList.add("authors");
    label.textContent = "Author(s)";
    wrapper.append(label, authors);
  }
  {
    const wrapper = document.createElement("div");
    const label = document.createElement("b");

    wrapper.classList.add("genres");
    label.textContent = "Genre(s)";
    wrapper.append(label, genres);
  }

  metadata.classList.add("metadata");
  metadata.append(
    title,
    status.parentElement,
    artists.parentElement,
    authors.parentElement,
    genres.parentElement,
    description
  );
  header.append(aside, metadata);

  const content = document.createElement("div");
  content.classList.add("content");
  {
    const list = document.createElement("ul");
    const label = document.createElement("h2");
    label.textContent = "Chapters";
    chapters.append(label, list);
  }

  content.append(header, chapters);

  update();
  updateChapters();

  DOM.getContainer().append(bannerWrapper, content);
};

const render = async () => {
  DOM.createContainer("view");

  const state = Router.getState<Manga>();
  if (state.data) {
    Object.assign(Context, { data: state.data });
    Router.setTitle(Context.data.title);

    create();
    await WithLoader(async () => {
      {
        const { content } = await SendRequest<Manga>(buildUrl("/api/metadata"));
        if (!MountedRef.current) {
          return;
        }
        if (content) Context.data = content;
      }
      Router.setTitle(Context.data.title);
      update();

      const { content } = await SendRequest<ApiChapter>(buildUrl("/api/chapters"));
      if (MountedRef.current && content) {
        Context.data.chapters = content.entries;
        updateChapters();
      }
    }, loaderOptions);
    return;
  }

  await WithLoader(async () => {
    const { content } = await SendRequest<Manga>(buildUrl("/api/metadata"));
    if (!MountedRef.current) return;
    Context.data = content;
  });
  if (!MountedRef.current) return;
  Router.setTitle(Context.data.title);
  create();

  await WithLoader(async () => {
    const { content } = await SendRequest<ApiChapter>(buildUrl("/api/chapters"));
    if (!MountedRef.current) return;
    Context.data.chapters = content.entries;
  });
  if (!MountedRef.current) return;
  updateChapters();
};

const destroy = () => {};

export default DefineComponent({
  mountedRef: MountedRef,
  render,
  destroy
});
