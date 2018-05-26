export const REDUX_ATOMIC_ACTION = "reduxAtomic/REDUX_ATOMIC_ACTION";

/**
 * The type of all values; nothing is known about it a priori
 * except that it exists. The same idea as Flow's `mixed` type.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/10715
 */
export type unknown = {} | undefined | null;

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

export type GenericFunc = (...a: any[]) => any;

export function createAtomic<s, t>(reducerName: string, initialState: s, reducers) {
  return {
    reducer,
    actions: createActions(reducers),
    wrapper,
    objectWrapper
  };

  function reducer<s, t>(state: s, action: AtomicAction<s, t>): s | t {
    const thisState = state || initialState;
    const funcKey = parseActionKeyFromType(action.type);
    return reducers[funcKey]
      ? reducers[funcKey](action.payload[0], action.payload[1], action.payload[2], action.payload[3])(
          thisState
        )
      : thisState;
  }

  function objectWrapper<T, K extends keyof T>(obj: T) {
    Object.keys(obj).forEach((key: K) => {
      obj[key] = wrapper(obj[key], key);
    });
    return obj;
  }

  function createActions<s, t, A, B, C, D>(reducers: { [key: string]: GenericFunc }) {
    return reducers
      ? Object.entries(reducers).reduce((acc, action) => {
          const [actionName, actionFunc] = action;
          const actionCreator = wrapper(actionFunc, actionName);
          return { ...acc, [actionName]: actionCreator };
        }, {})
      : {};
  }

  function wrapStateFunc<s, t>(
    func: AtomicReducerFunc<s, t>,
    params: any[],
    actionName: string
  ): AtomicAction<s, t> {
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

  function wrapper<s, t>(func: f<s, t>, actionName: string): g<s, t>;
  function wrapper<s, t, A>(func: f1<s, t, A>, actionName: string): g1<s, t, A>;
  function wrapper<s, t, A, B>(func: f2<s, t, A, B>, actionName: string): g2<s, t, A, B>;
  function wrapper<s, t, A, B, C>(func: f3<s, t, A, B, C>, actionName: string): g3<s, t, A, B, C>;
  function wrapper<s, t, A, B, C, D>(func: f4<s, t, A, B, C, D>, actionName: string): g4<s, t, A, B, C, D> {
    return function(a: A, b: B, c: C, d: D) {
      return wrapStateFunc(func(a, b, c, d), [a, b, c, d], actionName);
    };
  }

  function parseActionKeyFromType(actionType: string): string {
    return actionType.includes(reducerName) ? actionType.substr(actionType.indexOf("_") + 1) : "";
  }

  function generateKey(reducerName: string, actionName: string): string {
    return reducerName + "_" + actionName;
  }
}
