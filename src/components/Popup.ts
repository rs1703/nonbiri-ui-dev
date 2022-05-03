import DOM from "../DOM";

export default class Popup {
  root: HTMLDivElement;
  content: HTMLDivElement;

  onHideHandlers: Array<() => void> = [];

  constructor() {
    this.root = document.createElement("div");
    this.root.classList.add("popup");

    const background = document.createElement("div");
    background.classList.add("popup-bg");
    background.addEventListener("click", () => {
      this.hide();
      this.onHideHandlers.forEach(handler => handler());
    });

    this.content = document.createElement("div");
    this.content.classList.add("popup-content");

    this.root.append(background, this.content);
  }

  previousOverflow: string;
  show() {
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    DOM.getContainer().appendChild(this.root);
  }

  hide() {
    document.body.style.overflow = this.previousOverflow;
    this.root.remove();
  }

  addOnHideHandler(handler: () => void) {
    this.onHideHandlers.push(handler);
  }

  append(...elements: HTMLElement[]) {
    this.content.append(...elements);
  }

  appendChild(element: HTMLElement) {
    this.content.appendChild(element);
  }
}
