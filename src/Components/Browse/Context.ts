export const MountedRef = { current: false };
export default {
  extensions: new Map<string, Extension>(),
  installedExtensions: new Map<string, Extension>(),
  filters: [],
  entries: [],
  index: new Map<string, number>()
} as BrowseContext;
