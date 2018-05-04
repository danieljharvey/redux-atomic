import { Dispatch } from 'redux'

export type AtomicReducerFunction<a> = (state: a) => a
export type AtomicDispatcher<a> = (func: AtomicReducerFunction<a>) => (dispatch: Dispatch) => void
export type AtomicReducer<a> = (state: a, action: AtomicAction<a>) => a

export interface Atomic<a> {
    reducer: AtomicReducer<a>
    dispatch: AtomicDispatcher<a>
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
    return <a>(func: AtomicReducerFunction<a>) => {
        return function(dispatch: Dispatch): void  {
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

function createAtomic<a>(reducerKey: string, initialState: a): Atomic<a> {
    return {
        reducer: createAtomicReducer(reducerKey, initialState),
        dispatch: createAtomicDispatch(reducerKey)
    }
}

// needs a global create action that returns reducer, dispatcher, getState and maybe subscribe
// the dispatcher will be curried waiting for the actual redux one, like normal redux actions
// getState might be tricky..?

// atomicStore should be like a small version of Store
// that provides subscribe, dispatch and getState
// but only applies to local part
// so is duplicatable?

// getState is just dispatch with identity function
// subscribe is .. ? maybe?

// allow autonaming of reducerKey if user doesn't give a shit