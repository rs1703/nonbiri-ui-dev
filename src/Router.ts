import DOM from "./DOM";

type Routes = {
  [key: string]: Route;
};

class Router {
  private title: string;
  private routes: Routes;
  private mutex = { current: false };

  private initialized = false;
  private currentRoute: Route;
  private onChangeHandlers: Array<() => void> = [];

  init(routes: Routes) {
    if (this.initialized) return;
    this.initialized = true;

    this.title = document.title;
    this.routes = Object.fromEntries(Object.values(routes).map(r => [r.path, r]));

    window.addEventListener("popstate", this.onChange.bind(this));
    this.onChange();
  }

  getCurrentExtensionId() {
    return window.location.pathname.split("/")[2];
  }

  getCurrentPath() {
    return window.location.pathname + window.location.search;
  }

  getCurrentRoute() {
    const path = `/${window.location.pathname.split("/")[1].toLowerCase()}`;
    return this.routes[path];
  }

  getState<T>() {
    return window.history.state as State<T>;
  }

  setTitle(text?: string) {
    if (text?.length) {
      const next = `${text} - ${this.title}`;
      if (document.title !== next) document.title = next;
      return;
    }

    if (this.currentRoute && this.currentRoute.name) {
      const next = `${this.currentRoute.name} - ${this.title}`;
      if (document.title !== next) document.title = next;
    } else document.title = this.title;
  }

  setState<T>(state: State<T> = {}) {
    window.history.replaceState(state, "", this.getCurrentPath());
  }

  addOnChangeHandler(handler: () => void) {
    this.onChangeHandlers.push(handler);
  }

  navigate<T>(path: string, state: State<T> = {}) {
    const currentPath = this.getCurrentPath();
    if (currentPath === path) {
      return;
    }

    if (window.history.state) {
      Object.keys(window.history.state).forEach(key => {
        if (key.startsWith("last")) {
          state[key] = window.history.state[key];
        }
      });
    }

    window.history.pushState(state, "", path);
    window.dispatchEvent(new Event("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private async onChange(ev?: PopStateEvent) {
    const state = (window.history.state || ev?.state) as State;
    if (state?.preventDefault) {
      return;
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
      DOM.clear(this.currentRoute?.component?.keepCommons);

      this.currentRoute = this.getCurrentRoute();
      this.setTitle();

      this.onChangeHandlers.forEach(handler => handler());
      if (this.currentRoute?.component?.render) {
        if (state && this.currentRoute.component.ignoreStates) {
          Object.keys(state).forEach(key => {
            if (!this.currentRoute.component.ignoreStates.includes(key)) {
              delete window.history.state[key];
            }
          });
        } else {
          window.history.replaceState({}, "", this.getCurrentPath());
        }
        this.currentRoute.component.render();
      }
    } finally {
      this.mutex.current = false;
    }
  }
}

export default new Router();
