# Redux Atomic

## "Give Those Typing Hands A Break" or "It's Basically Mapping Functions Over A Reducer" or "Now You Must Rewrite All Your Code Like This"

### What?

Here is a library for helping you type less by replacing separate actions/reducers in Redux with combined functions that map over a piece of state to change it.

### Like magic?

Nah, it's still doing the normal redux stuff under the hood, and you can name the actions so you can see what's going on in dev tools.

### How?

Available from your favourite terminal with `npm install redux-atomic`

Then type something like this into a text editor or similar:

```typescript

// niceReducer.ts

import { createReducer } from 'redux-atomic'

const initialState: number = 0;

const { reducer, wrap } = createReducer(initialState)

const inc = (howMuch: number) => (state: number): number => state + howMuch

const dec = (howMuch: number) => (state: number): number => state - howMuch

export numberReducer = reducer

export actions = {
    inc: wrap(inc),
    dec: wrap(dec),
}

```

This reducer can then be connected to others however you like to do that...

```typescript

// store.ts

import { numberReducer } from 'niceReducer'
import { someOtherTerribleReducer } from 'awfulFile'

const appReducers = combineReducers({
    numbers: numberReducer,
    otherStuff: someOtherTerribleReducer
})

```

And the actions can be connected to a component something like this...

```typescript

// connectorComponent.ts

import { actions } from 'niceReducer'

const mapDispatchToProps = (dispatch) => {
    inc: dispatch(actions.inc),
    dec: dispatch(actions.dec)
}

```

### Why though? 

I mean, really, why anything?

But sure, why this? Am I supposed to rewrite my whole app now?

(short, answer, no)

Redux is pretty great. It does three things really well:

1. Keeps all state in an auditable place
2. Allows that state to be modified in a consistent auditable fashion
3. Allows a single action to be fired that can make changes across many reducers

However, in my (by no means comprehensive) experience I have found that in most apps, there is a lot of call for 1 and 2 and only occasional need for 3. Although a few one-to-many action-to-state-change situations happen, most action-to-state-change relations are one-to-one and don't need wrapping into global actions.

And that's great, because writing separate sets of functions for actions and reducers is the major cause of boilerplate RSI in Redux. If we don't need the full power of Redux for most stuff, then why use it?

Let's look at a code example for a basic reducer with actions in the full-fat Redux style.

```typescript

const MAKE_THE_NUMBER_BIGGER = "someSortOf.NameSpace.MAKE_THE_NUMBER_BIGGER"
const MAKE_THE_NUMBER_SMALLER = "someSortOf.NameSpace.MAKE_THE_NUMBER_SMALLER"
const CHANGE_THE_NAME = "someSortOf.NameSpace.CHANGE_THE_NAME"

interface NumberBiggener {
    type: typeof MAKE_THE_NUMBER_BIGGER
    payload: {
        howMuch: number
    }
}

const numberBiggener = (howMuch: number) => ({
    type: MAKE_THE_NUMBER_BIGGER,
    payload: {
        howMuch
    }
})

interface NumberSmallener {
    type: typeof MAKE_THE_NUMBER_SMALLER
    payload: {
        howMuch: number
    }
}

const numberSmallener = (howMuch: number) => ({
    type: MAKE_THE_NUMBER_SMALLER,
    payload: {
        howMuch
    }
})

interface NameChanger {
    type: typeof CHANGE_THE_NAME,
    payload: {
        title: string
    }
}

const nameChanged = (title: string) => ({
    type: CHANGE_THE_NAME,
    payload: {
        title
    }
})

interface NiceState {
    title: string
    number: number
}

const initialState: NiceState = {
    title: "",
    number: 0
}

function numberReducer(state: NiceState, action: NumberBiggener | NumberSmallener ): NiceState {
  switch (action.type) {
      case MAKE_THE_NUMBER_BIGGER:
        return {
            ...state,
            number: state.number + action.payload.howMuch
        }
    
    case MAKE_THE_NUMBER_SMALLER:
        return {
            ...state,
            number: state.number - action.payload.howMuch
        }
          
    case CHANGE_THE_NAME:
        return {
            ...state,
            title: action.payload.title
        }
    
    default:
        return state;
  }
}

export numberReducer;
export actions = {
    numberBiggener,
    numberSmallener,
    nameChanger
}

```

