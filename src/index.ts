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

export type GenericActionFunc<s, t> = (...a: any[]) => AtomicReducerFunc<s, t>;
export type GenericActionDescriber<s, t> = { name: string; func: GenericActionFunc<s, t> };

const warning = (string: string) => {
  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error(string);
  }
};

// please forgive this mutable state
// it records all reducer names to avoid duplicates
// and the weird errors that result
let allNames: string[] = [];

export function createAtomic<s, t>(
  reducerName: string,
  initialState: s,
  reducers: GenericActionDescriber<s, t>[]
) {
  const reducerFuncs = saveReducerFuncs(reducers);
  checkExistingName(reducerName);

  return {
    reducer,
    wrap: wrapper,
    actionTypes: getActionNames(reducerFuncs)
  };

  function reducer(state: s, action: AtomicAction<s, t>): s | t {
    const thisState = state || initialState;
    const params = cleanParams(action && action.payload ? action.payload : []);
    const funcKey = parseActionKeyFromType(reducerName, action.type);
    const func = reducerFuncs.find(reducer => reducer.name === funcKey);
    if (!func) {
      return thisState;
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

  function cleanParams(params: any[] | any): any[] {
    return Array.isArray(params) ? params : [params];
  }

  function wrapStateFunc<s, t>(params: any[], actionName: string): AtomicAction<s, t> {
    if (!funcExistsInReducer(reducerFuncs, actionName)) {
      warning(
        `Redux Atomic: Error in wrap for ${reducerName}! ${actionName} cannot be found. Did you remember to pass it to 'createAtomic()'?`
      );
    }
    return {
      type: generateKey(reducerName, actionName),
      payload: stripUndefined(params)
    };
  }

  function getActionNames(reducerFuncs: GenericActionDescriber<s, t>[]): string[] {
    return reducerFuncs.map(reducer => generateKey(reducerName, reducer.name));
  }

  function stripUndefined(list: any[]): any[] {
    return list.reduce((acc, val) => {
      return val !== undefined ? [...acc, val] : [...acc];
    }, []);
  }

  function wrapper<s, t>(func: f<s, t>, actionName: string): g<s, t>;
  function wrapper<s, t, A>(func: f1<s, t, A>, actionName: string): g1<s, t, A>;
  function wrapper<s, t, A, B>(func: f2<s, t, A, B>, actionName: string): g2<s, t, A, B>;
  function wrapper<s, t, A, B, C>(func: f3<s, t, A, B, C>, actionName: string): g3<s, t, A, B, C>;
  function wrapper<s, t, A, B, C, D>(func: f4<s, t, A, B, C, D>, actionName: string): g4<s, t, A, B, C, D> {
    const funcName = getActionName(actionName);
    if (funcName && checkActionNameExists(funcName)) {
      return function(a: A, b: B, c: C, d: D) {
        return wrapStateFunc([a, b, c, d], funcName);
      };
    } else {
      return function(a: A, b: B, c: C, d: D) {
        return {
          type: funcName || "",
          payload: [a, b, c, d]
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

  function saveReducerFuncs(reducers: GenericActionDescriber<s, t>[]): GenericActionDescriber<s, t>[] {
    return reducers.reduce(
      (acc: GenericActionDescriber<s, t>[], reducer: GenericActionDescriber<s, t>, index: number) => {
        const reducerFunc = getFunction(reducer, index, reducers.length);
        const funcName = checkFunctionName(reducer, index, reducers.length);
        return reducerFunc && funcName ? [...acc, reducer] : acc;
      },
      []
    );
  }

  function generateKey(reducerName: string, actionName: string): string {
    return reducerName + "_" + actionName;
  }

  function getFunction<s, t>(
    reducer: GenericActionDescriber<s, t>,
    index: number,
    length: number
  ): GenericActionFunc<s, t> | false {
    if (typeof reducer === "object" && typeof reducer.func === "function") {
      return reducer.func;
    } else {
      warning(
        `Redux Atomic: Error in createAtomic for ${reducerName}! Item ${index +
          1}/${length} is not a valid function. Please pass in an array of objects in the form: '{name: 'niceFunction', func: 'niceFunction'}'`
      );
      return false;
    }
  }

  function checkFunctionName<s, t>(
    reducer: GenericActionDescriber<s, t>,
    index: number,
    length: number
  ): string {
    if (!reducer.name || reducer.name.length < 1) {
      throw `Redux Atomic: Error in createAtomic for ${reducerName}! Could not ascertain name of function ${index +
        1}/${length}. Please pass the name in the form '{name: 'niceFunction', func: 'niceFunction'}'`;
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

const funcExistsInReducer = <s, t>(
  reducerFuncs: GenericActionDescriber<s, t>[],
  actionName: string
): boolean => reducerFuncs.filter(x => x.name === actionName).length > 0;
