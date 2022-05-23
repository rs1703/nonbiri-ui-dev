interface BrowseContext {
  currentExtension?: Extension;
  extensions: Map<string, Extension>;
  installedExtensions: Map<string, Extension>;
  filters?: Set<Filter>;

  data?: BrowseData;
  entries: Manga[];
}
