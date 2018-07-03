import { combineReducers, AnyAction } from "redux";
import { createAtomic, AtomicAction } from "../index";

export interface AtomicState {
  title: string;
  arrayOfStrings: string[];
  counter: number;
  subObject: {
    title: string;
    age: number;
  };
}

const initialAtomicState: AtomicState = {
  title: "",
  arrayOfStrings: [],
  counter: 0,
  subObject: {
    title: "",
    age: 0
  }
};

const increment = () => (state: AtomicState): AtomicState => {
  return {
    ...state,
    counter: state.counter + 1
  };
};

const changeTitle = (title: string) => (state: AtomicState): AtomicState => {
  return {
    ...state,
    title
  };
};

export const atomic1 = createAtomic("atomic1", initialAtomicState, { increment, changeTitle });

export const atomic2 = createAtomic("atomic2", initialAtomicState, { increment, changeTitle });

export const sampleApp = combineReducers<any>({
  atomicOne: atomic1.reducer,
  atomicTwo: atomic2.reducer
});

export const atomic1Actions = {
  increment: atomic1.wrap(increment, "increment"),
  changeTitle: atomic1.wrap(changeTitle, "changeTitle")
};

export const atomic2Actions = {
  increment: atomic2.wrap(increment, "increment"),
  changeTitle: atomic2.wrap(changeTitle, "changeTitle")
};
