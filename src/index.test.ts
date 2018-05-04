import { createStore, combineReducers } from 'redux'
import { AtomicAction, AtomicActionType, createAtomic, REDUX_ATOMIC_ACTION } from './index'

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

const atomic1 = createAtomic<AtomicState>("one", initialAtomicState)
const atomicOne = createAtomic<AtomicState>("bum", initialAtomicState)
const atomic2 = createAtomic<AtomicState2>("two", initialAtomicState2)

const sampleApp = combineReducers<any>({
    atomicStore: atomic1.reducer,
    otherAtomicStore: atomicOne.reducer,
    atomicStore2: atomic2.reducer
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
        const dispatch = atomic1.decorateDispatcher(store.dispatch)
        dispatch(changeTitle("Shitter"))
        const state: any = store.getState()
        expect(state.atomicStore.title).toEqual("Shitter")
    })

    it("Uses the reducer on it's own", () => {
        const testFace = createAtomic<number>("flap", 0)

        const output = testFace.reducer(0, { type: REDUX_ATOMIC_ACTION, key: "flap", change: increment })
        const output2 = testFace.reducer(output, { type: REDUX_ATOMIC_ACTION, key: "some other", change: increment })

        expect(output2).toEqual(1)
    })

    it("Similar stores don't mess with one another", () => {
        let store = createStore(sampleApp)
        
        const dispatchOne = atomic1.decorateDispatcher(store.dispatch)
        const dispatchTwo = atomicOne.decorateDispatcher(store.dispatch)

        dispatchOne(changeTitle("Shitter"))
        dispatchTwo(changeTitle("Shotter"))

        const state: any = store.getState();
        expect(state.atomicStore.title).toEqual("Shitter")
        expect(state.otherAtomicStore.title).toEqual("Shotter")
    })

})