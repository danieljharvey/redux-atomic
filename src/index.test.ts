import { createStore, combineReducers } from 'redux'
import { AtomicAction, createAtomic, REDUX_ATOMIC_ACTION } from './index'

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

const atomic1 = createAtomic(initialAtomicState)
const atomic2 = createAtomic(initialAtomicState)

const sampleApp = combineReducers<any>({
    atomicOne: atomic1.reducer,
    atomicTwo: atomic2.reducer
})

const increment = () => (state: AtomicState): AtomicState => {
    return {
        ...state,
        counter: state.counter + 1
    }
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
        const changeTitleWrap = atomic1.wrap(changeTitle)
        store.dispatch(changeTitleWrap("Shitter"))
        const state: any = store.getState()
        expect(state.atomicOne.title).toEqual("Shitter")
    })

    it("Similar stores don't mess with one another", () => {
        let store = createStore(sampleApp)

        const changeTitleWrap1 = atomic1.wrap(changeTitle)
        const changeTitleWrap2 = atomic2.wrap(changeTitle)
        store.dispatch(changeTitleWrap1("Shitter"))
        store.dispatch(changeTitleWrap2("Shotter"))

        const state: any = store.getState();
        expect(state.atomicOne.title).toEqual("Shitter")
        expect(state.atomicTwo.title).toEqual("Shotter")
    })
})

interface StateMate {
    number: number
    string: string
}

const initialState: StateMate = {
    number: 0,
    string: ""
}

const zero = () => (state: StateMate): StateMate => {
    return {
        ...state,
        number: state.number + 1
    }
}

const one = (num: number) => (state: StateMate): StateMate => {
    return {
        ...state,
        number: state.number + num
    }
}

const two = (str: string, num: number) => (state: StateMate): StateMate => {
    return {
        ...state,
        string: str,
        number: num
    }
}

const three = (str: string, str2: string, num: number) => (state: StateMate): StateMate => {
    return {
        ...state,
        string: str + str2,
        number: num
    }
}

const { wrap, reducer } = createAtomic('test')

describe("blah", () => {
    it("zero arity", () => {
        const wZero = wrap(zero, "zero");
        const oZero = wZero().payload.meta.change(initialState)
        expect(oZero).toEqual({
            ...initialState,
            number: 1
        })
    })
    it('single arity', () => {
        const wOne = wrap(one, "one");
        const oOne = wOne(100).payload.meta.change(initialState)
        expect(oOne).toEqual({
            ...initialState,
            number: 100
        })
    })
    it('double arity', () => {
        const wTwo = wrap(two, "two");
        const oTwo = wTwo("dog", 100).payload.meta.change(initialState)
        expect(oTwo).toEqual({
            ...initialState,
            number: 100,
            string: "dog"
        })
    })
    it('third arity', () => {
        const wThree = wrap(three, 'three')
        const oThree = wThree("dog", "face", 666).payload.meta.change(initialState)
        expect(oThree).toEqual({
            ...initialState,
            number: 666,
            string: "dogface"
        })
    })
})