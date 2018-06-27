import { createAtomic, AtomicAction } from "../index";

export interface StateMate {
  number: number;
  string: string;
}

export const initialState: StateMate = {
  number: 0,
  string: ""
};

const zero = () => (state: StateMate): StateMate => {
  return {
    ...state,
    number: state.number + 1
  };
};

const one = (num: number) => (state: StateMate): StateMate => {
  return {
    ...state,
    number: state.number + num
  };
};

const two = (num: number, str: string) => (state: StateMate): StateMate => {
  return {
    ...state,
    string: str,
    number: num
  };
};

const three = (str: string, str2: string, num: number) => (state: StateMate): StateMate => {
  return {
    ...state,
    string: str + str2,
    number: num
  };
};

const { wrap, reducer } = createAtomic("test", initialState, [
  { name: "one", func: one },
  { name: "two", func: two },
  { name: "three", func: three }
]);

export const stateMateReducer = reducer;

export const stateMateActions = {
  one: wrap(one, "one"),
  two: wrap(two, "two"),
  three: wrap(three, "three")
};
