import { createStore, combineReducers } from 'redux'
import { AtomicAction, AtomicActionType, createAtomic, REDUX_ATOMIC_ACTION, generateKey } from './index'

interface AtomicState {
    title: string
    arrayOfStrings: string[]
    counter: number
    subObject: {
        title: string
        age: number
    }
}

const initialAtomicState: AtomicState = {
    title: "",
    arrayOfStrings: [],
    counter: 0,
    subObject: {
        title: "",
        age: 0
    }
}

const atomic1 = createAtomic<AtomicState>(initialAtomicState)
const atomic2 = createAtomic<AtomicState>(initialAtomicState)

const sampleApp = combineReducers<any>({
    atomicOne: atomic1.reducer,
    atomicTwo: atomic2.reducer
})

const increment = (state: number): number => {
    return state + 1
}

const changeTitle = (title: string) => (state: AtomicState): AtomicState => {
    return {
        ...state,
        title
    }
}

describe("We're testing this approach", () => {
    it("Changes the state using a function/action thing", () => {
        let store = createStore(sampleApp)
        const action = atomic1.createAction(changeTitle("Shitter"))
        store.dispatch(action)
        const state: any = store.getState()
        expect(state.atomicOne.title).toEqual("Shitter")
    })

    it("Similar stores don't mess with one another", () => {
        let store = createStore(sampleApp)

        store.dispatch(atomic1.createAction(changeTitle("Shitter")))
        store.dispatch(atomic2.createAction(changeTitle("Shotter")))

        const state: any = store.getState();
        expect(state.atomicOne.title).toEqual("Shitter")
        expect(state.atomicTwo.title).toEqual("Shotter")
    })

    it('generates key', () => {
        expect(generateKey('test', 'getItem')).toEqual('ATOMIC_test_getItem')
    })

    it('createAtomicAction', () => {
        const expected = {
            type: generateKey(atomic1.identifier, "changeTitle"),
            meta: {
                id: REDUX_ATOMIC_ACTION,
                key: atomic1.identifier,
                change: changeTitle("horse")
            }
        }
        expect(JSON.stringify(atomic1.createAction(changeTitle("horse"), 'changeTitle'))).toBe(JSON.stringify(expected))
    })
})