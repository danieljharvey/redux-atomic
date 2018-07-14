export type StandardAction = {
  type: string;
  payload?: any;
  error?: any;
};
export type AtomicReducerFunc<s, t> = (state: s) => s | t;
export type AtomicReducer<s, t> = (state: s, action: AtomicAction<s, t>) => s | t;
export type AtomicListener<s, t> = (state: s, action: StandardAction) => s | t;
export type AtomicListenerObj<s, t> = { type: string; func: AtomicListener<s, t> };

export interface AtomicAction<s, t> {
  type: string;
  payload: any[];
}

export type GenericActionFunc<s, t> = (...a: any[]) => AtomicReducerFunc<s, t>;
export type GenericActionDescriber<s, t> = { name: string; func: GenericActionFunc<s, t> };

export type AtomicFunctionList<s, t> = { [key: string]: GenericActionFunc<s, t> };
export type AtomicListenerList<s, t> = { [key: string]: AtomicListener<s, t> };
