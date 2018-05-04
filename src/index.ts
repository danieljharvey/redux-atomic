import { Dispatch } from 'redux'

interface Function {
    name: string;
}

export type AtomicReducerFunction<a> = (state: a) => a
export type AtomicActionCreator<a> = (func: AtomicReducerFunction<a>, funcName?: string) => AtomicAction<a>
export type AtomicReducer<a> = (state: a, action: AtomicAction<a>) => a

export interface Atomic<a> {
    reducer: AtomicReducer<a>
    createAction: AtomicActionCreator<a>
    identifier: string
}
export enum AtomicActionType {
    AtomicAction = 'ATOMIC_ACTION'
}

export const REDUX_ATOMIC_ACTION = 'reduxAtomic/REDUX_ATOMIC_ACTION'

export interface AtomicAction<a> {
    type: string
    meta: {
        id: typeof REDUX_ATOMIC_ACTION
        key: string
        change: AtomicReducerFunction<a>
    }
}

export function createAtomicAction<a>(identifier: string): AtomicActionCreator<a> {
    return <a>(func: AtomicReducerFunction<a>, funcName?: string): AtomicAction<a> => {
        return {
            type: generateKey(identifier, funcName),
            meta: {
                id: REDUX_ATOMIC_ACTION,
                key: identifier,
                change: func
            }
        }
    }
}


export function createAtomicReducer<a>(initialState: a, identifier: string) {
    return (state: a, action: AtomicAction<a>): a => {
        const thisState = state || initialState
        return (
            action.meta &&
            action.meta.key === identifier &&
            action.meta.id === REDUX_ATOMIC_ACTION
        ) ? action.meta.change(thisState) : thisState
    }
}

export function createAtomic<a>(initialState: a): Atomic<a> {
    const identifier = guid()
    return {
        reducer: createAtomicReducer(initialState, identifier),
        createAction: createAtomicAction(identifier),
        identifier: identifier
    }
}

export const generateKey = (identifier: string, funcName?: string): string => {
    return 'ATOMIC_' + identifier + '_' + (funcName || 'anon')
}

function guid(): string {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// next make batcher for create actions from key/value pairs of actions so we don't have to provide names