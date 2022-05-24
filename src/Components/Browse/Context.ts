import { generateUniqueString } from "../../App";

export const id = generateUniqueString();
export default {
  extensions: new Map<string, Extension>(),
  installedExtensions: new Map<string, Extension>(),
  filters: new Set<Filter>(),
  entries: []
} as BrowseContext;
