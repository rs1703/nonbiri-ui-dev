import { DefineComponent } from "../../DOM";

const mountedRef = { current: false };

const render = () => {};
const destroy = () => {};

export default DefineComponent({
  mountedRef,
  render,
  destroy
});
