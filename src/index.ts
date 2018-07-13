import {
  StandardAction,
  AtomicReducerFunc,
  AtomicListener,
  AtomicListenerObj,
  AtomicAction,
  f,
  f1,
  f2,
  f3,
  f4,
  f5,
  g,
  g1,
  g2,
  g3,
  g4,
  g5,
  GenericActionFunc,
  GenericActionDescriber,
  AtomicFunctionList,
  AtomicListenerList
} from "./types";
export { AtomicReducer, AtomicListener } from "./types";
import {
  parseActionKeyFromType,
  funcExistsInReducer,
  warning,
  generateKey,
  cleanParams,
  stripUndefined,
  saveListenerFuncs,
  saveReducerFuncs,
  checkActionNameExists,
  getActionName,
  isFunctionValid,
  getActionNames,
  checkExistingName
} from "./helpers";

// please forgive this mutable state
// it records all reducer names to avoid duplicates
// and the weird errors that result
let allNames: string[] = [];

export function createAtomic<s, t>(
  reducerName: string,
  initialState: s,
  reducers: AtomicFunctionList<s, t>,
  listeners: AtomicListenerList<s, t> = {}
) {
  const reducerFuncs = saveReducerFuncs<s, t>(reducerName, reducers);
  const listenerFuncs = saveListenerFuncs<s, t>(listeners);
  allNames = checkExistingName(allNames, reducerName);

  return {
    reducer,
    wrap: wrapper,
    actionTypes: getActionNames<s, t>(reducerName, reducerFuncs, listenerFuncs)
  };

  function reducer(state: s, action: AtomicAction<s, t> | StandardAction): s | t {
    const thisState = state || initialState;
    const params = cleanParams(action && action.payload ? action.payload : []);
    const funcKey = parseActionKeyFromType(reducerName, action.type);
    const func = reducerFuncs.find(reducer => reducer.name === funcKey);
    if (!func) {
      return runListeners(thisState, action);
    }

    const atomicFunc = isFunctionValid<s, t>(func, params);
    return atomicFunc ? atomicFunc(thisState) : thisState;
  }

  function wrapStateFunc(params: any[], actionName: string): AtomicAction<s, t> {
    if (!funcExistsInReducer(reducerFuncs, actionName)) {
      warning(
        `Redux Atomic: Error in wrap() for ${reducerName}! ${actionName} cannot be found. Did you remember to pass it to 'createAtomic()'?`
      );
    }
    return {
      type: generateKey(reducerName, actionName),
      payload: stripUndefined(params)
    };
  }

  function runListeners(state: s, action: StandardAction): s | t {
    const listenerFunc = listenerFuncs.filter((listener: AtomicListenerObj<s, t>) => {
      const { type } = listener;
      return action.type === type;
    })[0];
    return listenerFunc !== undefined ? listenerFunc.func(state, action) : state;
  }

  function wrapper(_: f<s, t>, actionName: string): g<s, t>;
  function wrapper<A>(_: f1<s, t, A>, actionName: string): g1<s, t, A>;
  function wrapper<A, B>(_: f2<s, t, A, B>, actionName: string): g2<s, t, A, B>;
  function wrapper<A, B, C>(_: f3<s, t, A, B, C>, actionName: string): g3<s, t, A, B, C>;
  function wrapper<A, B, C, D>(_: f4<s, t, A, B, C, D>, actionName: string): g4<s, t, A, B, C, D>;
  function wrapper<A, B, C, D, E>(_: f5<s, t, A, B, C, D, E>, actionName: string): g5<s, t, A, B, C, D, E> {
    const funcName = getActionName(reducerName, actionName);
    if (funcName && checkActionNameExists<s, t>(reducerName, reducerFuncs, funcName)) {
      return function(a: A, b: B, c: C, d: D, e: E) {
        return wrapStateFunc([a, b, c, d, e], funcName);
      };
    } else {
      return function(a: A, b: B, c: C, d: D, e: E) {
        return {
          type: funcName || "",
          payload: [a, b, c, d, e]
        };
      };
    }
  }
}

export {
  StandardAction,
  AtomicReducerFunc,
  AtomicListenerObj,
  AtomicAction,
  f,
  f1,
  f2,
  f3,
  f4,
  f5,
  g,
  g1,
  g2,
  g3,
  g4,
  g5,
  GenericActionFunc,
  GenericActionDescriber,
  AtomicFunctionList,
  parseActionKeyFromType
};
