interface Route {
  name?: string;
  path: string;
  component: {
    ignoreStates?: string[];
    render: () => void;
    destroy?: () => void;
  };
}

interface State<T = any> {
  data?: T;
  preventDefault?: boolean;
  lastBrowseContext?: BrowseContext;
}

interface Manga {
  path: string;
  coverUrl: string;
  title: string;
}

interface Filter {
  name: string;
  key: string;
  type?: string;
  options: { [key: string]: string };
}

interface BrowseData {
  id: string;
  page: number;
  hasNext: boolean;
  entries: Manga[];
  execDuration: number;
}

interface Extension {
  id: string;
  baseUrl: string;
  name: string;
  language: string;
  version: string;

  hasUpdate?: boolean;
  isInstalled?: boolean;
}
