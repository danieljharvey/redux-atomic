export type AtomicReducerFunc<s> = (state: s) => s;
export type AtomicReducer<s> = (state: s, action: AtomicAction<s>) => s;

export interface AtomicAction<s> {
  type: string;
  payload: any[];
}

export type f<s> = () => AtomicReducerFunc<s>;
export type f1<s, A> = (a: A) => AtomicReducerFunc<s>;
export type f2<s, A, B> = (a: A, b: B) => AtomicReducerFunc<s>;
export type f3<s, A, B, C> = (a: A, b: B, c: C) => AtomicReducerFunc<s>;
export type f4<s, A, B, C, D> = (a: A, b: B, c: C, d: D) => AtomicReducerFunc<s>;

export type g<s> = () => AtomicAction<s>;
export type g1<s, A> = (a: A) => AtomicAction<s>;
export type g2<s, A, B> = (a: A, b: B) => AtomicAction<s>;
export type g3<s, A, B, C> = (a: A, b: B, c: C) => AtomicAction<s>;
export type g4<s, A, B, C, D> = (a: A, b: B, c: C, d: D) => AtomicAction<s>;

export type GenericAction<s> = (...a: any[]) => AtomicReducerFunc<s>;

export function createAtomic<s>(reducerName: string, initialState: s, reducers: GenericAction<s>[]) {
  const reducerFuncs = saveReducerFuncs(reducers);

  return {
    reducer,
    wrap: wrapper
  };

  function reducer(state: s, action: AtomicAction<s>): s {
    const thisState = state || initialState;
    const params = action && action.payload ? action.payload : [];
    const funcKey = parseActionKeyFromType(reducerName, action.type);
    const func = funcKey in reducerFuncs ? reducerFuncs[funcKey] : false;
    return !func || !func(...params) ? thisState : func(...params)(thisState);
  }

  function wrapStateFunc<s>(func: AtomicReducerFunc<s>, params: any[], actionName: string): AtomicAction<s> {
    if (!funcExistsInReducer(reducerFuncs, actionName)) {
      throw `Wrap error! ${actionName} cannot be found. Did you remember to pass it to 'createAtomic()'?`;
    }
    return {
      type: generateKey(reducerName, actionName),
      payload: stripUndefined(params)
    };
  }

  function stripUndefined(list: any[]): any[] {
    return list.reduce((acc, val) => {
      return val !== undefined ? [...acc, val] : [...acc];
    }, []);
  }

  function wrapper<s>(func: f<s>): g<s>;
  function wrapper<s, A>(func: f1<s, A>): g1<s, A>;
  function wrapper<s, A, B>(func: f2<s, A, B>): g2<s, A, B>;
  function wrapper<s, A, B, C>(func: f3<s, A, B, C>): g3<s, A, B, C>;
  function wrapper<s, A, B, C, D>(func: f4<s, A, B, C, D>): g4<s, A, B, C, D> {
    return function(a: A, b: B, c: C, d: D) {
      return wrapStateFunc(func(a, b, c, d), [a, b, c, d], func.name);
    };
  }

  function saveReducerFuncs(reducers: GenericAction<s>[]) {
    return reducers.reduce((acc, reducer) => {
      const funcName = reducer.name;
      return { ...acc, [funcName]: reducer };
    }, {});
  }

  function generateKey(reducerName: string, actionName: string): string {
    return reducerName + "_" + actionName;
  }
}

export const parseActionKeyFromType = (reducerName: string, actionType: string): string => {
  return actionType.includes(reducerName + "_") ? actionType.substr(actionType.indexOf("_") + 1) : "";
};

const funcExistsInReducer = (reducerFuncs: {}, actionName): boolean => {
  return Object.keys(reducerFuncs).filter(x => x === actionName).length > 0;
};
