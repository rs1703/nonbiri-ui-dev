import { generateUniqueString } from "../../App";

export const id = generateUniqueString();

const Context = {
  currentExtension: null as Extension,
  extensions: new Map<string, Extension>(),
  installedExtensions: new Map<string, Extension>()
};
export default Context;
