import R from "./Router";

let router: R;

export const Router = {
  init: () => router.init(),
  getCurrentRoute: () => router.getCurrentRoute(),
  getCurrentPath: () => router.getCurrentPath(),
  setTitle: (text?: string) => router.setTitle(text),
  navigate: (path: string) => router.navigate(path)
};

export default {
  setRouter: (r: R) => (router = r)
};
