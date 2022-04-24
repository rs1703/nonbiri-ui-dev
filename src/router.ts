export interface Route {
  name: string;
  path: string;
  component: { render: () => void; destroy?: () => void };
}

export type Routes = { [key: string]: Route };

export interface State {
  preventDefault?: boolean;
}

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

  getCurrentExtensionId() {
    return window.location.pathname.split("/")[2];
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

  navigate(path: string, state: State = {}) {
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath === path) {
      return;
    }

    window.history.pushState(state, "", path);
    window.dispatchEvent(new Event("popstate"));
  }

  private async onChange(ev?: PopStateEvent) {
    if (ev) {
      const state = (ev.state || window.history.state) as State;
      if (state.preventDefault) return;
    }

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
      if (this.currentRoute?.component?.destroy) {
        this.currentRoute.component.destroy();
      }

      this.currentRoute = this.getCurrentRoute();
      this.setTitle();

      this.onChangeHandlers.forEach(handler => handler());
      if (this.currentRoute?.component?.render) {
        this.currentRoute.component.render();
      }
    } finally {
      this.mutex.current = false;
    }
  }
}

export default Router;
