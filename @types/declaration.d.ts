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

interface Extension {
  id: string;
  baseUrl: string;
  name: string;
  language: string;
  version: string;

  hasUpdate?: boolean;
  isInstalled?: boolean;
}
