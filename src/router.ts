import header from "./components/header";
import routes from "./routes";

export interface Route {
  name: string;
  path: string;
  component: { render: () => void };
}

export type Routes = { [key: string]: Route };

class Router {
  private title: string;
  private routes: Routes;

  constructor() {
    this.title = document.title;
    this.routes = Object.fromEntries(Object.values(routes).map(r => [r.path, r]));
    window.addEventListener("popstate", this.onChange.bind(this));
  }

  private onChangeHandlers: Array<() => void> = [];
  addOnChangeHandler(handler: () => void) {
    this.onChangeHandlers.push(handler);
  }

  private initialized = false;
  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.onChange();
  }

  private currentRoute: Route;
  getCurrentRoute() {
    const path = "/" + window.location.pathname.split("/")[1].toLowerCase();
    return this.routes[path];
  }

  getCurrentPath() {
    return window.location.pathname + window.location.search;
  }

  setTitle(text?: string) {
    if (text?.length) {
      const next = text + " - " + this.title;
      if (document.title !== next) document.title = next;
      return;
    }

    if (this.currentRoute) {
      const next = this.currentRoute.name + " - " + this.title;
      if (document.title !== next) document.title = next;
    } else document.title = this.title;
  }

  navigate(path: string) {
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath === path) {
      return;
    }

    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  }

  private onChange() {
    this.currentRoute = this.getCurrentRoute();
    this.setTitle();

    this.onChangeHandlers.forEach(handler => handler());

    if ([routes.library, routes.history, routes.updates, routes.browse].includes(this.currentRoute)) {
      [header].forEach(c => c.render());
    }
    this.render();
  }

  private render() {
    if (this.currentRoute?.component?.render) {
      this.currentRoute.component.render();
    }
  }
}

export default new Router();
