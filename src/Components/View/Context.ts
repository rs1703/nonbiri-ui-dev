import { generateUniqueString } from "../../App";

export const id = generateUniqueString();

const Context = {
  currentExtension: undefined as Extension,
  data: undefined as Manga
};

export default Context;
