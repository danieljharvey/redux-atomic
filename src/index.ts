import { Dispatch } from 'redux'

export interface Atomic<a> {
    reducer: AtomicReducer<a>
    createAction: AtomicActionCreator<a>
    name: string
    key: object
}

export interface AtomicAction<a> {
    type: string
    meta: {
        id: typeof REDUX_ATOMIC_ACTION
        key: object
        change: AtomicReducerFunction<a>
    }
}

export type AtomicReducerFunction<a> = (state: a) => a
export type AtomicActionCreator<a> = (func: AtomicReducerFunction<a>, funcName?: string) => AtomicAction<a>
export type AtomicReducer<a> = (state: a, action: AtomicAction<a>) => a

export type AtomicReducerFunctionList<a> = { [k: string]: AtomicReducerFunction<a> }
export type AtomicActionList<a> = { [k: string]: AtomicAction<a> }

export const REDUX_ATOMIC_ACTION = 'reduxAtomic/REDUX_ATOMIC_ACTION'

export function createAtomicAction<a>(key: object, reducerName: string): AtomicActionCreator<a> {
    return <a>(func: AtomicReducerFunction<a>, funcName?: string): AtomicAction<a> => {
        return {
            type: generateKey(reducerName, funcName),
            meta: {
                id: REDUX_ATOMIC_ACTION,
                key,
                change: func
            }
        }
    }
}


export function createAtomicReducer<a>(initialState: a, key: object) {
    return (state: a, action: AtomicAction<a>): a => {
        const thisState = state || initialState
        return (
            action.meta &&
            action.meta.key === key &&
            action.meta.id === REDUX_ATOMIC_ACTION
        ) ? action.meta.change(thisState) : thisState
    }
}

export function createAtomic<a>(initialState: a, name?: string): Atomic<a> {
    const key = {}
    const reducerName = name || "anon"
    return {
        reducer: createAtomicReducer(initialState, key),
        createAction: createAtomicAction(key, reducerName),
        key,
        name: reducerName
    }
}

export const generateKey = (identifier: string, funcName?: string): string => {
    return 'ATOMIC_' + identifier + '_' + (funcName || 'anon')
}