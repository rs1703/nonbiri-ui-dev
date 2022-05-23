import DOM from "../DOM";

const loadImage = (url: string) =>
  new Promise((resolve, reject) => {
    let retryCount = 0;

    const exec = () => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => {
        if (retryCount++ < 3) exec();
        else reject(new Error("Failed to load image"));
      };

      img.src = url;
    };

    exec();
  });

export default (extId: string, data: Manga) => {
  if (!data.path.startsWith("/")) {
    data.path = `/${data.path}`;
  }

  const item = document.createElement("div");
  item.classList.add("entry");

  const anchor = DOM.createAnchor(`/view/${extId}${data.path}`, { data });
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

  const figure = document.createElement("div");
  figure.classList.add("figure");

  const thumbnail = document.createElement("div");
  thumbnail.classList.add("thumbnail");

  const thumbnailObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        thumbnailObserver.disconnect();
        loadImage(data.coverUrl).then(() => {
          thumbnail.style.backgroundImage = `url(${data.coverUrl})`;
        });
      }
    });
  });
  thumbnailObserver.observe(thumbnail);

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
  return item;
};
