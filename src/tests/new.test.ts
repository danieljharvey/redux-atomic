import { createStore, combineReducers } from "redux";
import { AtomicAction, createAtomic, REDUX_ATOMIC_ACTION } from "../new";

interface AtomicState {
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

const atomic1 = createAtomic("atomic1", initialAtomicState, {
  increment,
  changeTitle
});
const atomic2 = createAtomic("atomic2", initialAtomicState, {
  increment,
  changeTitle
});

const sampleApp = combineReducers<any>({
  atomicOne: atomic1.reducer,
  atomicTwo: atomic2.reducer
});

const atomic1Actions = {
  increment: atomic1.wrapper(increment, "increment"),
  changeTitle: atomic1.wrapper(changeTitle, "changeTitle")
};

const atomic2Actions = {
  increment: atomic2.wrapper(increment, "increment"),
  changeTitle: atomic2.wrapper(changeTitle, "changeTitle")
};

describe("We're testing this approach", () => {
  it("Changes the state using a function/action thing", () => {
    let store = createStore(sampleApp);
    store.dispatch(atomic1Actions.changeTitle("Shitter"));
    const state: any = store.getState();
    expect(state.atomicOne.title).toEqual("Shitter");
  });

  it("Similar stores don't mess with one another", () => {
    let store = createStore(sampleApp);

    store.dispatch(atomic1Actions.changeTitle("Shitter"));
    store.dispatch(atomic2Actions.changeTitle("Shotter"));

    const state: any = store.getState();
    expect(state.atomicOne.title).toEqual("Shitter");
    expect(state.atomicTwo.title).toEqual("Shotter");
  });
});

interface StateMate {
  number: number;
  string: string;
}

const initialState: StateMate = {
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

const { wrapper, reducer, objectWrapper } = createAtomic("test", initialState, {
  one,
  two,
  three
});

const actions = objectWrapper({
  one,
  two,
  three
});
/*
const actions = {
  one: wrapper(one, "one"),
  two: wrapper(two, "two"),
  three: wrapper(three, "three")
};
*/
describe("It creates actions", () => {
  it("Has created three actions", () => {
    expect(actions.one).toBeDefined();
    expect(actions.two).toBeDefined();
    expect(actions.three).toBeDefined();
  });

  it("Has created three valid actions", () => {
    expect(actions.one(1)).toEqual({
      type: "test_one",
      payload: [1]
    });
    expect(actions.two(100, "yeah")).toEqual({
      type: "test_two",
      payload: [100, "yeah"]
    });
    expect(actions.three("yeah", "no", 1)).toEqual({
      type: "test_three",
      payload: ["yeah", "no", 1]
    });
  });
});

describe("It responds to actions", () => {
  it("Runs action one", () => {
    expect(reducer(initialState, actions.one(1))).toEqual({
      string: "",
      number: 1
    });
  });
});

/*
describe("It creates fake actions", () => {
  it("falls back to reducer name as action name", () => {
    const { wrap } = createAtomic(0, "yeah");
    const wZero = wrap(zero);
    const action = wZero();
    expect(action.type).toEqual("test_one");
  });

  it("correctly uses a passed action name", () => {
    const NICE_ACTION_NAME_BUDDY = "NICE_ACTION_NAME_BUDDY";
    const wZero = wrap(zero, NICE_ACTION_NAME_BUDDY);
    const action = wZero();
    expect(action.type).toEqual(NICE_ACTION_NAME_BUDDY);
  });

  it("passes it's params as the payload", () => {
    const NICE_ACTION_NAME_BUDDY = "NICE_ACTION_NAME_BUDDY";
    const wThree = wrap(three, NICE_ACTION_NAME_BUDDY);
    const action = wThree("One", "Two", 3);
    expect(action.payload).toEqual(["One", "Two", 3]);
  });
});
*/
