import { generateUniqueString } from "../../App";

export const id = generateUniqueString();

const Context = {
  currentExtension: undefined as Extension,
  extensions: new Map<string, Extension>(),
  installedExtensions: new Map<string, Extension>(),
  filters: undefined as Set<Filter>
};

export default Context;
