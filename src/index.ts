export type AtomicReducerFunc<s, t> = (state: s) => s | t;
export type AtomicReducer<s, t> = (state: s, action: AtomicAction<s, t>) => s | t;

export interface AtomicAction<s, t> {
  type: string;
  payload: any[];
}

export type f<s, t> = () => AtomicReducerFunc<s, t>;
export type f1<s, t, A> = (a: A) => AtomicReducerFunc<s, t>;
export type f2<s, t, A, B> = (a: A, b: B) => AtomicReducerFunc<s, t>;
export type f3<s, t, A, B, C> = (a: A, b: B, c: C) => AtomicReducerFunc<s, t>;
export type f4<s, t, A, B, C, D> = (a: A, b: B, c: C, d: D) => AtomicReducerFunc<s, t>;

export type g<s, t> = () => AtomicAction<s, t>;
export type g1<s, t, A> = (a: A) => AtomicAction<s, t>;
export type g2<s, t, A, B> = (a: A, b: B) => AtomicAction<s, t>;
export type g3<s, t, A, B, C> = (a: A, b: B, c: C) => AtomicAction<s, t>;
export type g4<s, t, A, B, C, D> = (a: A, b: B, c: C, d: D) => AtomicAction<s, t>;

export type GenericAction<s, t> = GenericActionFunc<s, t> | GenericActionDescriber<s, t>;
export type GenericActionFunc<s, t> = (...a: any[]) => AtomicReducerFunc<s, t>;
export type GenericActionDescriber<s, t> = { name: string; func: GenericActionFunc<s, t> };

// please forgive this mutable state
// it records all reducer names to avoid duplicates
// and the weird errors that result
let allNames = [];

export function createAtomic<s, t>(reducerName: string, initialState: s, reducers: GenericAction<s, t>[]) {
  const reducerFuncs = saveReducerFuncs(reducers);

  checkExistingName(reducerName);

  return {
    reducer,
    wrap: wrapper,
    actionTypes: getActionNames()
  };

  function reducer(state: s, action: AtomicAction<s, t>): s | t {
    const thisState = state || initialState;
    const params = action && action.payload ? action.payload : [];
    const funcKey = parseActionKeyFromType(reducerName, action.type);
    const func = funcKey in reducerFuncs ? reducerFuncs[funcKey] : false;
    return !func || (func && !func(...params)) ? thisState : func(...params)(thisState);
  }

  function wrapStateFunc<s, t>(
    func: AtomicReducerFunc<s, t>,
    params: any[],
    actionName: string
  ): AtomicAction<s, t> {
    if (!funcExistsInReducer(reducerFuncs, actionName)) {
      throw `Redux Atomic: Error in wrap for ${reducerName}! ${actionName} cannot be found. Did you remember to pass it to 'createAtomic()'?`;
    }
    return {
      type: generateKey(reducerName, actionName),
      payload: stripUndefined(params)
    };
  }

  function getActionNames() {
    return Object.keys(reducerFuncs).map(name => generateKey(reducerName, name));
  }

  function stripUndefined(list: any[]): any[] {
    return list.reduce((acc, val) => {
      return val !== undefined ? [...acc, val] : [...acc];
    }, []);
  }

  function wrapper<s, t>(func: f<s, t>, actionName?: string): g<s, t>;
  function wrapper<s, t, A>(func: f1<s, t, A>, actionName?: string): g1<s, t, A>;
  function wrapper<s, t, A, B>(func: f2<s, t, A, B>, actionName?: string): g2<s, t, A, B>;
  function wrapper<s, t, A, B, C>(func: f3<s, t, A, B, C>, actionName?: string): g3<s, t, A, B, C>;
  function wrapper<s, t, A, B, C, D>(func: f4<s, t, A, B, C, D>, actionName?: string): g4<s, t, A, B, C, D> {
    const funcName = getActionName(func, actionName);
    checkActionNameExists(funcName);
    return function(a: A, b: B, c: C, d: D) {
      return wrapStateFunc(func(a, b, c, d), [a, b, c, d], funcName);
    };
  }

  function checkActionNameExists(funcName: string) {
    if (!isActionNameFound(funcName)) {
      throw `Redux Atomic: Error in wrap for ${reducerName}! Could not wrap function ${funcName} as it has not been passed to createAtomic();`;
    }
  }
  function isActionNameFound(funcName: string) {
    return Object.keys(reducerFuncs).some((key: string) => key === funcName);
  }

  function getActionName(func, actionName?: string) {
    if (func.name && func.name.length > 0) {
      return func.name;
    }
    if (actionName && actionName.length > 0) {
      return actionName;
    }
    throw `Redux Atomic: Error in wrap for ${reducerName}! Could not ascertain name of function - if you are using imported const functions please provide an explicit name to wrap, ie wrap(function, 'functionName')`;
  }

  function saveReducerFuncs(reducers: GenericAction<s, t>[]) {
    return reducers.reduce((acc, reducer, index) => {
      const funcName = getFunctionName(reducer, index, reducers.length);
      const reducerFunc = getFunction(reducer, index, reducers.length);
      return { ...acc, [funcName]: reducerFunc };
    }, {});
  }

  function generateKey(reducerName: string, actionName: string): string {
    return reducerName + "_" + actionName;
  }

  function getFunction<s, t>(func: GenericAction<s, t>, index: number, length: number) {
    if (typeof func === "function") {
      return func;
    } else if (typeof func === "object" && typeof func.func === "function") {
      return func.func;
    } else {
      throw `Redux Atomic: Error in createAtomic for ${reducerName}! Item ${index +
        1}/${length} is not a valid function. Please pass in an array of functions or objects in the form: '{name: 'niceFunction', func: 'niceFunction'}'`;
    }
  }

  function getFunctionName<s, t>(func: GenericAction<s, t>, index: number, length: number): string {
    const name = func.name || "";
    if (name.length < 1) {
      throw `Redux Atomic: Error in createAtomic for ${reducerName}! Could not ascertain name of function ${index +
        1}/${length}. If it has been imported from another file please try using a 'function' instead of a 'const', or explicitly pass the name in the form '{name: 'niceFunction', func: 'niceFunction'}'`;
    } else {
      return name;
    }
  }

  function checkExistingName(reducerName: string) {
    if (allNames.includes(reducerName)) {
      throw `Redux Atomic: Error in createAtomic for ${reducerName}! A reducer with this name already exists!`;
    }
    allNames.push(reducerName);
  }
}

export const parseActionKeyFromType = (reducerName: string, actionType: string): string => {
  return actionType.includes(reducerName + "_") ? actionType.substr(actionType.lastIndexOf("_") + 1) : "";
};

const funcExistsInReducer = (reducerFuncs: {}, actionName): boolean => {
  return Object.keys(reducerFuncs).filter(x => x === actionName).length > 0;
};
