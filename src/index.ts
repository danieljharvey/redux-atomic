import { Dispatch } from 'redux'

export type AtomicReducerFunction<a> = (state: a) => a
export type AtomicDispatcher<a> = (dispatch: Dispatch) => (func: AtomicReducerFunction<a>) => void
export type AtomicReducer<a> = (state: a, action: AtomicAction<a>) => a

export interface Atomic<a> {
    reducer: AtomicReducer<a>
    decorateDispatcher: AtomicDispatcher<a>
}
export enum AtomicActionType {
    AtomicAction = 'ATOMIC_ACTION'
}

export const REDUX_ATOMIC_ACTION = 'reduxAtomic/REDUX_ATOMIC_ACTION'

export interface AtomicAction<a> {
    type: typeof REDUX_ATOMIC_ACTION
    key: string
    change: AtomicReducerFunction<a>
}

export function createAtomicDispatch<a>(reducerKey: string): AtomicDispatcher<a> {
    return function(dispatch: Dispatch) {
        return <a>(func: AtomicReducerFunction<a>): void => {
            dispatch<AtomicAction<a>>({
                type: REDUX_ATOMIC_ACTION,
                key: reducerKey,
                change: func
            })
        }
    }
}

export function createAtomicReducer<a>(reducerKey: string, initialState: a) {
    return (state: a, action: AtomicAction<a>): a => {
        const thisState = state || initialState
        return (action.key === reducerKey && action.type === REDUX_ATOMIC_ACTION) ? action.change(thisState) : thisState
    }
}

export function createAtomic<a>(reducerKey: string, initialState: a): Atomic<a> {
    return {
        reducer: createAtomicReducer(reducerKey, initialState),
        decorateDispatcher: createAtomicDispatch(reducerKey)
    }
}