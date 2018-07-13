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

export type f<s, t> = () => AtomicReducerFunc<s, t>;
export type f1<s, t, A> = (a: A) => AtomicReducerFunc<s, t>;
export type f2<s, t, A, B> = (a: A, b: B) => AtomicReducerFunc<s, t>;
export type f3<s, t, A, B, C> = (a: A, b: B, c: C) => AtomicReducerFunc<s, t>;
export type f4<s, t, A, B, C, D> = (a: A, b: B, c: C, d: D) => AtomicReducerFunc<s, t>;
export type f5<s, t, A, B, C, D, E> = (a: A, b: B, c: C, d: D, e: E) => AtomicReducerFunc<s, t>;

export type g<s, t> = () => AtomicAction<s, t>;
export type g1<s, t, A> = (a: A) => AtomicAction<s, t>;
export type g2<s, t, A, B> = (a: A, b: B) => AtomicAction<s, t>;
export type g3<s, t, A, B, C> = (a: A, b: B, c: C) => AtomicAction<s, t>;
export type g4<s, t, A, B, C, D> = (a: A, b: B, c: C, d: D) => AtomicAction<s, t>;
export type g5<s, t, A, B, C, D, E> = (a: A, b: B, c: C, d: D, e: E) => AtomicAction<s, t>;

export type GenericActionFunc<s, t> = (...a: any[]) => AtomicReducerFunc<s, t>;
export type GenericActionDescriber<s, t> = { name: string; func: GenericActionFunc<s, t> };

export type AtomicFunctionList<s, t> = { [key: string]: GenericActionFunc<s, t> };
