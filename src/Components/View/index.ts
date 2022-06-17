import { BuildURL, CreateRef, FormatGroups, FormatUnix, LoadImage, SendRequest, WithMutex } from "../../App";
import { MangaStatusText, Paths, ReadingStatus, ReadingStatusText } from "../../constants";
import DOM, { DefineComponent } from "../../DOM";
import { CreateAnchor } from "../../DOMElements";
import Router from "../../Router";
import Icons from "../Icons";
import { WithLoader } from "../Loader";
import Context, { MountedRef } from "./Context";

const loaderOptions = {
  classList: ["fetching"],
  size: 40,
  strokeWidth: 2
};

let banner: HTMLDivElement;
let header: HTMLElement;

let aside: HTMLElement;
let cover: HTMLImageElement;
let followState: HTMLButtonElement;

let metadata: HTMLDivElement;
let title: HTMLHeadingElement;
let source: HTMLAnchorElement;
let status: HTMLSpanElement;
let artists: HTMLDivElement;
let authors: HTMLDivElement;
let genres: HTMLDivElement;
let description: HTMLDivElement;

let chapters: HTMLDivElement;

const createBanner = () => {
  banner = document.createElement("div");
  banner.classList.add("banner");

  const wrapper = document.createElement("header");
  const shadow = document.createElement("div");
  shadow.classList.add("shadow");

  wrapper.append(banner, shadow);
};

const createHeader = () => {
  header = document.createElement("header");
  header.append(aside, metadata);
};

const createAside = () => {
  aside = document.createElement("aside");
  aside.append(cover.parentElement, followState.parentElement);
};

const createCover = () => {
  cover = document.createElement("img");
  const wrapper = document.createElement("figure");
  wrapper.classList.add("loading");
  wrapper.appendChild(cover);
};

const updateBannerAndCover = () => {
  if (Context.data?.coverUrl && cover.src !== Context.data?.coverUrl) {
    banner.style.backgroundImage = `url(${Context.data.coverUrl})`;
    cover.parentElement.classList.add("loading");
    LoadImage(Context.data.coverUrl).then(() => {
      cover.parentElement.classList.remove("loading");
      cover.src = Context.data.coverUrl;
    });
  }
};

const setReadStateMutexRef = CreateRef(false);
const updateFollowState = () => {
  followState.nextElementSibling.querySelector(".selected")?.removeAttribute("class");
  if (Context.data.readingStatus > 0) {
    followState.textContent = ReadingStatusText[Context.data.readingStatus];
    followState.nextElementSibling.lastElementChild.children[Context.data.readingStatus - 1].classList.add("selected");
  } else followState.textContent = "Add to library";
};

const setReadState = (state: ReadingStatus) =>
  WithMutex(setReadStateMutexRef, async () => {
    // TODO: also use WithLoader
    // TODO: update Router state

    const url = BuildURL(Paths.setMangaReadState, { state, path: Context.data.path });
    const { statusCode, content } = await SendRequest<Manga>(url, "POST");
    if (!MountedRef.current || statusCode >= 400) return;

    const { data } = Router.getState<Manga>();
    if (content) Object.assign(Context.data, content);
    if (state === ReadingStatus.None) {
      delete Context.data.readingStatus;
      if (data?.path === Context.data.path) {
        delete data.readingStatus;
      }
    } else {
      Context.data.readingStatus = state;
      if (data?.path === Context.data.path) {
        data.readingStatus = state;
      }
    }

    updateFollowState();
    Router.setState(Context);

    const { path } = data;
    Router.setOnChangeHandler(path, async () => {
      const { lastBrowseContext } = Router.getState<BrowseContext>();
      if (!lastBrowseContext?.entries && !lastBrowseContext?.index) return;
      const idx = lastBrowseContext.index.get(path);
      if (idx >= 0) {
        if (state === ReadingStatus.None) {
          delete lastBrowseContext.entries[idx].readingStatus;
        } else lastBrowseContext.entries[idx].readingStatus = state;
        Router.setState({ lastBrowseContext });
      }
    });
  });

const createFollowState = () => {
  followState = document.createElement("button");
  followState.type = "button";
  followState.ariaLabel = "Follow State";

  const wrapper = document.createElement("div");
  wrapper.classList.add("followState");

  followState.addEventListener("click", () =>
    setReadState(Context.data.readingStatus > 0 ? ReadingStatus.None : ReadingStatus.Reading)
  );

  const list = document.createElement("div");
  list.classList.add("list");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.ariaLabel = "Show/hide list of reading states";
  toggle.appendChild(Icons.chevronDown({ strokeWidth: 0.1 }));

  const onToggleClick = () => list.lastElementChild.classList.toggle("hidden");

  const globClickListener = (ev: Event) => {
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();

    const target = ev.target as HTMLElement;
    if (!(target === list || target.closest("div.list"))) {
      onToggleClick();
      document.removeEventListener("click", globClickListener);
    }
  };

  toggle.addEventListener("click", () => {
    onToggleClick();
    requestAnimationFrame(() => {
      if (!list.lastElementChild.classList.contains("hidden")) {
        document.addEventListener("click", globClickListener);
      } else document.removeEventListener("click", globClickListener);
    });
  });

  list.append(toggle, document.createElement("ul"));
  list.lastElementChild.classList.add("hidden");

  for (let i = 1; i < ReadingStatusText.length; i++) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.ariaLabel = "Follow State";

    button.textContent = `Set as ${ReadingStatusText[i]}`;
    button.addEventListener("click", () => {
      if (Context.data.readingStatus !== i) {
        setReadState(i);
      }
    });

    item.appendChild(button);
    list.lastElementChild.appendChild(item);
  }
  wrapper.append(followState, list);
};