I'm trying to be fair and not make some exagerated stuff, and typings do make stuff more verbose, but that's still at lot of stuff. With a few more actions you'd be irresponsible not to move the action creators and reducer into separate folders, and then all the constants need exporting/importing etc etc. 

### It doesn't have to be like this

Using the Redux Atomic style looks more like this:

```typescript

import { createReducer } from 'redux-atomic'

interface NiceState {
    title: string
    number: number
}

const initialState: NiceState = {
    title: "",
    number: 0
}

const reducerName = "NiceReducer"

// 'niceReducer' here is a title that is used to create meaningful action names
// so you can see what's going on in Redux Dev Tools
const { reducer, wrap } = createReducer(initialState, niceReducer)

const increment = (amount: number) => (state: NiceState): NiceState => 
    ({
        ...state,
        state.number + howMuch
    })

const decrement = (amount: number) => (state: NiceState): NiceState => 
    ({
        ...state,
        state.number - howMuch
    })

const rename = (name: string) => (state: NiceState): NiceState =>
    ({
        ...state,
        title: name
    })
    
export numberReducer = reducer

export actions = {
    increment: wrap(increment),
    decrement: wrap(decrement),
    rename: wrap(rename, "Rename")
}

```

### That wasn't much code

Totally. And it works the same, the exported actions can be dispatched like normal, and the reducer can be combined like any other. The state isn't held in any particularly magical way, so is accessed like any other.

### But what about actions that do trigger changes in multiple reducers?

The second argument of the `wrap` function can be used to specify an action name, and any parameters passed to the function will be passed to the `payload` of the action as an array. For instance:

```typescript

const { reducer, wrap } = createReducer(initialState, niceReducer)

const changeAmountAndTitle = (amount: number, title: string) => (state) => 
    ({
        ...state,
        amount: amount,
        title: title
    })

const CHANGE_AMOUNT_AND_TITLE = 'CHANGE_AMOUNT_AND_TITLE'

export actions = {
    changeAmountAndTitle: wrap(changeAmountAndTitle, CHANGE_AMOUNT_AND_TITLE)
}

```

Let's say that we dispatched `changeAmountAndTitle(100, "fried eggs")`. The dispatched action, as well as triggering the atomic reducer, will fire out an action containing (amongst other things) the following:

```typescript 

{
    type: 'CHANGE_AMOUNT_AND_TITLE',
    payload: [100, "fried eggs"]
}

```

This data can be picked up by other reducers or used for auditing in Redux Dev Tools.

### Anything else?

Building your reducers in this way means you can have multiple instances of them that don't interact with one another. So long as each one uses the `wrap()` function returned by the right `createAtomic()` call you can have 100 different reducers all happily ignoring one another without any hard work.

### Testing

As these are just functions, testing them is pretty straightforward. Jest tests for the above look something like this:

```typescript

const initialState = {
    title: "Yeah",
    number: 100
}

describe("Redux atomic is OK", () => {
    it("Increments like a professional", () => {
        expect(increment(10)(initialState)).toEqual({title: "Yeah", number: 110})
    })
    it("Decrements like a professional", () => {
        expect(decrement(10)(initialState)).toEqual({title: "Yeah", number: 90})
    })
    it("Renames in an efficient and timely manner", () => {
        expect(rename("Relatable pop culture reference")(initialState)).toEqual({title: "Relatable pop culture reference", number: 100})
    })
})

```

Testing the outcome of a series of actions is as simple as composing them together (using Ramda's compose here but hopefully you get the idea):

```
import { compose } from 'ramda'

const initialState = { title: "blah", number: 0 }
const bunchOfActions = compose(increment(10), decrement(20), rename("Dog"))
const expected = { title: "Dog", number: -10 }

expect(bunchOfActions(initialState)).toEqual(expected)

```

Seems fine? Sure. Most things are.

### Thanks

Thanks to the creators and maintainers of [Redux](https://github.com/reduxjs/redux/), for making a simple sane solution for state management. Thanks [Riku](https://github.com/rikukissa) and [David](https://github.com/ds300) for knowing facts about these sort of things which I stole and used to make the thing better.
