export const REDUX_ATOMIC_ACTION = "reduxAtomic/REDUX_ATOMIC_ACTION";

export interface Atomic<s, a, b, c, d, e, f, g> {
  reducer: AtomicReducer<s>;
  createAction: AtomicActionCreator<s>;
  name: string;
  key: object;
  exporter: AtomicExporterFunc<s, a, b, c, d, e, f, g>;
}

export interface AtomicAction<s> {
  type: string;
  meta: {
    id: typeof REDUX_ATOMIC_ACTION;
    key: object;
    change: AtomicReducerFunc<s>;
  };
}

export type AtomicPropList<a, b, c, d, e, f, g> = Array<a | b | c | d | e | f | g>;
export type AtomicReducerFunc<s> = (state: s) => s;
export type AtomicActionCreator<s> = (func: AtomicReducerFunc<s>, funcName?: string) => AtomicAction<s>;
export type AtomicDispatchFunc<s, a, b, c, d, e, f, g> = (
  ...args: AtomicPropList<a, b, c, d, e, f, g>
) => AtomicReducerFunc<s>;
export type AtomicReadyDispatchFunc<s, a, b, c, d, e, f, g> = (
  ...args: AtomicPropList<a, b, c, d, e, f, g>
) => AtomicAction<s>;
export type AtomicReducer<s> = (state: s, action: AtomicAction<s>) => s;
export type AtomicExporter<s, a, b, c, d, e, f, g> = (
  func: AtomicDispatchFunc<s, a, b, c, d, e, f, g>,
  funcName?: string
) => (...args: any[]) => AtomicAction<s>;
export type AtomicActionList<s, a, b, c, d, e, f, g> = {
  [t: string]: AtomicDispatchFunc<s, a, b, c, d, e, f, g>;
};
export type AtomicDispatchList<s, a, b, c, d, e, f, g> = {
  [t: string]: AtomicReadyDispatchFunc<s, a, b, c, d, e, f, g>;
};
export type AtomicExporterFunc<s, a, b, c, d, e, f, g> = (
  obj: AtomicActionList<s, a, b, c, d, e, f, g>
) => AtomicDispatchList<s, a, b, c, d, e, f, g>;
