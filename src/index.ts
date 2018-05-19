export const REDUX_ATOMIC_ACTION = 'reduxAtomic/REDUX_ATOMIC_ACTION'

export type AtomicReducerFunc<s, t> = (state: s) => s | t
export type AtomicReducer<s, t> = (state: s, action: AtomicAction<s, t>) => s | t

export interface AtomicAction<s, t> {
    type: string
    payload: {
        meta: {
            id: typeof REDUX_ATOMIC_ACTION
            key: object
            change: AtomicReducerFunc<s, t>
        }
    }
}

export type f<s, t> = () => AtomicReducerFunc<s, t>
export type f1<s, t, A> = (a: A) => AtomicReducerFunc<s, t>
export type f2<s, t, A, B> = (a: A, b: B) => AtomicReducerFunc<s, t>
export type f3<s, t, A, B, C> = (a: A, b: B, c: C) => AtomicReducerFunc<s, t>
export type f4<s, t, A, B, C, D> = (a: A, b: B, c: C, d: D) => AtomicReducerFunc<s, t>

export type g<s, t> = () => AtomicAction<s, t>
export type g1<s, t, A> = (a: A) => AtomicAction<s, t>
export type g2<s, t, A, B> = (a: A, b: B) => AtomicAction<s, t>
export type g3<s, t, A, B, C> = (a: A, b: B, c: C) => AtomicAction<s, t>
export type g4<s, t, A, B, C, D> = (a: A, b: B, c: C, d: D) => AtomicAction<s, t>

export function createAtomic<s, t>(initialState: s, name?: string) {
    const key = {}
    const reducerName = name || "anon"
    return {
        reducer: createAtomicReducer(initialState, key),
        key,
        name: reducerName,
        wrap: wrapper
    }

    function createAtomicReducer<s, t>(initialState: s, key: object) {
        return (state: s, action: AtomicAction<s, t>): s | t => {
            const thisState = state || initialState
            return (
                action.payload &&
                action.payload.meta &&
                action.payload.meta.key === key &&
                action.payload.meta.id === REDUX_ATOMIC_ACTION
            ) ? action.payload.meta.change(thisState) : thisState
        }
    }

    function wrapStateFunc<s, t>(func: AtomicReducerFunc<s, t>, funcName?: string): AtomicAction<s, t> {
        return {
            type: generateKey(reducerName, funcName),
            payload: {
                meta: {
                    id: REDUX_ATOMIC_ACTION,
                    key,
                    change: func
                }
            }
        }
    }

    function wrapper<s, t>(func: f<s, t>, funcName?: string): g<s, t>
    function wrapper<s, t, A>(func: f1<s, t, A>, funcName?: string): g1<s, t, A>
    function wrapper<s, t, A, B>(func: f2<s, t, A, B>, funcName?: string): g2<s, t, A, B>
    function wrapper<s, t, A, B, C>(func: f3<s, t, A, B, C>, funcName?: string): g3<s, t, A, B, C>
    function wrapper<s, t, A, B, C, D>(func: f4<s, t, A, B, C, D>, funcName?: string): g4<s, t, A, B, C, D> {
        return function (a: A, b: B, c: C, d: D) {
            return wrapStateFunc(func(a, b, c, d), funcName)
        }
    }

    function generateKey(identifier: string, funcName?: string): string {
        return 'ATOMIC_' + identifier + '_' + (funcName || 'anon')
    }
}







