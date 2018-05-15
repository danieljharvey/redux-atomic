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

const atomic1 = createAtomic(initialAtomicState);
const atomic2 = createAtomic(initialAtomicState);

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

    store.dispatch(actions1.changeTitle("Shitter"));
    store.dispatch(actions1.increment());

    const state: any = store.getState();
    expect(state.atomicOne.title).toEqual("Shitter");
    expect(state.atomicOne.counter).toEqual(1);
  });

  it("composes whilst keeping types", () => {
    const addWord = (word: string) => (toString: string): string => {
      return word + toString;
    };

    const addWordAndNumber = (word: string, num: number) => (toString: string): string => {
      return word + num.toString() + toString;
    };

    expect(addWord("slop")("plop")).toEqual("slopplop");
    expect(addWordAndNumber("slop", 100)("drop")).toEqual("slop100drop");

    function wrapperMaker<a, b>(func: (...stuff: a[]) => b) {
      return function(...stuff: a[]) {
        const prepped = func(...stuff);
        return {
          title: "hey",
          func: prepped
        };
      };
    }

    const expected1 = {
      title: "hey",
      func: addWord("drop")
    };

    const wrapped1 = wrapperMaker(addWord);
    expect(JSON.stringify(wrapped1("drop"))).toEqual(JSON.stringify(expected1));
    expect(wrapperMaker(addWord)("drop").func("slop")).toEqual("slopdrop");

    const expected2 = {
      title: "hey",
      func: addWordAndNumber("slop", 100)("drop")
    };

    const wrapped2 = wrapperMaker(addWordAndNumber);
    expect(JSON.stringify(wrapped2("drop"))).toEqual(JSON.stringify(expected2));
    expect(wrapperMaker(addWordAndNumber)("drop").func("slop")).toEqual("slopdrop");
  });
});
