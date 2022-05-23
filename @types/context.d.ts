interface BrowseContext {
  currentExtension?: Extension;
  extensions: Map<string, Extension>;
  installedExtensions: Map<string, Extension>;
  filters?: Set<Filter>;

  data?: ApiBrowseResponse;
  entries: Manga[];
}

interface ViewContext {
  data?: Manga;
}
