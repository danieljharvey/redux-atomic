import { createStore, combineReducers } from 'redux'
import { AtomicAction, AtomicActionType, createAtomicDispatch, createAtomicReducer, REDUX_ATOMIC_ACTION } from './index'

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

interface AtomicState2 {
    arrayOfNums: number[]
    headerTitle: string
}

const initialAtomicState2: AtomicState2 = {
    arrayOfNums: [],
    headerTitle: ""
}

const sampleApp = combineReducers<any>({
    atomicStore: createAtomicReducer<AtomicState>("one", initialAtomicState),
    otherAtomicStore: createAtomicReducer<AtomicState>("bum", initialAtomicState),
    atomicStore2: createAtomicReducer<AtomicState2>("two", initialAtomicState2)
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
        const dispatch = createAtomicDispatch<AtomicState>("one")
        dispatch(changeTitle("Shitter"))(store.dispatch)
        const state: any = store.getState()
        expect(state.atomicStore.title).toEqual("Shitter")
    })

    it("Uses the reducer on it's own", () => {
        const reducer = createAtomicReducer<number>("flap", 0)

        const output = reducer(0, { type: REDUX_ATOMIC_ACTION, key: "flap", change: increment })
        const output2 = reducer(output, { type: REDUX_ATOMIC_ACTION, key: "some other", change: increment })

        expect(output2).toEqual(1)
    })

    it("Similar stores don't mess with one another", () => {
        let store = createStore(sampleApp)
        const dispatchOne = createAtomicDispatch<AtomicState>("one")
        const dispatchTwo = createAtomicDispatch<AtomicState>("bum")

        dispatchOne(changeTitle("Shitter"))(store.dispatch)
        dispatchTwo(changeTitle("Shotter"))(store.dispatch)

        const state: any = store.getState();
        expect(state.atomicStore.title).toEqual("Shitter")
        expect(state.otherAtomicStore.title).toEqual("Shotter")
    })

})