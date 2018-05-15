export const REDUX_ATOMIC_ACTION = 'reduxAtomic/REDUX_ATOMIC_ACTION'

export interface Atomic<s, p> {
    reducer: AtomicReducer<s>
    createAction: AtomicActionCreator<s>
    name: string
    key: object
    exporter: AtomicExporterFunc<s, p>
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
export type AtomicDispatchFunc<s, p> = (...stuff: p[]) => AtomicReducerFunc<s>
export type AtomicReadyDispatchFunc<s, p> = (...stuff: p[]) => AtomicAction<s>
export type AtomicReducer<s> = (state: s, action: AtomicAction<s>) => s
export type AtomicExporter<s, p> = (func: AtomicDispatchFunc<s, p>, funcName?: string) => (...stuff: p[]) => AtomicAction<s>
export type AtomicActionList<s, p> = { [t: string]: AtomicDispatchFunc<s, p> }
export type AtomicDispatchList<s, p> = { [t: string]: AtomicReadyDispatchFunc<s, p> }
export type AtomicExporterFunc<s, p> = (obj: AtomicActionList<s, p>) => AtomicDispatchList<s, p>