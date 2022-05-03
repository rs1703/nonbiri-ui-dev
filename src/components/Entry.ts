import DOM from "../DOM";
import Context from "./Browse/Context";

export default (data: Manga) => {
  if (!data.path.startsWith("/")) {
    data.path = `/${data.path}`;
  }

  const item = document.createElement("div");
  item.classList.add("entry");

  const anchor = DOM.createAnchor(`/view/${Context.currentExtension.id}${data.path}`);
  anchor.title = data.title;

  const figure = document.createElement("div");
  figure.classList.add("figure");

  const thumbnail = document.createElement("img");
  thumbnail.classList.add("thumbnail");
  thumbnail.src = data.coverUrl;

  figure.appendChild(thumbnail);

  const metadata = document.createElement("div");
  metadata.classList.add("metadata");

  const title = document.createElement("h3");
  title.classList.add("title");

  const span = document.createElement("span");
  span.textContent = data.title;

  title.appendChild(span);
  metadata.appendChild(title);

  anchor.append(figure, metadata);
  item.appendChild(anchor);
  return item;
};
