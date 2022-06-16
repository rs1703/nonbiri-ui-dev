import { LoadImage, SendRequest } from "../App";
import { ReadingStatus, ReadingStatusValues } from "../constants";
import { CreateAnchor } from "../DOMElements";
import Router from "../Router";

const addedText = "Remove from library";
const removedText = "Add to library";

const setReadState = async (data: Manga, state: ReadingStatus, mountedRef: Ref<boolean>) => {
  const url = `/api/library/manga/readState?domain=${data.domain}&path=${data.path}&state=${ReadingStatusValues[state]}`;
  const { status, content } = await SendRequest<Manga>(url, "POST");
  if (mountedRef.current && (status === 200 || status === 304)) {
    if (content) Object.assign(data, content);
    if (state === ReadingStatus.None) {
      delete data.readingStatus;
    } else data.readingStatus = state;
  }
};

interface Entry extends HTMLDivElement {
  addReadStateListener: (fn: () => void) => void;
  removeReadStateListener: (fn: () => void) => void;
}

export default (data: Manga, mountedRef: Ref<boolean>) => {
  if (!data.path.startsWith("/")) {
    data.path = `/${data.path}`;
  }

  const item = document.createElement("div") as Entry;
  item.classList.add("entry");

  const readStateListeners = new Set<() => void>();
  item.addReadStateListener = (fn: () => void) => readStateListeners.add(fn);
  item.removeReadStateListener = (fn: () => void) => readStateListeners.delete(fn);

  const updateFollowStateAttr = () => {
    if (data.readingStatus > 0) {
      item.removeAttribute("data-unfollowed");
      item.dataset.followed = "true";
    } else {
      item.removeAttribute("data-followed");
      if (Router.getCurrentRoute().path === "/") {
        item.dataset.unfollowed = "true";
      }
    }
  };
  updateFollowStateAttr();

  const anchor = CreateAnchor(`/view/${data.domain}${data.path}`, { data });
  anchor.title = data.title;

  let hideTimeout = 0;
  const itemObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      clearInterval(hideTimeout);
      if (entry.isIntersecting) {
        item.appendChild(anchor);
      } else {
        hideTimeout = window.setTimeout(() => {
          anchor.remove();
        }, 5000);
      }
    });
  });
  itemObserver.observe(item);

  const figure = document.createElement("figure");
  {
    const thumbnail = document.createElement("div");
    thumbnail.classList.add("thumbnail");

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.disconnect();
          LoadImage(data.coverUrl).then(() => {
            thumbnail.style.backgroundImage = `url(${data.coverUrl})`;
          });
        }
      });
    });
    observer.observe(thumbnail);
    figure.appendChild(thumbnail);
  }
  {
    const actions = document.createElement("div");
    actions.classList.add("actions");

    const action = document.createElement("button");
    action.type = "button";
    action.classList.add("action");
    action.textContent = data.readingStatus > 0 ? addedText : removedText;

    const mutexRef = { current: false };
    action.addEventListener("click", async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();

      if (mutexRef.current) {
        return;
      }
      mutexRef.current = true;

      try {
        await setReadState(data, data.readingStatus > 0 ? ReadingStatus.None : ReadingStatus.Reading, mountedRef);
        if (mountedRef.current) {
          updateFollowStateAttr();
          action.textContent = data.readingStatus > 0 ? addedText : removedText;
          readStateListeners.forEach(fn => fn());
        }
      } finally {
        mutexRef.current = false;
      }
    });

    actions.appendChild(action);
    figure.appendChild(actions);
  }

  const metadata = document.createElement("div");
  metadata.classList.add("metadata");
  {
    const title = document.createElement("h3");
    const span = document.createElement("span");
    title.classList.add("title");
    span.textContent = data.title;
    title.appendChild(span);

    metadata.appendChild(title);
  }

  anchor.append(figure, metadata);
  return item;
};
