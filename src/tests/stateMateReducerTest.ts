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

export const one = (num: number) => (state: StateMate): StateMate => {
  return {
    ...state,
    number: state.number + num
  };
};

export const two = (num: number, str: string) => (
  state: StateMate
): StateMate => {
  return {
    ...state,
    string: str,
    number: num
  };
};

const three = (str: string, str2: string, num: number) => (
  state: StateMate
): StateMate => {
  return {
    ...state,
    string: str + str2,
    number: num
  };
};

interface StateAction {
  type: string;
  payload: any[];
}

const { actionTypes, wrap, reducer } = createAtomic<StateMate, StateMate>(
  "test",
  initialState,
  { one, two, three }
);

export const stateMateReducer = reducer;

export const stateMateActionTypes = actionTypes;

export const stateMateActions = {
  one: wrap(one, "one"),
  two: wrap(two, "two"),
  three: wrap(three, "three")
};
