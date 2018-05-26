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

export type f<s, t, A, B, C, D> = (a: A, b?: B, c?: C, d?: D) => AtomicReducerFunc<s, t>;
export type g<s, t, A, B, C, D> = (a: A, b?: B, c?: C, d?: D) => AtomicAction<s, t>;

export type j<s, t> = (a: unknown, b?: unknown, c?: unknown, d?: unknown) => AtomicReducerFunc<s, t>;

export function createAtomic<s, t>(
  reducerName: string,
  initialState: s,
  reducers: { [key: string]: j<s, t> }
) {
  return {
    reducer,
    actions: createActions(reducers)
  };

  function reducer<s, t>(state: s, action: AtomicAction<s, t>): s | t {
    const thisState = state || initialState;
    return thisState;
  }

  function createActions<s, t, A, B, C, D>(reducers: { [key: string]: j<s, t> }) {
    return reducers
      ? Object.entries(reducers).reduce(
          (acc: { [key: string]: g<s, t, A, B, C, D> }, action: [string, f<s, t, A, B, C, D>]) => {
            const [actionName, actionFunc] = action;
            const actionCreator = wrapper(actionFunc, actionName);
            return { ...acc, [actionName]: actionCreator };
          },
          {}
        )
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

  function wrapper<s, t, A, B, C, D>(func: f<s, t, A, B, C, D>, actionName: string): g<s, t, A, B, C, D> {
    return function(a: A, b?: B, c?: C, d?: D) {
      return wrapStateFunc(func(a, b, c, d), [a, b, c, d], actionName);
    };
  }

  function generateKey(reducerName: string, actionName: string): string {
    return reducerName + "_" + actionName;
  }
}
