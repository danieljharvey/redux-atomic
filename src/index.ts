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

export type GenericAction<s, t> = (...a: any[]) => AtomicReducerFunc<s, t>;

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
    return !func || !func(...params) ? thisState : func(...params)(thisState);
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

  function wrapper<s, t>(func: f<s, t>): g<s, t>;
  function wrapper<s, t, A>(func: f1<s, t, A>): g1<s, t, A>;
  function wrapper<s, t, A, B>(func: f2<s, t, A, B>): g2<s, t, A, B>;
  function wrapper<s, t, A, B, C>(func: f3<s, t, A, B, C>): g3<s, t, A, B, C>;
  function wrapper<s, t, A, B, C, D>(func: f4<s, t, A, B, C, D>): g4<s, t, A, B, C, D> {
    return function(a: A, b: B, c: C, d: D) {
      return wrapStateFunc(func(a, b, c, d), [a, b, c, d], func.name);
    };
  }

  function saveReducerFuncs(reducers: GenericAction<s, t>[]) {
    return reducers.reduce((acc, reducer, index) => {
      const funcName = getFunctionName(reducer, index, reducers.length);
      return { ...acc, [funcName]: reducer };
    }, {});
  }

  function generateKey(reducerName: string, actionName: string): string {
    return reducerName + "_" + actionName;
  }

  function getFunctionName<s, t>(func: GenericAction<s, t>, index: number, length: number): string {
    const name = func.name;
    if (name.length < 1) {
      throw `Redux Atomic: Error in createAtomic for ${reducerName}! Could not ascertain name of function ${index +
        1}/${length}. If it has been imported from another file please try using a 'function' instead of a 'const'`;
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
