import DOM from "../DOM";

const modes = {
  Thumbnail: "thumbnail",
  "Thumbnail Compact": "thumbnail-compact",
  List: "list",
  "List Compact": "list-compact"
};

const ViewMode = (key: string) => {
  const container = document.createElement("div");
  container.classList.add("view-mode");

  const currentMode = localStorage.getItem(`${key}-view-mode`) || modes.Thumbnail;
  DOM.getContainer().classList.add(currentMode);

  const select = document.createElement("select");
  Object.keys(modes).forEach(mode => {
    const option = document.createElement("option");
    option.value = modes[mode];
    option.selected = currentMode === modes[mode];
    option.textContent = mode;
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    DOM.getContainer().classList.remove(localStorage.getItem(`${key}-view-mode`) || modes.Thumbnail);
    DOM.getContainer().classList.add(select.value);
    localStorage.setItem(`${key}-view-mode`, select.value);
  });

  container.appendChild(select);
  return container;
};

export default ViewMode;
