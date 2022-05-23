import DOM from "../../DOM";
import Browse from "../Browse";

const ignoreStates = [...Browse.ignoreStates];

const create = async () => {};

const render = async () => {
  DOM.clear();
};

const destroy = () => {};

export default { ignoreStates, render, destroy };
