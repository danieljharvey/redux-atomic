export const REDUX_ATOMIC_ACTION = "reduxAtomic/REDUX_ATOMIC_ACTION";

export interface Atomic<s> {
  reducer: AtomicReducer<s>;
  createAction: AtomicActionCreator<s>;
  name: string;
  key: object;
  exporter: AtomicExporterFunc<s, any>;
}

export interface AtomicAction<s> {
  type: string;
  meta: {
    id: typeof REDUX_ATOMIC_ACTION;
    key: object;
    change: AtomicReducerFunc<s>;
  };
}

export type AtomicReducerFunc<s> = (state: s) => s;
export type AtomicActionCreator<s> = (func: AtomicReducerFunc<s>, funcName?: string) => AtomicAction<s>;
export type AtomicDispatchFunc<s, T extends any> = (...args: T[]) => AtomicReducerFunc<s>;
export type AtomicReadyDispatchFunc<s, T extends any> = (...args: T[]) => AtomicAction<s>;
export type AtomicReducer<s> = (state: s, action: AtomicAction<s>) => s;
export type AtomicExporter<s, T extends any[]> = (
  func: AtomicDispatchFunc<s, T>,
  funcName?: string
) => (...args: T[]) => AtomicAction<s>;
export type AtomicActionList<s, T extends any> = { [t: string]: AtomicDispatchFunc<s, T> };
export type AtomicDispatchList<s, T extends any> = { [t: string]: AtomicReadyDispatchFunc<s, T> };
export type AtomicExporterFunc<s, T extends any> = (obj: AtomicActionList<s, T>) => AtomicDispatchList<s, T>;