const createMetadata = () => {
  metadata = document.createElement("div");
  metadata.classList.add("metadata");
  metadata.append(
    title,
    source.parentElement,
    status.parentElement,
    artists.parentElement,
    authors.parentElement,
    genres.parentElement,
    description
  );
};

const createTitle = () => {
  title = document.createElement("h1");
  title.classList.add("title");
};

const updateTitle = () => {
  title.textContent = Context.data?.title;
};

const createSource = () => {
  source = document.createElement("a");
  source.relList.add("nofollow", "noopener", "noreferrer");
  source.target = "_blank";

  const wrapper = document.createElement("div");
  wrapper.classList.add("source");

  const label = document.createElement("b");
  label.textContent = "Source";

  wrapper.append(label, source);
};

const updateSource = () => {
  if (Context.data.domain && !Context.data.domain.includes("local")) {
    source.textContent = Context.data.domain + Context.data.path;
    source.href = `//${source.textContent}`;
  }

  if (source.href) {
    metadata.insertBefore(source.parentElement, title.nextElementSibling);
  } else source.parentElement.remove();
};

const createStatus = () => {
  status = document.createElement("span");
  [status.textContent] = MangaStatusText;

  const wrapper = document.createElement("div");
  wrapper.classList.add("status");

  const label = document.createElement("b");
  label.textContent = "Status";

  wrapper.append(label, status);
};

const updateStatus = () => {
  if (Context.data.status) {
    status.textContent = MangaStatusText[Context.data.status || 0];
    metadata.insertBefore(status.parentElement, source.parentElement.nextElementSibling || title.nextElementSibling);
  } else status.parentElement.remove();
};

const createArtists = () => {
  artists = document.createElement("div");

  const wrapper = document.createElement("div");
  wrapper.classList.add("artists");

  const label = document.createElement("b");
  label.textContent = "Artist(s)";

  wrapper.append(label, artists);
};

const updateArtists = () => {
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
    metadata.insertBefore(artists.parentElement, status.parentElement.nextElementSibling || description);
  } else artists.parentElement.remove();
};

const createAuthors = () => {
  authors = document.createElement("div");

  const wrapper = document.createElement("div");
  wrapper.classList.add("authors");

  const label = document.createElement("b");
  label.textContent = "Author(s)";

  wrapper.append(label, authors);
};

const updateAuthors = () => {
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
};

const createGenres = () => {
  genres = document.createElement("div");

  const wrapper = document.createElement("div");
  wrapper.classList.add("genres");

  const label = document.createElement("b");
  label.textContent = "Genre(s)";

  wrapper.append(label, genres);
};

const updateGenres = () => {
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
};

const createDescription = () => {
  description = document.createElement("div");
  description.classList.add("description");
};

const updateDescription = () => {
  description.textContent = Context.data?.description || "No description.";
};

const createChapters = () => {
  chapters = document.createElement("div");
  chapters.classList.add("chapters");

  const label = document.createElement("h2");
  label.textContent = "Chapters";

  const list = document.createElement("ul");

  chapters.append(label, list);
};

const update = () => {
  updateBannerAndCover();
  updateFollowState();
  updateSource();
  updateTitle();
  updateStatus();
  updateArtists();
  updateAuthors();
  updateGenres();
  updateDescription();

  if (metadata.childElementCount) {
    header.insertBefore(metadata, aside.nextElementSibling);
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
  createBanner();
  createCover();
  createFollowState();
  createTitle();
  createSource();
  createStatus();
  createArtists();
  createAuthors();
  createGenres();
  createDescription();

  createAside();
  createMetadata();
  createHeader();
  createChapters();

  const content = document.createElement("div");
  content.classList.add("content");
  content.append(header, chapters);

  update();
  updateChapters();

  DOM.getContainer().append(banner.parentElement, content);
};

const render = async () => {
  DOM.createContainer("view");

  const state = Router.getState<Manga>();
  const params = { path: `/${window.location.pathname.split("/").slice(3).join("/")}` };

  if (state.data) {
    Object.assign(Context, { data: state.data });
    Router.setTitle(Context.data.title);

    create();
    await WithLoader(async () => {
      {
        const { content } = await SendRequest<Manga>(BuildURL(Paths.metadata, params));
        if (!MountedRef.current) {
          return;
        }
        if (content) {
          Context.data = content;
          Router.setState(Context);
        }
      }
      Router.setTitle(Context.data.title);
      update();

      const { content } = await SendRequest<ApiChapter>(BuildURL(Paths.chapters, params));
      if (MountedRef.current && content) {
        Context.data.chapters = content.entries;
        Router.setState(Context);
        updateChapters();
      }
    }, loaderOptions);
    return;
  }

  await WithLoader(async () => {
    const { content } = await SendRequest<Manga>(BuildURL(Paths.metadata, params));
    if (!MountedRef.current) return;
    Context.data = content;
    Router.setState(Context);
  });
  if (!MountedRef.current) return;
  Router.setTitle(Context.data.title);
  create();

  await WithLoader(async () => {
    const { content } = await SendRequest<ApiChapter>(BuildURL(Paths.chapters, params));
    if (!MountedRef.current) return;
    Context.data.chapters = content.entries;
    Router.setState(Context);
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
