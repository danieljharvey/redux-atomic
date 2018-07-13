import {
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
  AtomicFunctionList
} from "./types";
export { AtomicReducer, AtomicListener } from "./types";
import {
  parseActionKeyFromType,
  funcExistsInReducer,
  warning,
  generateKey,
  cleanParams,
  stripUndefined
} from "./helpers";

// please forgive this mutable state
// it records all reducer names to avoid duplicates
// and the weird errors that result
let allNames: string[] = [];

export function createAtomic<s, t>(
  reducerName: string,
  initialState: s,
  reducers: AtomicFunctionList<s, t>,
  listeners: AtomicListenerObj<s, t>[] = []
) {
  const reducerFuncs = saveReducerFuncs(reducers);
  const listenerFuncs = listeners;
  checkExistingName(reducerName);

  return {
    reducer,
    wrap: wrapper,
    actionTypes: getActionNames(reducerFuncs, listenerFuncs)
  };

  function reducer(state: s, action: AtomicAction<s, t> | StandardAction): s | t {
    const thisState = state || initialState;
    const params = cleanParams(action && action.payload ? action.payload : []);
    const funcKey = parseActionKeyFromType(reducerName, action.type);
    const func = reducerFuncs.find(reducer => reducer.name === funcKey);
    if (!func) {
      return runListeners(thisState, action);
    }

    const atomicFunc = isFunctionValid(func, params);
    return atomicFunc ? atomicFunc(thisState) : thisState;
  }

  function isFunctionValid(
    reducer: GenericActionDescriber<s, t>,
    params: any[]
  ): AtomicReducerFunc<s, t> | false {
    return typeof reducer.func === "function" ? reducer.func.apply(void 0, params) : false;
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

  function getActionNames(
    reducerFuncs: GenericActionDescriber<s, t>[],
    listenerFuncs: AtomicListenerObj<s, t>[]
  ): string[] {
    const reducerTypes = reducerFuncs.map(reducer => generateKey(reducerName, reducer.name));
    const listenerTypes = Object.values(listenerFuncs).map(listener => listener.type);
    return reducerTypes.concat(listenerTypes);
  }

  function wrapper(_: f<s, t>, actionName: string): g<s, t>;
  function wrapper<A>(_: f1<s, t, A>, actionName: string): g1<s, t, A>;
  function wrapper<A, B>(_: f2<s, t, A, B>, actionName: string): g2<s, t, A, B>;
  function wrapper<A, B, C>(_: f3<s, t, A, B, C>, actionName: string): g3<s, t, A, B, C>;
  function wrapper<A, B, C, D>(_: f4<s, t, A, B, C, D>, actionName: string): g4<s, t, A, B, C, D>;
  function wrapper<A, B, C, D, E>(_: f5<s, t, A, B, C, D, E>, actionName: string): g5<s, t, A, B, C, D, E> {
    const funcName = getActionName(actionName);
    if (funcName && checkActionNameExists(funcName)) {
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

  function checkActionNameExists(funcName: string): boolean {
    if (!isActionNameFound(funcName)) {
      warning(
        `Redux Atomic: Error in wrap for ${reducerName}! Could not wrap function ${funcName} as it has not been passed to createAtomic();`
      );
      return false;
    }
    return true;
  }

  function isActionNameFound(funcName: string) {
    return reducerFuncs.some(reducer => reducer.name === funcName);
  }

  function getActionName(actionName: string): string | false {
    if (actionName && String(actionName) === actionName && actionName.length > 0) {
      return actionName;
    }
    warning(
      `Redux Atomic: Error in wrap for ${reducerName}! actionName must be a valid string of 1 character or more`
    );
    return false;
  }

  function saveReducerFuncs(reducers: AtomicFunctionList<s, t>): GenericActionDescriber<s, t>[] {
    const reducersArray = Object.keys(reducers);
    return reducersArray
      .map((key: string) => ({ name: key, func: reducers[key] }))
      .reduce((acc: GenericActionDescriber<s, t>[], reducer: GenericActionDescriber<s, t>, index: number) => {
        const reducerFunc = getFunction(reducer, index, reducersArray.length);
        const funcName = checkFunctionName(reducer, index, reducersArray.length);
        return reducerFunc && funcName ? [...acc, reducer] : acc;
      }, []);
  }

  function getFunction(
    reducer: GenericActionDescriber<s, t>,
    index: number,
    length: number
  ): GenericActionFunc<s, t> | false {
    if (typeof reducer === "object" && typeof reducer.func === "function") {
      return reducer.func;
    } else {
      warning(
        `Redux Atomic: Error in createAtomic for ${reducerName}! Item ${index +
          1}/${length} is not a valid function. Please pass in functions in the form: '{ functionName: function, functionName2: function2 }'`
      );
      return false;
    }
  }

  function checkFunctionName(reducer: GenericActionDescriber<s, t>, index: number, length: number): string {
    if (!reducer.name || reducer.name.length < 1) {
      warning(
        `Redux Atomic: Error in createAtomic for ${reducerName}! Could not ascertain name of function ${index +
          1}/${length}. Please pass the name in the form '{functionName: function}'`
      );
      return "";
    } else {
      return reducer.name;
    }
  }

  function checkExistingName(reducerName: string): void {
    if (allNames.includes(reducerName)) {
      warning(
        `Redux Atomic: Error in createAtomic for ${reducerName}! A reducer with this name already exists!`
      );
      return;
    }
    allNames.push(reducerName);
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
