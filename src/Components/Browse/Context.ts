import { generateUniqueString } from "../../App";

export const id = generateUniqueString();

const Context: BrowseContext = {
  extensions: new Map<string, Extension>(),
  installedExtensions: new Map<string, Extension>(),
  filters: new Set<Filter>(),
  entries: []
};
export default Context;
