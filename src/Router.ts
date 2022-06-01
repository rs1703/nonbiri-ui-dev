import DOM from "./DOM";

type Routes = {
  [key: string]: Route;
};

class Router {
  private title: string;
  private routes: Routes;
  private mutexRef = { current: false };

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
    return (window.history.state || {}) as State<T>;
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

    window.history.pushState(state, "", path);
    window.dispatchEvent(new Event("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private async onChange(ev?: PopStateEvent) {
    const state = (window.history.state || ev?.state) as State;
    if (state?.preventDefault) {
      return;
    }

    if (this.mutexRef.current) {
      await new Promise<void>(resolve => {
        const interval = setInterval(() => {
          requestAnimationFrame(() => {
            if (this.mutexRef.current) return;
            clearInterval(interval);
            resolve();
          });
        }, 10);
      });
    }

    this.mutexRef.current = true;
    try {
      if (this.currentRoute?.component) {
        this.currentRoute.component.mountedRef.current = false;
        this.currentRoute.component?.destroy();
      }
      DOM.clear(this.currentRoute?.component?.keepCommons);

      this.currentRoute = this.getCurrentRoute();
      document.body.dataset.route = this.currentRoute.path;
      this.setTitle();

      this.onChangeHandlers.forEach(handler => handler());
      if (this.currentRoute?.component?.render) {
        this.currentRoute.component.mountedRef.current = true;
        this.currentRoute.component.render();
      }
    } finally {
      this.mutexRef.current = false;
    }
  }
}

export default new Router();
