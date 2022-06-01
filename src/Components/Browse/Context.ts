import { GenerateUniqueString } from "../../App";

export const ID = GenerateUniqueString();
export const MountedRef = { current: false };
export default {
  extensions: new Map<string, Extension>(),
  installedExtensions: new Map<string, Extension>(),
  filters: new Set<Filter>(),
  entries: []
} as BrowseContext;
