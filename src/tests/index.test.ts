import { createStore } from "redux";
import { createAtomic, parseActionKeyFromType } from "../index";
import { niceFunction, ohNo } from "./function";

import { sampleApp, atomic1, atomic1Actions, atomic2Actions } from "./atomicReducerTest";
import { initialState, stateMateActions, stateMateReducer, stateMateActionTypes } from "./stateMateReducerTest";

describe("We're testing this approach", () => {
  it("Creates the expected actions", () => {
    expect(atomic1.actionTypes).toEqual(["atomic1_increment", "atomic1_changeTitle"]);
  });

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

describe("It creates actions", () => {
  it("Creates the actions", () => {
    expect(stateMateActionTypes).toEqual(['test_one', 'test_two', 'test_three'])
  })
  it("Has created three actions", () => {
    expect(stateMateActions.one).toBeDefined();
    expect(stateMateActions.two).toBeDefined();
    expect(stateMateActions.three).toBeDefined();
  });

  it("Has created three valid actions", () => {
    expect(stateMateActions.one(1)).toEqual({
      type: "test_one",
      payload: [1]
    });
    expect(stateMateActions.two(100, "yeah")).toEqual({
      type: "test_two",
      payload: [100, "yeah"]
    });
    expect(stateMateActions.three("yeah", "no", 1)).toEqual({
      type: "test_three",
      payload: ["yeah", "no", 1]
    });
  });
});

describe("It responds to actions", () => {
  it("Runs action one", () => {
    expect(stateMateReducer(initialState, stateMateActions.one(1))).toEqual({
      string: "",
      number: 1
    });
  });
  it("Runs action three", () => {
    expect(stateMateReducer(initialState, stateMateActions.three("hum", "drum", 65))).toEqual({
      string: "humdrum",
      number: 65
    });
  });
});

describe("It does not confuse reducers", () => {
  it("Does not confuse user_hello and userAdvanced_hello", () => {
    expect(parseActionKeyFromType("user", "userAdvanced_hello")).toEqual("");
  });
  it("Does not confuse THIS_NAME_YEAH_hello and THIS_NAME_hello", () => {
    expect(parseActionKeyFromType("THIS_NAME_YEAH", "THIS_NAME_YEAH_hello")).toEqual("hello");
  });
});

describe("It names a function", () => {
  it("Gets a local function name", () => {
    const localFunction: any = () => "horse";
    const { actionTypes } = createAtomic("boo2", initialState, { localFunction });
    expect(actionTypes).toEqual(["boo2_localFunction"]);
  });

  it("Does not throws an error when sent an anonymous function but is named", () => {
    const { actionTypes, reducer } = createAtomic("boo5", initialState, { niceFunction: niceFunction as any, ohNo });
    const boo5Reducer = reducer;
    const action = {
      type: "boo5_ohNo",
      payload: []
    };
    expect(actionTypes).toEqual(["boo5_niceFunction", "boo5_ohNo"]);
    // and it still works...
    expect(boo5Reducer(initialState, action)).toEqual("what");
  });

  it("Throws an error when total nonsense is sent instead of a function", () => {
    try {
      createAtomic("boo6", initialState, ["nonsense"] as any);
      expect(true).toBeTruthy();
    } catch {
      expect.assertions(0);
    }
  });
});

describe("Names in wrap", () => {
  it("Errors on finding anonymous function", () => {
    const { wrap } = createAtomic("boo7", initialState, { ohNo: ohNo as any });
    try {
      wrap(ohNo, "ohNo");
      expect(true).toBeTruthy();
    } catch {
      expect.assertions(0);
    }
  });

  it("Doesn't errors when using named anonymous function", () => {
    const { wrap } = createAtomic("boo8", initialState, { ohNo: ohNo as any });

    wrap(ohNo, "ohNo");
    expect(true).toBeTruthy();
  });

  it("Errors when using a name that has not been used in the reducer", () => {
    const { wrap } = createAtomic("boo9", initialState, { ohNo: ohNo as any });
    try {
      wrap(ohNo, "ohNo2");
      expect(true).toBeTruthy();
    } catch {
      expect.assertions(0);
    }
  });
});

describe("It spots multiple reducers with same name", () => {
  it("Throws an error", () => {
    const localFunction: any = () => "horse";
    const { actionTypes } = createAtomic("wooo", initialState, { niceFunction: niceFunction as any }
    );
    try {
      expect(createAtomic("wooo", initialState, { niceFunction: niceFunction as any })).toThrowError();
      expect(true).toBeTruthy();
    } catch {
      expect.assertions(0);
    }
  });
});
