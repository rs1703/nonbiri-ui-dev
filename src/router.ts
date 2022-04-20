export interface Route {
  name: string;
  path: string;
  component: { render: () => void };
}

export type Routes = { [key: string]: Route };

class Router {
  private title: string;
  private routes: Routes;
  private mutex = { current: false };

  constructor(routes: Routes) {
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
    const path = `/${window.location.pathname.split("/")[1].toLowerCase()}`;
    return this.routes[path];
  }

  getCurrentPath() {
    return window.location.pathname + window.location.search;
  }

  setTitle(text?: string) {
    if (text?.length) {
      const next = `${text} - ${this.title}`;
      if (document.title !== next) document.title = next;
      return;
    }

    if (this.currentRoute) {
      const next = `${this.currentRoute.name} - ${this.title}`;
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

  private async onChange() {
    if (this.mutex.current) {
      await new Promise<void>(resolve => {
        const interval = setInterval(() => {
          requestAnimationFrame(() => {
            if (this.mutex.current) return;
            clearInterval(interval);
            resolve();
          });
        }, 10);
      });
    }

    this.mutex.current = true;
    try {
      this.currentRoute = this.getCurrentRoute();
      this.setTitle();

      this.onChangeHandlers.forEach(handler => handler());
      this.render();
    } finally {
      this.mutex.current = false;
    }
  }

  private render() {
    this.currentRoute?.component?.render();
  }
}

export default Router;
