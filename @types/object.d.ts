interface InputOption {
  key?: string;
  title?: string;
  description?: string;
  value?: string;
  defaultValue?: string;
}

interface StateOption {
  key?: string;
  title?: string;
  value?: string;
  state?: number;
  defaultState?: number;
}

interface StateObject {
  key?: string;
  title?: string;
  description?: string;
  options?: StateOption[];
}

interface TriStateObject {
  key?: string;
  excludedKey?: string;
  title?: string;
  description?: string;
  options?: StateOption[];
}

interface TextObject {
  type: "text";
  key?: string;
  value?: string;
}

interface Input extends InputOption {
  type: "input";
}

interface Checkbox extends StateObject {
  type: "checkbox";
}

interface Radio extends StateObject {
  type: "radio";
}

interface TriState extends TriStateObject {
  type: "tristate";
}

interface Select extends StateObject {
  type: "select";
}

type Filter = Input | Checkbox | Radio | TriState | Select;
type StateFilter = Checkbox | Radio | TriState | Select;
