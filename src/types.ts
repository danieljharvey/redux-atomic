export const REDUX_ATOMIC_ACTION = 'reduxAtomic/REDUX_ATOMIC_ACTION'

export interface Atomic<s> {
    reducer: AtomicReducer<s>
    createAction: AtomicActionCreator<s>
    name: string
    key: object
    exporter: AtomicExporterFunc<s>
}

export interface AtomicAction<s> {
    type: string
    meta: {
        id: typeof REDUX_ATOMIC_ACTION
        key: object
        change: AtomicReducerFunc<s>
    }
}

export type AtomicReducerFunc<s> = (state: s) => s
export type AtomicActionCreator<s> = (func: AtomicReducerFunc<s>, funcName?: string) => AtomicAction<s>
export type AtomicDispatchFunc<s> = (...args: any[]) => AtomicReducerFunc<s>
export type AtomicReadyDispatchFunc<s> = (...args: any[]) => AtomicAction<s>
export type AtomicReducer<s> = (state: s, action: AtomicAction<s>) => s
export type AtomicExporter<s> = (func: AtomicDispatchFunc<s>, funcName?: string) => (...args: any[]) => AtomicAction<s>
export type AtomicActionList<s> = { [t: string]: AtomicDispatchFunc<s> }
export type AtomicDispatchList<s> = { [t: string]: AtomicReadyDispatchFunc<s> }
export type AtomicExporterFunc<s> = (obj: AtomicActionList<s>) => AtomicDispatchList<s>