interface BrowseContext {
  currentExtension?: Extension;
  extensions: Map<string, Extension>;
  installedExtensions: Map<string, Extension>;
  filters?: Filter[];

  page?: number;
  hasNext?: boolean;
  entries: Manga[];
  index: Map<string, number>;
}

interface ViewContext {
  data?: Manga;
}
