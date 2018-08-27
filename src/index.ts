import {
  StandardAction,
  AtomicReducerFunc,
  AtomicListenerObj,
  AtomicAction,
  GenericActionFunc,
  GenericActionDescriber,
  AtomicFunctionList,
  AtomicListenerList,
  AtomicListener
} from "./types";
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

  function reducer(
    state: s,
    action: AtomicAction<s, t> | StandardAction
  ): s | t {
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

  function wrapStateFunc(
    params: any[],
    actionName: string
  ): AtomicAction<s, t> {
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
    const listenerFunc = listenerFuncs.filter(
      (listener: AtomicListenerObj<s, t>) => action.type === listener.type
    )[0];
    return listenerFunc !== undefined
      ? listenerFunc.func(state, action)
      : state;
  }

  function wrapper<TS extends any[]>(
    fn: (...args: TS) => AtomicReducerFunc<s, t>,
    actionName: string
  ): (...args: TS) => AtomicAction<s, t> {
    const funcName = getActionName(reducerName, actionName);
    if (
      funcName &&
      checkActionNameExists<s, t>(reducerName, reducerFuncs, funcName)
    ) {
      return (...args: TS) => wrapStateFunc(args, funcName);
    } else {
      return (...args: TS) => ({
        type: funcName || "",
        payload: args
      });
    }
  }
}

export {
  StandardAction,
  AtomicReducerFunc,
  AtomicListener,
  AtomicListenerObj,
  AtomicAction,
  GenericActionFunc,
  GenericActionDescriber,
  AtomicFunctionList,
  parseActionKeyFromType
};
