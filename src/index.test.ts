import { createStore, combineReducers } from "redux";
import { AtomicAction, createAtomic, REDUX_ATOMIC_ACTION, generateKey } from "./index";

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

type ActionParamTypes = string | number;

const atomic1 = createAtomic<AtomicState, ActionParamTypes>(initialAtomicState);
const atomic2 = createAtomic<AtomicState, ActionParamTypes>(initialAtomicState);

const sampleApp = combineReducers<any>({
  atomicOne: atomic1.reducer,
  atomicTwo: atomic2.reducer
});

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

const incrementBy = (amount: number) => (state: AtomicState): AtomicState => {
  return {
    ...state,
    counter: state.counter + amount
  };
};

const actions1 = atomic1.exporter({
  increment,
  changeTitle
});

describe("We're testing this approach", () => {
  it("Changes the state using a function/action thing", () => {
    let store = createStore(sampleApp);
    const action = atomic1.createAction(changeTitle("Shitter"));
    store.dispatch(action);
    const state: any = store.getState();
    expect(state.atomicOne.title).toEqual("Shitter");
  });

  it("Similar stores don't mess with one another", () => {
    let store = createStore(sampleApp);

    store.dispatch(atomic1.createAction(changeTitle("Shitter")));
    store.dispatch(atomic2.createAction(changeTitle("Shotter")));

    const state: any = store.getState();
    expect(state.atomicOne.title).toEqual("Shitter");
    expect(state.atomicTwo.title).toEqual("Shotter");
  });

  it("generates key", () => {
    expect(generateKey("test", "getItem")).toEqual("ATOMIC_test_getItem");
  });

  it("createAtomicAction", () => {
    const expected = {
      type: generateKey(atomic1.name, "changeTitle"),
      meta: {
        id: REDUX_ATOMIC_ACTION,
        key: atomic1.key,
        change: changeTitle("horse")
      }
    };
    expect(JSON.stringify(atomic1.createAction(changeTitle("horse"), "changeTitle"))).toBe(
      JSON.stringify(expected)
    );
  });

  it("uses exported actions directly with dispatch", () => {
    let store = createStore(sampleApp);

    const initialState: any = store.getState();
    expect(initialState.atomicOne.title).toEqual("");
    expect(initialState.atomicOne.counter).toEqual(0);

    store.dispatch(actions1.changeTitle(0));
    store.dispatch(actions1.increment());

    const state: any = store.getState();
    expect(state.atomicOne.title).toEqual("Shitter");
    expect(state.atomicOne.counter).toEqual(1);
  });

  it("uses increment by", () => {
    let store = createStore(sampleApp);
    store.dispatch(actions1.incrementBy("horse"));

    const state: any = store.getState();
    expect(state.atomicOne.counter).toEqual(0);
  });

  it("composes", () => {
    const addWord = (word: string) => (toString: string): string => {
      return toString + word;
    };
    expect(addWord("drop")("slop")).toEqual("slopdrop");
    const expected = {
      title: "hey",
      func: addWord("drop")
    };

    function wrapperMaker<a, b>(func: (...stuff: a[]) => b) {
      return function(...stuff: a[]) {
        const prepped = func(...stuff);
        return {
          title: "hey",
          func: prepped
        };
      };
    }

    expect(JSON.stringify(wrapperMaker(addWord)("drop"))).toEqual(JSON.stringify(expected));
    expect(wrapperMaker(addWord)("drop").func("slop")).toEqual("slopdrop");
  });
});
