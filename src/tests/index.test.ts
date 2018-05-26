import { createStore, combineReducers } from "redux";
import { AtomicAction, createAtomic } from "../index";

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

const atomic1 = createAtomic("atomic1", initialAtomicState, [increment, changeTitle]);
const atomic2 = createAtomic("atomic2", initialAtomicState, [increment, changeTitle]);

const sampleApp = combineReducers<any>({
  atomicOne: atomic1.reducer,
  atomicTwo: atomic2.reducer
});

const atomic1Actions = {
  increment: atomic1.wrap(increment),
  changeTitle: atomic1.wrap(changeTitle)
};

const atomic2Actions = {
  increment: atomic2.wrap(increment),
  changeTitle: atomic2.wrap(changeTitle)
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

  it("doesn't break when provided a faulty name", () => {
    let store = createStore(sampleApp);

    const firstState: any = store.getState();
    store.dispatch({ type: "sdfslkdfklslkdflk;sfd" });

    const endState: any = store.getState();
    expect(firstState).toEqual(endState);
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

const { wrap, reducer } = createAtomic("test", initialState, [one, two, three]);

const actions = {
  one: wrap(one),
  two: wrap(two),
  three: wrap(three)
};

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
