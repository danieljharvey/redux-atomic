import { createStore, combineReducers } from 'redux'
import { AtomicAction, createAtomic, REDUX_ATOMIC_ACTION, generateKey } from './index'

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
/*
const actions1 = atomic1.exporter({
    increment,
    changeTitle
})
*/
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
            type: generateKey(atomic1.name, "changeTitle"),
            meta: {
                id: REDUX_ATOMIC_ACTION,
                key: atomic1.key,
                change: changeTitle("horse")
            }
        }
        expect(JSON.stringify(atomic1.createAction(changeTitle("horse"), 'changeTitle'))).toBe(JSON.stringify(expected))
    })

    it.skip('uses exported actions directly with dispatch', () => {
        let store = createStore(sampleApp)
        console.log(actions1)
        store.dispatch(actions1.changeTitle("Shitter"))

        const state: any = store.getState();
        expect(state.atomicOne.title).toEqual("Shitter")
    })

    it('composes', () => {
        const addWord = (word: string) => (toString: string): string => {
            return toString + word
        }
        expect(addWord('drop')('slop')).toEqual('slopdrop')
        const wrappedAddWord = (...stuff: any[]) => {
            const prepped = addWord(...stuff)
            return {
                title: 'hey',
                func: prepped
            }
        }
        const expected = {
            title: "hey",
            func: addWord('drop')
        }
        expect(JSON.stringify(wrappedAddWord('drop'))).toEqual(JSON.stringify(expected))
        expect(wrappedAddWord('drop').func('slop')).toEqual('slopdrop')


        const wrapperMaker = (func: any) => (...stuff: any[]) => {
            const prepped = func(...stuff)
            return {
                title: 'hey',
                func: prepped
            }
        }

        expect(JSON.stringify(wrapperMaker(addWord)('drop'))).toEqual(JSON.stringify(expected))
        expect(wrapperMaker(addWord)('drop').func('slop')).toEqual('slopdrop')

    })
})