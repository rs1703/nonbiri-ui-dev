type Ref<T> = { current: T };

interface Component {
  mountedRef: Ref<boolean>;
  keepCommons?: boolean;
  create?(): HTMLElement;
  destroy(): void;
  render?(): Promise<void> | void;
}

interface Route {
  name?: string;
  path: string;
  component: Component;
}

interface State<T = any> {
  data?: T;
  preventDefault?: boolean;
  lastBrowseContext?: BrowseContext;
}

interface HistoryState {
  current?: State;
  previous?: State;
}

interface Pair {
  key: string;
  value: string;
}
